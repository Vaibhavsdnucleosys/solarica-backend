/**
 * Unit Service
 * Business logic for managing Units of Measurement (Inventory Masters)
 */

import {
    createUnitModel,
    getUnitByIdModel,
    getUnitsByCompanyIdModel,
    searchUnitsModel,
    findUnitBySymbolModel,
    updateUnitModel,
    deleteUnitModel,
    canDeleteUnitModel,
    getSimpleUnitsModel,
    isUnitUsedInCompound,
    convertCompoundQuantity,
} from '../../api/model/inventory';
import { validateCompanyAccessService } from '../accounting/company.service';
import { INVENTORY_ERRORS } from '../../utils/inventory/constants';

/**
 * Get all units for a company
 */
export const getUnitsService = async (companyId: string, userId: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    return await getUnitsByCompanyIdModel(companyId);
};

/**
 * Get a single unit by ID
 */
export const getUnitByIdService = async (unitId: string, companyId: string, userId: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    const unit = await getUnitByIdModel(unitId);
    if (!unit) {
        throw new Error(INVENTORY_ERRORS.UNIT_NOT_FOUND);
    }

    // Ensure unit belongs to the company
    if (unit.companyId !== companyId) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    return unit;
};

/**
 * Search units (typeahead for sidebar)
 */
export const searchUnitsService = async (companyId: string, userId: string, query: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    return await searchUnitsModel(companyId, query);
};

/**
 * Validate if a symbol is available (duplicate check)
 */
export const validateSymbolService = async (
    companyId: string,
    userId: string,
    symbol: string,
    excludeUnitId?: string
) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    const existing = await findUnitBySymbolModel(companyId, symbol);

    // If found and it's not the same unit being edited, it's a duplicate
    if (existing && existing.id !== excludeUnitId) {
        return { available: false, message: `Symbol "${symbol}" is already in use.` };
    }

    return { available: true, message: `Symbol "${symbol}" is available.` };
};

/**
 * Create a new unit
 */
export const createUnitService = async (
    companyId: string,
    userId: string,
    data: {
        symbol: string;
        formalName: string;
        type?: string;
        uqc?: string;
        decimalPlaces?: number;
        firstUnitId?: string;
        secondUnitId?: string;
        conversionFactor?: number;
    }
) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    // Validate required fields
    if (!data.symbol || !data.symbol.trim()) {
        throw new Error(INVENTORY_ERRORS.UNIT_SYMBOL_REQUIRED);
    }
    if (!data.formalName || !data.formalName.trim()) {
        throw new Error(INVENTORY_ERRORS.UNIT_FORMAL_NAME_REQUIRED);
    }

    // Check for duplicate symbol (case-insensitive)
    const existingUnit = await findUnitBySymbolModel(companyId, data.symbol.trim());
    if (existingUnit) {
        throw new Error(INVENTORY_ERRORS.UNIT_SYMBOL_DUPLICATE);
    }

    // Validate decimal places
    if (data.decimalPlaces !== undefined) {
        if (data.decimalPlaces < 0 || data.decimalPlaces > 4) {
            throw new Error(INVENTORY_ERRORS.UNIT_INVALID_DECIMAL_PLACES);
        }
    }

    // Compound unit validation
    if (data.type === 'Compound') {
        if (!data.firstUnitId || !data.secondUnitId) {
            throw new Error(INVENTORY_ERRORS.COMPOUND_UNITS_REQUIRED);
        }
        if (data.firstUnitId === data.secondUnitId) {
            throw new Error(INVENTORY_ERRORS.COMPOUND_UNITS_SAME);
        }
        if (!data.conversionFactor || data.conversionFactor <= 0) {
            throw new Error(INVENTORY_ERRORS.COMPOUND_CONVERSION_INVALID);
        }

        // Validate that both sub-units exist and are Simple type
        const firstUnit = await getUnitByIdModel(data.firstUnitId);
        if (!firstUnit || firstUnit.companyId !== companyId || firstUnit.type !== 'Simple') {
            throw new Error(INVENTORY_ERRORS.COMPOUND_FIRST_UNIT_INVALID);
        }
        const secondUnit = await getUnitByIdModel(data.secondUnitId);
        if (!secondUnit || secondUnit.companyId !== companyId || secondUnit.type !== 'Simple') {
            throw new Error(INVENTORY_ERRORS.COMPOUND_SECOND_UNIT_INVALID);
        }
    }

    return await createUnitModel({
        companyId,
        type: data.type,
        symbol: data.symbol.trim(),
        formalName: data.formalName.trim(),
        uqc: data.uqc,
        decimalPlaces: data.decimalPlaces,
        firstUnitId: data.type === 'Compound' ? data.firstUnitId : undefined,
        secondUnitId: data.type === 'Compound' ? data.secondUnitId : undefined,
        conversionFactor: data.type === 'Compound' ? data.conversionFactor : undefined,
        createdBy: userId,
    });
};

/**
 * Update an existing unit
 */
