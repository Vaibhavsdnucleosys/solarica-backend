//Voucher Type Controller

import { Request, Response } from 'express';
import prisma from '../../../config/prisma';
import {
  createVoucherTypeModel,
  getVoucherTypesModel,
  updateVoucherTypeModel,
  getNextVoucherNumberModel,
} from '../../model/accounting/voucher-type.model';

//POST /api/accounting/voucher-types/company/:companyId

export const createVoucherTypeController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const userId = (req as any).user?.id;

    const voucherType = await createVoucherTypeModel({
      companyId,
      ...req.body,
      createdBy: userId,
      updatedBy: userId,
    });

    return res.status(201).json({
      success: true,
      message: 'Voucher type created successfully',
      data: voucherType,
    });
  } catch (error: any) {
    console.error('Voucher Type Creation Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

//GET /api/accounting/voucher-types/company/:companyId

export const getVoucherTypesController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const voucherTypes = await getVoucherTypesModel(companyId) as any[];

    // Enrichment: Check if "Payroll" is locked
    const { isPayrollVoucherTypeLocked } = require('../../../services/payroll/payrollAccounting.service');
    const isLockedValue = await isPayrollVoucherTypeLocked(companyId);

    const enriched = voucherTypes.map((vt: any) => ({
      ...vt,
      isLocked: vt.name === "Payroll" ? isLockedValue : false
    }));

    return res.status(200).json({
      success: true,
      data: enriched,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

//PUT /api/accounting/voucher-types/:id
export const updateVoucherTypeController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const existing = await prisma.voucherType.findUnique({ where: { id } });
    if (existing && existing.name === "Payroll") {
      const { isPayrollVoucherTypeLocked } = require('../../../services/payroll/payrollAccounting.service');
      const isLockedValue = await isPayrollVoucherTypeLocked(existing.companyId);
      if (isLockedValue) {
        return res.status(403).json({
          success: false,
          message: 'The "Payroll" voucher type is locked because payroll has been approved for this period. Changes are not allowed for audit integrity.'
        });
      }
    }

    const voucherType = await updateVoucherTypeModel(id, {
      ...req.body,
      updatedBy: userId,
    });

    return res.status(200).json({
      success: true,
      message: 'Voucher type updated successfully',
      data: voucherType,
    });
  } catch (error: any) {
    console.error('Voucher Type Update Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

//GET /api/accounting/voucher-types/:id/next-number
export const getNextVoucherNumberController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const nextNumber = await getNextVoucherNumberModel(id);

    return res.status(200).json({
      success: true,
      data: { nextNumber },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

