/**
 * Report Controller
 */

import { Request, Response } from 'express';
import {
    getTrialBalanceService,
    getProfitAndLossService,
    getBalanceSheetService,
    getLedgerStatementService,
    getDayBookService
} from '../../../services/accounting/report.service';

/**
 * GET /api/accounting/reports/day-book/:companyId
 */
export const getDayBook = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const userId = (req as any).user?.id;
        const date = req.query.date ? new Date(req.query.date as string) : undefined;

        const report = await getDayBookService(companyId, userId, date);

        return res.status(200).json({
            success: true,
            data: report
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
};

/**
 * GET /api/accounting/reports/trial-balance/:companyId
 */
export const getTrialBalance = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const userId = (req as any).user?.id;

        const report = await getTrialBalanceService(companyId, userId);

        return res.status(200).json({
            success: true,
            data: report
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
};

/**
 * GET /api/accounting/reports/profit-loss/:companyId
 */
export const getProfitAndLoss = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const userId = (req as any).user?.id;
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

        const report = await getProfitAndLossService(companyId, userId, startDate, endDate);

        return res.status(200).json({
            success: true,
            data: report
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
};

/**
 * GET /api/accounting/reports/balance-sheet/:companyId
 */
export const getBalanceSheet = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const userId = (req as any).user?.id;

        const report = await getBalanceSheetService(companyId, userId);

        return res.status(200).json({
            success: true,
            data: report
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
};

/**
 * GET /api/accounting/reports/ledger-statement/:ledgerId
 */
export const getLedgerStatement = async (req: Request, res: Response) => {
    try {
        const { ledgerId } = req.params;
        const userId = (req as any).user?.id;
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

        const report = await getLedgerStatementService(ledgerId, userId, startDate, endDate);

        return res.status(200).json({
            success: true,
            data: report
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
};

