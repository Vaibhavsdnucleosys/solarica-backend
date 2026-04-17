/**
 * Stock Item Controller
 */

import { Request, Response } from 'express';
import {
    getStockItemsService,
    getStockItemByIdService,
    createStockItemService,
    updateStockItemService,
    deleteStockItemService,
    searchStockItemsService,
} from '../../../services/inventory/stock-item.service';
import { INVENTORY_SUCCESS } from '../../../utils/inventory/constants';

export const getStockItemsController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;
        const items = await getStockItemsService(companyId, userId);
        return res.status(200).json({ success: true, data: items });
    } catch (error: any) {
        console.error("[StockItemController] Error fetching list:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getStockItemByIdController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId, itemId } = req.params;
        const item = await getStockItemByIdService(itemId, companyId, userId);
        return res.status(200).json({ success: true, data: item });
    } catch (error: any) {
        return res.status(error.message.includes('not found') ? 404 : 500).json({ success: false, message: error.message });
    }
};

export const createStockItemController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;
        const item = await createStockItemService(companyId, userId, req.body);
        return res.status(201).json({ success: true, message: INVENTORY_SUCCESS.ITEM_CREATED, data: item });
    } catch (error: any) {
        return res.status(error.message.includes('already exists') ? 409 : 400).json({ success: false, message: error.message });
    }
};

export const updateStockItemController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId, itemId } = req.params;
        const item = await updateStockItemService(itemId, companyId, userId, req.body);
        return res.status(200).json({ success: true, message: INVENTORY_SUCCESS.ITEM_UPDATED, data: item });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const searchStockItemsController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;
        const query = (req.query.q as string) || '';
        const results = await searchStockItemsService(companyId, userId, query);
        return res.status(200).json({ success: true, data: results });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteStockItemController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId, itemId } = req.params;
        await deleteStockItemService(itemId, companyId, userId);
        return res.status(200).json({ success: true, message: INVENTORY_SUCCESS.ITEM_DELETED });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

