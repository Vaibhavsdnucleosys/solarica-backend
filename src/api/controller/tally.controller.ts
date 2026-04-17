
import { Request, Response } from 'express';
import { TallyService } from '../../services/tally.service';

// import { createNotificationModel } from '../model/notification.model';

export const TallyController = {

    // Create Party
    createParty: async (req: Request, res: Response) => {
        try {
            const { name, group, gstin, openingBalance } = req.body;

            if (!name) {
                res.status(400).json({ success: false, message: "Party Name is required" });
                return;
            }

            const result = await TallyService.createParty({ name, group, gstin, openingBalance });

            if (result.success) {
                // Dynamic import to avoid circular dependency
                const { createNotificationModel } = await import('../model/notification.model');
                await createNotificationModel("Tally Sync: Ledger Created", `Ledger '${name}' created successfully in Tally.`, "SUCCESS");
                res.status(200).json(result);
            } else {
                res.status(500).json(result);
            }

        } catch (error: any) {
            res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
        }
    },

    // Create Invoice
    createInvoice: async (req: Request, res: Response) => {
        try {
            const { invoiceNo, date, partyName, amount, salesLedger } = req.body;

            if (!invoiceNo || !date || !partyName || !amount) {
                res.status(400).json({ success: false, message: "Missing required invoice fields" });
                return;
            }

            const result = await TallyService.createInvoice({ invoiceNo, date, partyName, amount, salesLedger });

            if (result.success) {
                // Dynamic import to avoid circular dependency
                const { createNotificationModel } = await import('../model/notification.model');
                await createNotificationModel("Tally Sync: Invoice Created", `Invoice '${invoiceNo}' posted successfully to Tally.`, "SUCCESS");
                res.status(200).json(result);
            } else {
                res.status(500).json(result);
            }

        } catch (error: any) {
            res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
        }
    },

    // Get Stats
    getStats: async (req: Request, res: Response) => {
        try {
            const result = await TallyService.getStats();
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error: any) {
            res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
        }
    }
};

