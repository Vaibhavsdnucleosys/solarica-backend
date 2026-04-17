import { logger } from '../config/logger.config';

import { generateQuotationPDFModel, sendQuotationEmailModel } from '../api/model/quotation.model';

// Start a dummy implementation since Redis is failing
export const quotationQueue = {
    add: async () => {
        logger.warn('[Queue] Redis is disabled. Job was NOT added to queue.');
    }
};

/**
 * Helper to add a job to the queue (Immediate Fallback Implementation)
 */
export const addQuotationJob = async (id: string, data: any) => {
    logger.info(`[Queue] Redis is disabled. Processing job immediately for Quotation ID: ${id}`);

    // Process immediately in a non-blocking way
    (async () => {
        try {
            await generateQuotationPDFModel(id, data);
            await sendQuotationEmailModel(id);
            logger.info(`[Queue] Immediate processing completed for Quotation ID: ${id}`);
        } catch (error) {
            logger.error(`[Queue] Immediate processing failed for Quotation ID: ${id}`, error);
        }
    })();
};

