import { Router } from 'express';
import unitRouter from './unit.router';
import stockGroupRouter from './stock-group.router';
import stockItemRouter from './stock-item.router';
import godownRouter from './godown.router';
import stockCategoryRouter from './stock-category.router';

const inventoryRouter = Router();

// Unit Routes
inventoryRouter.use('/units', unitRouter);

// Stock Group Routes
inventoryRouter.use('/stock-groups', stockGroupRouter);

// Stock Item Routes
inventoryRouter.use('/stock-items', stockItemRouter);

// Godown Routes
inventoryRouter.use('/godowns', godownRouter);

// Stock Category Routes
inventoryRouter.use('/stock-categories', stockCategoryRouter);

export default inventoryRouter;

