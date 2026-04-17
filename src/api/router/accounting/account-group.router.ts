/**
 * Account Group Router
 */

import { Router } from 'express';
import { auth } from '../../../middleware/auth';
import {
    getGroupsController,
    getChartOfAccountsController,
    createGroupController,
    deleteGroupController,
} from '../../controller/accounting/account-group.controller';

const accountGroupRouter = Router();

// Get flat list of all groups
accountGroupRouter.get('/list/:companyId', auth, getGroupsController);

// Get hierarchical chart of accounts
accountGroupRouter.get('/chart/:companyId', auth, getChartOfAccountsController);

// Create a new custom group
accountGroupRouter.post('/:companyId', auth, createGroupController);

// Delete a group
accountGroupRouter.delete('/:companyId/:groupId', auth, deleteGroupController);

export default accountGroupRouter;

