/**
 * Company Controller
 * Handles HTTP requests for Company operations
 */

import { Request, Response } from 'express';
import {
    createCompanyService,
    getUserCompaniesService,
    getCompanyByIdService,
    updateCompanyService,
    deleteCompanyService,
} from '../../../services/accounting/company.service';

// ============================================
// CREATE COMPANY
// ============================================

/**
 * POST /api/accounting/companies
 * Create a new company
 */
export const createCompanyController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User not authenticated',
            });
        }

        const {
            name,
            legalName,
            displayName,
            businessType,
            industry,
            gstin,
            pan,
            tan,
            cin,
            email,
            phone,
            website,
            addressLine1,
            addressLine2,
            city,
            state,
            country,
            pincode,
            baseCurrency,
            baseCurrencySymbol,
            baseCurrencyFormalName,
            booksBeginningFrom,
            enableGST,
            enableTDS,
            enableInventory,
        } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Company name is required',
            });
        }

        if (!booksBeginningFrom) {
            return res.status(400).json({
                success: false,
                message: 'Books beginning date is required',
            });
        }

        const result = await createCompanyService(userId, {
            name,
            legalName,
            displayName,
            businessType,
            industry,
            gstin,
            pan,
            tan,
            cin,
            email,
            phone,
            website,
            addressLine1,
            addressLine2,
            city,
            state,
            country,
            pincode,
            baseCurrency,
            baseCurrencySymbol,
            baseCurrencyFormalName,
            booksBeginningFrom: new Date(booksBeginningFrom),
            enableGST,
            enableTDS,
            enableInventory,
        });

        return res.status(201).json({
            success: true,
            message: result.message,
            data: {
                company: {
                    id: result.company.id,
                    name: result.company.name,
                    displayName: result.company.displayName,
                    businessType: result.company.businessType,
                    isActive: result.company.isActive,
                },
                financialYear: {
                    id: result.financialYear.id,
                    yearName: result.financialYear.yearName,
                    startDate: result.financialYear.startDate,
                    endDate: result.financialYear.endDate,
                },
            },
        });
    } catch (error: any) {
        console.error('Error creating company:', error);

        // Handle unique constraint violation
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: 'A company with this name already exists',
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create company',
        });
    }
};

// ============================================
// GET COMPANIES
// ============================================

/**
 * GET /api/accounting/companies
 * Get all companies for the current user
 */
export const getCompaniesController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User not authenticated',
            });
        }

        const companies = await getUserCompaniesService(userId);

        return res.status(200).json({
            success: true,
            message: 'Companies retrieved successfully',
            data: companies,
        });
    } catch (error: any) {
        console.error('Error getting companies:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get companies',
        });
    }
};

/**
 * GET /api/accounting/companies/:id
 * Get company details by ID
 */
export const getCompanyByIdController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User not authenticated',
            });
        }

        const company = await getCompanyByIdService(id, userId);

        return res.status(200).json({
            success: true,
            message: 'Company retrieved successfully',
            data: company,
        });
    } catch (error: any) {
        console.error('Error getting company:', error);

        if (error.message.includes('Access denied') || error.message.includes('Unauthorized')) {
            return res.status(403).json({
                success: false,
                message: error.message,
            });
        }

        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get company',
        });
    }
};

// ============================================
// UPDATE COMPANY
// ============================================

/**
 * PUT /api/accounting/companies/:id
 * Update company details
 */
export const updateCompanyController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User not authenticated',
            });
        }

        const updateData = req.body;

        const company = await updateCompanyService(id, userId, updateData);

        return res.status(200).json({
            success: true,
            message: 'Company updated successfully',
            data: company,
        });
    } catch (error: any) {
        console.error('Error updating company:', error);

        if (error.message.includes('Access denied') || error.message.includes('Unauthorized')) {
            return res.status(403).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update company',
        });
    }
};

// ============================================
// DELETE COMPANY
// ============================================

/**
 * DELETE /api/accounting/companies/:id
 * Delete a company (soft delete)
 */
export const deleteCompanyController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User not authenticated',
            });
        }

        await deleteCompanyService(id, userId);

        return res.status(200).json({
            success: true,
            message: 'Company deleted successfully',
        });
    } catch (error: any) {
        console.error('Error deleting company:', error);

        if (error.message.includes('Access denied') || error.message.includes('Unauthorized')) {
            return res.status(403).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete company',
        });
    }
};

