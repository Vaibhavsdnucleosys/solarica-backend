/**
 * Godown Stock Model
 * Database operations for tracking stock balance per godown per item
 */

import prisma from '../../../config/prisma';

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get all items in a specific godown
 */
export const getStockByGodownModel = async (godownId: string) => {
    return await prisma.godownStock.findMany({
        where: {
            godownId,
            quantity: { gt: 0 },
        },
        include: {
            StockItem: {
                select: {
                    id: true,
                    name: true,
                    alias: true,
                    Unit: { select: { symbol: true } },
                },
            },
        },
        orderBy: {
            StockItem: { name: 'asc' },
        },
    });
};

/**
 * Get all godowns holding a specific item
 */
export const getItemDistributionModel = async (stockItemId: string) => {
    return await prisma.godownStock.findMany({
        where: {
            stockItemId,
            quantity: { gt: 0 },
        },
        include: {
            Godown: {
                select: {
                    id: true,
                    name: true,
                    alias: true,
                    isDefault: true,
                },
            },
        },
        orderBy: {
            Godown: { name: 'asc' },
        },
    });
};

/**
 * Get full godown stock summary for a company (all items × all godowns)
 */
export const getGodownStockSummaryModel = async (companyId: string) => {
    return await prisma.godownStock.findMany({
        where: {
            companyId,
            quantity: { gt: 0 },
        },
        include: {
            StockItem: {
                select: {
                    id: true,
                    name: true,
                    Unit: { select: { symbol: true } },
                },
            },
            Godown: {
                select: {
                    id: true,
                    name: true,
                    isDefault: true,
                },
            },
        },
        orderBy: [
            { Godown: { name: 'asc' } },
            { StockItem: { name: 'asc' } },
        ],
    });
};

/**
 * Get a single godown-stock record (how much of item X is in godown Y)
 */
export const getGodownStockRecordModel = async (stockItemId: string, godownId: string) => {
    return await prisma.godownStock.findUnique({
        where: {
            stockItemId_godownId: {
                stockItemId,
                godownId,
            },
        },
    });
};

// ============================================
// WRITE OPERATIONS
// ============================================

/**
 * Upsert godown stock (create or update stock balance)
 * Used when purchasing stock or setting opening balance
 */
export const upsertGodownStockModel = async (data: {
    companyId: string;
    stockItemId: string;
    godownId: string;
    quantity: number;
    rate: number;
    value: number;
}) => {
    return await prisma.godownStock.upsert({
        where: {
            stockItemId_godownId: {
                stockItemId: data.stockItemId,
                godownId: data.godownId,
            },
        },
        update: {
            quantity: { increment: data.quantity },
            rate: data.rate,
            value: { increment: data.value },
            updatedAt: new Date(),
        },
        create: {
            companyId: data.companyId,
            stockItemId: data.stockItemId,
            godownId: data.godownId,
            quantity: data.quantity,
            rate: data.rate,
            value: data.value,
        },
    });
};

/**
 * Transfer stock between godowns (atomic transaction)
 * Deducts from source, adds to destination
 */
export const transferStockModel = async (data: {
    companyId: string;
    stockItemId: string;
    sourceGodownId: string;
    destinationGodownId: string;
    quantity: number;
    rate: number;
}) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Get source record
        const sourceRecord = await tx.godownStock.findUnique({
            where: {
                stockItemId_godownId: {
                    stockItemId: data.stockItemId,
                    godownId: data.sourceGodownId,
                },
            },
        });

        if (!sourceRecord) {
            throw new Error('No stock found in source godown for this item.');
        }

        if (sourceRecord.quantity < data.quantity) {
            throw new Error(
                `Insufficient stock. Source godown has ${sourceRecord.quantity} but ${data.quantity} requested.`
            );
        }

        // 2. Deduct from source
        const updatedSource = await tx.godownStock.update({
            where: {
                stockItemId_godownId: {
                    stockItemId: data.stockItemId,
                    godownId: data.sourceGodownId,
                },
            },
            data: {
                quantity: { decrement: data.quantity },
                value: sourceRecord.rate * (sourceRecord.quantity - data.quantity),
                updatedAt: new Date(),
            },
        });

        // 3. Add to destination (upsert — may not exist yet)
        const transferRate = data.rate || sourceRecord.rate;
        const transferValue = data.quantity * transferRate;

        const updatedDestination = await tx.godownStock.upsert({
            where: {
                stockItemId_godownId: {
                    stockItemId: data.stockItemId,
                    godownId: data.destinationGodownId,
                },
            },
            update: {
                quantity: { increment: data.quantity },
                rate: transferRate,
                value: { increment: transferValue },
                updatedAt: new Date(),
            },
            create: {
                companyId: data.companyId,
                stockItemId: data.stockItemId,
                godownId: data.destinationGodownId,
                quantity: data.quantity,
                rate: transferRate,
                value: transferValue,
            },
        });

        return {
            source: updatedSource,
            destination: updatedDestination,
            transferredQty: data.quantity,
            transferredRate: transferRate,
            transferredValue: transferValue,
        };
    });
};

