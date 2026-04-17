import { Request, Response } from 'express';
import { sendBulkEmail } from '../../services/email.service';

/**
 * Send bulk email campaign
 */
export const sendBulkEmailController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { recipients, subject, message } = req.body;

        // recipients might be coming as a JSON string if using FormData
        let recipientList: string[] = [];
        if (typeof recipients === 'string') {
            try {
                recipientList = JSON.parse(recipients);
            } catch (e) {
                // If not JSON, maybe comma separated?
                recipientList = recipients.split(',').map(e => e.trim());
            }
        } else if (Array.isArray(recipients)) {
            recipientList = recipients;
        }

        if (!recipientList || recipientList.length === 0) {
            res.status(400).json({ success: false, message: 'Recipients list is required' });
            return;
        }

        if (!subject || !message) {
            res.status(400).json({ success: false, message: 'Subject and message are required' });
            return;
        }

        const files = req.files as Express.Multer.File[] || [];

        const result = await sendBulkEmail(recipientList, subject, message, files);

        res.status(200).json({
            success: true,
            message: 'Bulk email campaign processed',
            data: result
        });
    } catch (error: any) {
        console.error('Error in bulk email controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process bulk email campaign',
            error: error.message
        });
    }
};

