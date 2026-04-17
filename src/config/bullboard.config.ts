import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'; // or '@bull-board/bullmq' depending on version
import { ExpressAdapter } from '@bull-board/express';
import { quotationQueue } from './../queues/quotation.queue';


// 1. Create the Express Adapter for the dashboard
export const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

// 2. Create the Board with your queue(s)
createBullBoard({
    queues: [], // Disabling queue monitoring temporarily as Redis is disabled
    serverAdapter: serverAdapter,
});


