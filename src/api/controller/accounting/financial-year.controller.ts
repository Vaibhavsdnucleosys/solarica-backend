/**
 * Financial Year Controller
 */

import { Request, Response } from 'express';
import {
    getFinancialYearsService,
    switchFinancialYearService,
    lockFYService,
    unlockFYService,
    createFYService,
} from '../../../services/accounting/financial-year.service';

/**
 * GET /api/accounting/fy/:companyId
 */
export const getFinancialYearsController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;

        const years = await getFinancialYearsService(companyId, userId);

        return res.status(200).json({
            success: true,
            data: years,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * POST /api/accounting/fy/switch/:companyId/:fyId
 */
export const switchFYController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId, fyId } = req.params;

        const result = await switchFinancialYearService(companyId, fyId, userId);

        return res.status(200).json({
            success: true,
            message: 'Financial year switched successfully',
            data: result,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * POST /api/accounting/fy/lock/:companyId/:fyId
 */
export const lockFYController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId, fyId } = req.params;

        await lockFYService(fyId, companyId, userId);

        return res.status(200).json({
            success: true,
            message: 'Financial year locked successfully',
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * POST /api/accounting/fy/unlock/:companyId/:fyId
 */
export const unlockFYController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId, fyId } = req.params;

        await unlockFYService(fyId, companyId, userId);

        return res.status(200).json({
            success: true,
            message: 'Financial year unlocked successfully',
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * POST /api/accounting/fy/:companyId
 */
export const createFYController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;
        const { startDate, endDate } = req.body;

        const result = await createFYService(companyId, userId, {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
        });

        return res.status(201).json({
            success: true,
            message: 'Financial year created successfully',
            data: result,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

