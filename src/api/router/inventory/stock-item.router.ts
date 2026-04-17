/**
 * Stock Item Router
 */

import { Router } from 'express';
import { auth } from '../../../middleware/auth';
import {
    getStockItemsController,
    getStockItemByIdController,
    createStockItemController,
    updateStockItemController,
    deleteStockItemController,
    searchStockItemsController,
} from '../../controller/inventory/stock-item.controller';

const stockItemRouter = Router();

stockItemRouter.get('/list/:companyId', auth, getStockItemsController);
stockItemRouter.get('/search/:companyId', auth, searchStockItemsController);
stockItemRouter.get('/:companyId/:itemId', auth, getStockItemByIdController);
stockItemRouter.post('/:companyId', auth, createStockItemController);
stockItemRouter.put('/:companyId/:itemId', auth, updateStockItemController);
stockItemRouter.delete('/:companyId/:itemId', auth, deleteStockItemController);

export default stockItemRouter;

