import { Router } from "express";
import * as payrollLockController from "../../controller/payroll/payrollLock.controller";
import { auth } from "../../../middleware/auth";
import { allow } from "../../../middleware/role";

import { requirePayrollEnabled } from "../../../middleware/payrollEnabled";

const router = Router({ mergeParams: true });

// Lock Status (Admin, Accounting)
router.get("/lock-status", auth, allow("admin", "accounting"), requirePayrollEnabled, payrollLockController.getLockStatus);

// Lock Period (Admin, Accounting)
router.post("/lock/:month/:year", auth, allow("admin", "accounting"), requirePayrollEnabled, payrollLockController.lockPeriod);

// Unlock Period (Admin, Accounting)
router.post("/unlock/:month/:year", auth, allow("admin", "accounting"), requirePayrollEnabled, payrollLockController.unlockPeriod);

export default router;