export const updateUnitService = async (
    unitId: string,
    companyId: string,
    userId: string,
    data: {
        symbol?: string;
        formalName?: string;
        uqc?: string;
        decimalPlaces?: number;
        type?: string;
        firstUnitId?: string | null;
        secondUnitId?: string | null;
        conversionFactor?: number;
    }
) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    // Ensure unit exists and belongs to this company
    const existingUnit = await getUnitByIdModel(unitId);
    if (!existingUnit) {
        throw new Error(INVENTORY_ERRORS.UNIT_NOT_FOUND);
    }
    if (existingUnit.companyId !== companyId) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    // If symbol is being changed, check for duplicate
    if (data.symbol && data.symbol.trim() !== existingUnit.symbol) {
        const duplicate = await findUnitBySymbolModel(companyId, data.symbol.trim());
        if (duplicate && duplicate.id !== unitId) {
            throw new Error(INVENTORY_ERRORS.UNIT_SYMBOL_DUPLICATE);
        }
    }

    // Validate decimal places
    if (data.decimalPlaces !== undefined) {
        if (data.decimalPlaces < 0 || data.decimalPlaces > 4) {
            throw new Error(INVENTORY_ERRORS.UNIT_INVALID_DECIMAL_PLACES);
        }
    }

    // Compound unit validation on update
    const effectiveType = data.type || existingUnit.type;
    if (effectiveType === 'Compound') {
        const firstId = data.firstUnitId !== undefined ? data.firstUnitId : existingUnit.firstUnitId;
        const secondId = data.secondUnitId !== undefined ? data.secondUnitId : existingUnit.secondUnitId;
        const factor = data.conversionFactor !== undefined ? data.conversionFactor : existingUnit.conversionFactor;

        if (!firstId || !secondId) {
            throw new Error(INVENTORY_ERRORS.COMPOUND_UNITS_REQUIRED);
        }
        if (firstId === secondId) {
            throw new Error(INVENTORY_ERRORS.COMPOUND_UNITS_SAME);
        }
        if (!factor || factor <= 0) {
            throw new Error(INVENTORY_ERRORS.COMPOUND_CONVERSION_INVALID);
        }
    }

    // Warn if decimal places changed and items exist (business logic note)
    if (
        data.decimalPlaces !== undefined &&
        data.decimalPlaces !== existingUnit.decimalPlaces &&
        existingUnit._count.StockItem > 0
    ) {
        console.warn(
            `[Unit Service] Warning: Decimal places changed for unit "${existingUnit.symbol}" which has ${existingUnit._count.StockItem} stock item(s).`
        );
    }

    return await updateUnitModel(unitId, {
        symbol: data.symbol?.trim(),
        formalName: data.formalName?.trim(),
        uqc: data.uqc,
        decimalPlaces: data.decimalPlaces,
        type: data.type,
        firstUnitId: data.firstUnitId,
        secondUnitId: data.secondUnitId,
        conversionFactor: data.conversionFactor,
        updatedBy: userId,
    });
};

/**
 * Delete a unit (soft delete)
 */
export const deleteUnitService = async (unitId: string, companyId: string, userId: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    // Ensure unit exists and belongs to this company
    const existingUnit = await getUnitByIdModel(unitId);
    if (!existingUnit) {
        throw new Error(INVENTORY_ERRORS.UNIT_NOT_FOUND);
    }
    if (existingUnit.companyId !== companyId) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    // Business validation: can't delete if stock items use this unit
    const { canDelete, reason } = await canDeleteUnitModel(unitId);
    if (!canDelete) {
        throw new Error(reason || INVENTORY_ERRORS.UNIT_HAS_ITEMS);
    }

    return await deleteUnitModel(unitId);
};

// ============================================
// COMPOUND UNIT SERVICES
// ============================================

/**
 * Get only simple units (for compound unit creation dropdowns)
 */
export const getSimpleUnitsService = async (companyId: string, userId: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    return await getSimpleUnitsModel(companyId);
};

/**
 * Convert a quantity using compound unit conversion factor
 * Example: convertQuantity(30, unitId) where unit is "1 Box = 12 Nos"
 * Returns: { firstQty: 2, secondQty: 6, firstSymbol: "Box", secondSymbol: "Nos", display: "2 Box 6 Nos" }
 */
export const convertQuantityService = async (quantity: number, unitId: string) => {
    const unit = await getUnitByIdModel(unitId);
    if (!unit) {
        throw new Error(INVENTORY_ERRORS.UNIT_NOT_FOUND);
    }

    if (unit.type !== 'Compound' || !unit.conversionFactor) {
        return {
            type: 'Simple',
            quantity,
            symbol: unit.symbol,
            display: `${quantity} ${unit.symbol}`,
        };
    }

    const { firstQty, secondQty } = convertCompoundQuantity(quantity, unit.conversionFactor);
    const firstSymbol = unit.firstUnit?.symbol || '';
    const secondSymbol = unit.secondUnit?.symbol || '';

    let display = '';
    if (firstQty > 0) display += `${firstQty} ${firstSymbol}`;
    if (secondQty > 0) display += `${firstQty > 0 ? ' ' : ''}${secondQty} ${secondSymbol}`;
    if (!display) display = `0 ${secondSymbol}`;

    return {
        type: 'Compound',
        firstQty,
        secondQty,
        firstSymbol,
        secondSymbol,
        conversionFactor: unit.conversionFactor,
        display,
    };
};

