/**
 * Unit Service - CRUD for inventory/measurement units (Tally-style)
 */

import prisma from '../../config/prisma';

export const createUnit = async (
    companyId: string,
    data: { type?: string; symbol: string; formalName?: string; uqc?: string; decimalPlaces?: number }
) => {
    const existing = await prisma.unit.findUnique({
        where: { companyId_symbol: { companyId, symbol: data.symbol.trim() } },
    });
    if (existing) {
        throw new Error(`Unit with symbol '${data.symbol}' already exists`);
    }
    return prisma.unit.create({
        data: {
            companyId,
            type: data.type || 'Simple',
            symbol: data.symbol.trim(),
            formalName: data.formalName?.trim() || '',
            uqc: data.uqc || 'Not Applicable',
            decimalPlaces: data.decimalPlaces ?? 0,
        },
    });
};

export const getUnitsByCompanyId = async (companyId: string, activeOnly = true) => {
    return prisma.unit.findMany({
        where: { companyId, ...(activeOnly ? { isActive: true } : {}) },
        orderBy: { symbol: 'asc' },
    });
};

export const getUnitById = async (companyId: string, id: string) => {
    const unit = await prisma.unit.findFirst({ where: { id, companyId } });
    if (!unit) throw new Error('Unit not found');
    return unit;
};

export const deleteUnit = async (companyId: string, id: string) => {
    const unit = await prisma.unit.findFirst({ where: { id, companyId } });
    if (!unit) throw new Error('Unit not found');
    return prisma.unit.update({
        where: { id },
        data: { isActive: false },
    });
};

export const updateUnit = async (
    companyId: string,
    id: string,
    data: { type?: string; symbol?: string; formalName?: string; uqc?: string; decimalPlaces?: number }
) => {
    const unit = await prisma.unit.findFirst({ where: { id, companyId } });
    if (!unit) throw new Error('Unit not found');
    if (data.symbol !== undefined && data.symbol !== unit.symbol) {
        const existing = await prisma.unit.findUnique({
            where: { companyId_symbol: { companyId, symbol: data.symbol.trim() } },
        });
        if (existing) throw new Error(`Unit with symbol '${data.symbol}' already exists`);
    }
    return prisma.unit.update({
        where: { id },
        data: {
            ...(data.type !== undefined && { type: data.type }),
            ...(data.symbol !== undefined && { symbol: data.symbol.trim() }),
            ...(data.formalName !== undefined && { formalName: data.formalName?.trim() || '' }),
            ...(data.uqc !== undefined && { uqc: data.uqc }),
            ...(data.decimalPlaces !== undefined && { decimalPlaces: data.decimalPlaces }),
        },
    });
};

