/**
 * Voucher Controller
 */

import { Request, Response } from 'express';
import {
    createVoucherService,
    getVouchersService,
    getVoucherByIdService,
    postVoucherService,
    getAvailableInvoiceNumbersService,
    getVoucherByInvoiceNumberService,
} from '../../../services/accounting/voucher.service';
import { logger } from '../../../config/logger.config';

/**
 * POST /api/accounting/vouchers/company/:companyId
 */
export const createVoucherController = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const userId = (req as any).user?.id;

        const voucher = await createVoucherService(companyId, userId, req.body);

        return res.status(201).json({
            success: true,
            message: 'Voucher posted successfully',
            data: voucher,
        });
    } catch (error: any) {
        logger.error('Voucher Creation Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error',
        });
    }
};

/**
 * GET /api/accounting/vouchers/company/:companyId
 */
export const getVouchersController = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const userId = (req as any).user?.id;

        // Extract filters from query
        const filters = {
            financialYearId: req.query.financialYearId as string,
            voucherTypeId: req.query.voucherTypeId as string,
            status: req.query.status as any,
            startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
            endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        };

        const vouchers = await getVouchersService(companyId, userId, filters);

        return res.status(200).json({
            success: true,
            data: vouchers,
        });
    } catch (error: any) {
        logger.error('Get Vouchers Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error',
        });
    }
};

/**
 * GET /api/accounting/vouchers/:id
 */
export const getVoucherByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        const voucher = await getVoucherByIdService(id, userId);

        return res.status(200).json({
            success: true,
            data: voucher,
        });
    } catch (error: any) {
        logger.error('Get Voucher By ID Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error',
        });
    }
};

/**
 * POST /api/accounting/vouchers/:id/post
 * Post a draft voucher
 */
export const postVoucherController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        const voucher = await postVoucherService(id, userId);

        return res.status(200).json({
            success: true,
            message: 'Voucher posted successfully',
            data: voucher,
        });
    } catch (error: any) {
        logger.error('Voucher Post Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error',
        });
    }
};




/**
 * PUT /api/accounting/vouchers/:id
 */
export const updateVoucherController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        const voucher = await import('../../../services/accounting/voucher.service').then(s => s.updateVoucherService(id, userId, req.body));

        return res.status(200).json({
            success: true,
            message: 'Voucher updated successfully',
            data: voucher,
        });
    } catch (error: any) {
        logger.error('Voucher Update Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error',
        });
    }
};

/**
 * DELETE /api/accounting/vouchers/:id
 */
export const deleteVoucherController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        const result = await import('../../../services/accounting/voucher.service').then(s => s.deleteVoucherService(id, userId));

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error: any) {
        logger.error('Voucher Delete Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error',
        });
    }
};
/**
 * GET /api/accounting/vouchers/company/:companyId/available-invoices
 */
export const getAvailableInvoiceNumbersController = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const userId = (req as any).user.id;

        const invoices = await getAvailableInvoiceNumbersService(companyId, userId);

        return res.status(200).json({
            success: true,
            data: invoices,
        });
    } catch (error: any) {
        logger.error('Get Available Invoices Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error',
        });
    }
};

/**
 * GET /api/accounting/vouchers/company/:companyId/invoice/:invoiceNumber
 */
export const getVoucherByInvoiceNumberController = async (req: Request, res: Response) => {
    try {
        const { companyId, invoiceNumber } = req.params;
        const userId = (req as any).user?.id;

        const voucher = await getVoucherByInvoiceNumberService(companyId, userId, invoiceNumber);

        return res.status(200).json({
            success: true,
            data: voucher,
        });
    } catch (error: any) {
        logger.error('Get Voucher By Invoice Number Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error',
        });
    }
};

