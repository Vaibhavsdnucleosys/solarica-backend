import { Request, Response } from 'express';
import { prisma } from '../../init/db.init';
import { generateWorkOrderPDF } from '../../services/pdf.service';
import { logger } from '../../config/logger.config';

/**
 * Create a new Work Order
 */
export const createWorkOrder = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        // User from auth middleware (assumed attached to req.user or passed in body for now if not strictly typed)
        const userId = (req as any).user?.id || data.createdById;

        if (!data.jobId) {
            return res.status(400).json({ error: 'Job ID is required' });
        }

        const workOrder = await prisma.workOrder.create({
            data: {
                jobId: data.jobId,
                date: new Date(data.date),
                customerName: data.customerName,
                customerAddress: data.customerAddress,
                customerContact: data.customerContact,
                customerGst: data.customerGst,
                customerState: data.customerState,
                shipToAddress: data.shipToAddress,
                deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
                finishedGoodName: data.finishedGoodName,
                finishedGoodQty: Number(data.finishedGoodQty),
                items: data.items, // Stored as Json
                additionalCost: Number(data.additionalCost || 0),
                status: 'CREATED',
                createdById: userId
            }
        });

        logger.info(`[WorkOrder] Created Work Order: ${workOrder.jobId}`);
        res.status(201).json(workOrder);
    } catch (error: any) {
        logger.error(`[WorkOrder] Error creating: ${error.message}`);
        res.status(500).json({ error: 'Failed to create Work Order', details: error.message });
    }
};

/**
 * Get all Work Orders
 */
export const getWorkOrders = async (req: Request, res: Response) => {
    try {
        const workOrders = await prisma.workOrder.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                createdBy: {
                    select: { name: true }
                }
            }
        });
        res.json(workOrders);
    } catch (error: any) {
        logger.error(`[WorkOrder] Error fetching list: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch Work Orders' });
    }
};

/**
 * Generate PDF for a saved Work Order
 */
export const downloadWorkOrderPDF = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const workOrder = await prisma.workOrder.findUnique({
            where: { id }
        });

        if (!workOrder) {
            return res.status(404).json({ error: 'Work Order not found' });
        }

        const pdfBuffer = await generateWorkOrderPDF(workOrder);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=WorkOrder_${workOrder.jobId}.pdf`,
            'Content-Length': pdfBuffer.length
        });

        res.send(pdfBuffer);
    } catch (error: any) {
        logger.error(`[WorkOrder] Error generating PDF: ${error.message}`);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};

/**
 * Legacy/Direct Generation (Optional, for preview)
 */
export const generateWorkOrder = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const pdfBuffer = await generateWorkOrderPDF(data);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=WorkOrder_${data.jobId || 'Draft'}.pdf`,
            'Content-Length': pdfBuffer.length
        });
        res.send(pdfBuffer);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};

