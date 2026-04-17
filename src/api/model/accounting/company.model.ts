/**
 * Company Model
 * Database operations for Company entity
 */

import prisma from '../../../config/prisma';
import { BusinessType, CompanyRole } from '@prisma/client';

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Create a new company
 */
export const createCompanyModel = async (
    data: {
        name: string;
        legalName?: string;
        displayName: string;
        businessType?: BusinessType;
        industry?: string;
        gstin?: string;
        pan?: string;
        tan?: string;
        cin?: string;
        email?: string;
        phone?: string;
        website?: string;
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
        baseCurrency?: string;
        baseCurrencySymbol?: string;
        baseCurrencyFormalName?: string;
        booksBeginningFrom: Date;
        enableGST?: boolean;
        enableTDS?: boolean;
        enableInventory?: boolean;
        ownerId: string;
    },
    tx?: any
) => {
    const client = tx || prisma;
    return await client.company.create({
        data: {
            name: data.name,
            legalName: data.legalName,
            displayName: data.displayName,
            businessType: data.businessType || 'PRIVATE_LIMITED',
            industry: data.industry,
            gstin: data.gstin,
            pan: data.pan,
            tan: data.tan,
            cin: data.cin,
            email: data.email,
            phone: data.phone,
            website: data.website,
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            city: data.city,
            state: data.state,
            country: data.country || 'India',
            pincode: data.pincode,
            baseCurrency: data.baseCurrency || 'INR',
            baseCurrencySymbol: data.baseCurrencySymbol || '₹',
            baseCurrencyFormalName: data.baseCurrencyFormalName || 'INR',
            booksBeginningFrom: data.booksBeginningFrom,
            enableGST: data.enableGST ?? true,
            enableTDS: data.enableTDS ?? false,
            enableInventory: data.enableInventory ?? false,
            ownerId: data.ownerId,
            isActive: true,
            isLocked: false,
        },
    });
};

/**
 * Add a user to a company
 */
export const addCompanyUserModel = async (
    companyId: string,
    userId: string,
    role: CompanyRole = 'OWNER',
    tx?: any
) => {
    const client = tx || prisma;
    return await client.companyUser.create({
        data: {
            companyId,
            userId,
            role,
            isActive: true,
        },
    });
};

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get company by ID
 */
export const getCompanyByIdModel = async (companyId: string) => {
    return await prisma.company.findUnique({
        where: { id: companyId },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            financialYears: {
                where: { isActive: true },
                take: 1,
            },
            _count: {
                select: {
                    ledgers: true,
                    vouchers: true,
                    users: true,
                },
            },
        },
    });
};

/**
 * Get all companies for a user (owned + access)
 */
export const getCompaniesByUserIdModel = async (userId: string) => {
    return await prisma.company.findMany({
        where: {
            OR: [
                { ownerId: userId },
                {
                    users: {
                        some: {
                            userId: userId,
                            isActive: true,
                        },
                    },
                },
            ],
            isActive: true,
        },
        include: {
            financialYears: {
                where: { isActive: true },
                take: 1,
            },
            users: {
                where: { userId: userId },
                select: {
                    role: true,
                },
            },
            _count: {
                select: {
                    vouchers: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

/**
 * Check if user has access to a company
 */
export const checkUserCompanyAccessModel = async (
    companyId: string,
    userId: string
) => {
    const company = await prisma.company.findFirst({
        where: {
            id: companyId,
            OR: [
                { ownerId: userId },
                {
                    users: {
                        some: {
                            userId: userId,
                            isActive: true,
                        },
                    },
                },
            ],
        },
    });

    return !!company;
};

/**
 * Get user's role in a company
 */
export const getUserRoleInCompanyModel = async (
    companyId: string,
    userId: string
): Promise<CompanyRole | null> => {
    // Check if owner
    const company = await prisma.company.findFirst({
        where: {
            id: companyId,
            ownerId: userId,
        },
    });

    if (company) return 'OWNER';

    // Check CompanyUser
    const companyUser = await prisma.companyUser.findUnique({
        where: {
            companyId_userId: {
                companyId,
                userId,
            },
        },
    });

    return companyUser?.role || null;
};

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update company details
 */
export const updateCompanyModel = async (
    companyId: string,
    data: {
        name?: string;
        legalName?: string;
        displayName?: string;
        businessType?: BusinessType;
        industry?: string;
        gstin?: string;
        pan?: string;
        tan?: string;
        cin?: string;
        email?: string;
        phone?: string;
        website?: string;
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        state?: string;
        pincode?: string;
        enableGST?: boolean;
        enableTDS?: boolean;
        enableInventory?: boolean;
    }
) => {
    return await prisma.company.update({
        where: { id: companyId },
        data,
    });
};

/**
 * Lock/Unlock a company
 */
export const toggleCompanyLockModel = async (
    companyId: string,
    isLocked: boolean
) => {
    return await prisma.company.update({
        where: { id: companyId },
        data: { isLocked },
    });
};

// ============================================
// DELETE OPERATIONS
// ============================================

/**
 * Soft delete a company (set isActive = false)
 */
export const deleteCompanyModel = async (companyId: string) => {
    return await prisma.company.update({
        where: { id: companyId },
        data: { isActive: false },
    });
};

/**
 * Remove user access from company
 */
export const removeUserFromCompanyModel = async (
    companyId: string,
    userId: string
) => {
    return await prisma.companyUser.delete({
        where: {
            companyId_userId: {
                companyId,
                userId,
            },
        },
    });
};

