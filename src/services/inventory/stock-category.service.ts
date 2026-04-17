/**
 * Stock Category Service
 * Business logic for managing Stock Categories (Inventory Masters)
 */

import {
    createStockCategoryModel,
    getStockCategoryByIdModel,
    getStockCategoriesByCompanyIdModel,
    searchStockCategoriesModel,
    findStockCategoryByNameModel,
    updateStockCategoryModel,
    deleteStockCategoryModel,
    canDeleteStockCategoryModel,
    checkCategoryCircularReferenceModel,
} from '../../api/model/inventory/stock-category.model';
import { validateCompanyAccessService } from '../accounting/company.service';
import { INVENTORY_ERRORS } from '../../utils/inventory/constants';

// Get all stock categories for a company
export const getStockCategoriesService = async (companyId: string, userId: string) => {
    await validateCompanyAccessService(companyId, userId);
    return await getStockCategoriesByCompanyIdModel(companyId);
};

// Get a single stock category by ID
export const getStockCategoryByIdService = async (categoryId: string, companyId: string, userId: string) => {
    await validateCompanyAccessService(companyId, userId);

    const category = await getStockCategoryByIdModel(categoryId);
    if (!category) {
        throw new Error(INVENTORY_ERRORS.CATEGORY_NOT_FOUND);
    }

    // Verify category belongs to the company
    if (category.companyId !== companyId) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    return category;
};

// Search stock categories (typeahead)
export const searchStockCategoriesService = async (companyId: string, userId: string, query: string) => {
    await validateCompanyAccessService(companyId, userId);
    return await searchStockCategoriesModel(companyId, query);
};

// Validate if a name is available (duplicate check)
export const validateCategoryNameService = async (
    companyId: string,
    userId: string,
    name: string,
    excludeCategoryId?: string
) => {
    await validateCompanyAccessService(companyId, userId);

    const existing = await findStockCategoryByNameModel(companyId, name);

    if (existing && existing.id !== excludeCategoryId) {
        return { isAvailable: false, message: INVENTORY_ERRORS.CATEGORY_NAME_DUPLICATE };
    }

    return { isAvailable: true };
};

// Create a new stock category
export const createStockCategoryService = async (
    companyId: string,
    userId: string,
    data: {
        name: string;
        alias?: string;
        underId?: string;
    }
) => {
    await validateCompanyAccessService(companyId, userId);

    // Validate required fields
    if (!data.name || data.name.trim() === '') {
        throw new Error(INVENTORY_ERRORS.CATEGORY_NAME_REQUIRED);
    }

    // Check for duplicate name
    const existing = await findStockCategoryByNameModel(companyId, data.name);
    if (existing) {
        throw new Error(INVENTORY_ERRORS.CATEGORY_NAME_DUPLICATE);
    }

    // If parent specified, validate it exists and belongs to the same company
    if (data.underId) {
        const parent = await getStockCategoryByIdModel(data.underId);
        if (!parent) {
            throw new Error('Parent stock category not found.');
        }
        if (parent.companyId !== companyId) {
            throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
        }
    }

    return await createStockCategoryModel({
        companyId,
        name: data.name.trim(),
        alias: data.alias?.trim(),
        underId: data.underId || undefined,
        createdBy: userId,
    });
};

// Update an existing stock category
export const updateStockCategoryService = async (
    categoryId: string,
    companyId: string,
    userId: string,
    data: {
        name?: string;
        alias?: string;
        underId?: string;
    }
) => {
    await validateCompanyAccessService(companyId, userId);

    // Verify category exists
    const existing = await getStockCategoryByIdModel(categoryId);
    if (!existing) {
        throw new Error(INVENTORY_ERRORS.CATEGORY_NOT_FOUND);
    }
    if (existing.companyId !== companyId) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    // Check for duplicate name if name is being changed
    if (data.name && data.name.trim() !== existing.name) {
        const duplicate = await findStockCategoryByNameModel(companyId, data.name);
        if (duplicate && duplicate.id !== categoryId) {
            throw new Error(INVENTORY_ERRORS.CATEGORY_NAME_DUPLICATE);
        }
    }

    // Check for circular reference if parent is being changed
    if (data.underId && data.underId !== existing.underId) {
        const isCircular = await checkCategoryCircularReferenceModel(categoryId, data.underId);
        if (isCircular) {
            throw new Error(INVENTORY_ERRORS.CATEGORY_HAS_CHILDREN);
        }
    }

    return await updateStockCategoryModel(categoryId, {
        name: data.name?.trim(),
        alias: data.alias?.trim(),
        underId: data.underId,
        updatedBy: userId,
    });
};

// Delete a stock category (soft delete)
export const deleteStockCategoryService = async (categoryId: string, companyId: string, userId: string) => {
    await validateCompanyAccessService(companyId, userId);

    // Verify category exists
    const existing = await getStockCategoryByIdModel(categoryId);
    if (!existing) {
        throw new Error(INVENTORY_ERRORS.CATEGORY_NOT_FOUND);
    }
    if (existing.companyId !== companyId) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    // Check if it can be deleted
    const { canDelete, reason } = await canDeleteStockCategoryModel(categoryId);
    if (!canDelete) {
        throw new Error(reason || 'Cannot delete this stock category.');
    }

    return await deleteStockCategoryModel(categoryId);
};

