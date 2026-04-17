import { Request, Response } from 'express';

import {
  createLedgerService,
  getLedgersService,
  getLedgerByIdService,
  deleteLedgerService,
  updateLedgerService
} from '../../../services/accounting/ledger.service';

import prisma from '../../../config/prisma';


export const createLedger = async (req: Request, res: Response) => {
  try {
    const {
      name,
      groupId,
      openingBalance,
      openingBalanceType,
      description,

      // Party Details
      contactPerson,
      phone,
      email,
      address,
      gstin,
      pan,

      // Bank Details
      bankName,
      accountNumber,
      ifscCode,
      branch,

      // Flags
      isBankAccount,
      isCashAccount,
      isPartyAccount
    } = req.body;

    const companyId = req.body.companyId;
    const userId = (req as any).user?.id;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const ledger = await createLedgerService(companyId, userId, {
      companyId,
      groupId,
      name,
      description,
      openingBalance: openingBalance || 0,
      openingBalanceType: openingBalanceType || 'DEBIT',
      currentBalance: openingBalance || 0,
      currentBalanceType: openingBalanceType || 'DEBIT',

      contactPerson,
      phone,
      email,
      address,
      gstin,
      pan,

      bankName,
      accountNumber,
      ifscCode,
      branch,

      isBankAccount: isBankAccount || false,
      isCashAccount: isCashAccount || false,
      isPartyAccount: isPartyAccount || false,
      isTaxAccount: false,

      createdBy: userId,
      updatedBy: userId
    });

    return res.status(201).json(ledger);

  } catch (error: any) {
    console.error('Error creating ledger:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const deleteLedger = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    await deleteLedgerService(id, userId);

    return res.status(200).json({ message: 'Ledger deleted successfully' });

  } catch (error: any) {
    console.error('Error deleting ledger:', error);
    const statusCode = error.message.includes('Unauthorized') ? 403 :
      error.message.includes('not found') ? 404 :
        error.message.includes('Cannot delete') ? 400 : 500;

    return res.status(statusCode).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getAllLedgers = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const userId = (req as any).user?.id;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    const ledgers = await getLedgersService(companyId, userId);


    return res.status(200).json({
      success: true,
      data: ledgers
    });

  } catch (error: any) {
    console.error('Error fetching ledgers:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
}

export const getLedgerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const ledger = await getLedgerByIdService(id, userId);

    return res.status(200).json({
      success: true,
      data: ledger
    });
  } catch (error: any) {
    console.error('Error fetching ledger details:', error);

    const statusCode = error.message.includes('Unauthorized') ? 403 : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

export const updateLedger = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const updateData = req.body;

    const ledger = await updateLedgerService(id, userId, updateData);

    return res.status(200).json({
      success: true,
      message: 'Ledger updated successfully',
      data: ledger
    });

  } catch (error: any) {
    console.error('Error updating ledger:', error);

    const statusCode = error.message.includes('Unauthorized') ? 403 :
      error.message.includes('not found') ? 404 :
        error.message.includes('exists') ? 409 : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

