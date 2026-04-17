/**
 * Payroll Module Router Index
 * All payroll routes are nested under /api/payroll/:companyId/
 */
import { Router } from "express";
import { auth } from "../../../middleware/auth";
import { allow } from "../../../middleware/role";
import { requirePayrollEnabled } from "../../../middleware/payrollEnabled";
import {
    activatePayrollConfig,
    getPFAdminChargesSummary,
    postPFAdminChargesLedger
} from "../../controller/payroll/statutory.controller";

import payrollEmployeeRouter from "./payrollEmployee.router";
import payHeadRouter from "./payHead.router";
import salaryStructureRouter from "./salaryStructure.router";
import attendanceRouter from "./attendance.router";
import salaryProcessingRouter from "./salaryProcessing.router";
import statutoryRouter from "./statutory.router";
import pfReportRouter from "./pfReport.router"
import ptReportRouter from "./ptReport.router";
import ptSlabRouter from "./ptSlab.router";
import employeeGroupRouter from "./employeeGroup.router";
import payrollLockRouter from "./payrollLock.router";

const payrollRouter = Router();

payrollRouter.use("/pt-slabs", ptSlabRouter);
payrollRouter.use("/:companyId/pt/reports", ptReportRouter);

// Locking APIs
payrollRouter.use("/:companyId/lock", payrollLockRouter);

payrollRouter.use("/:companyId/employees", payrollEmployeeRouter);
payrollRouter.use("/:companyId/employee-groups", employeeGroupRouter);
payrollRouter.use("/:companyId/pay-heads", payHeadRouter);
payrollRouter.use("/:companyId/salary-structures", salaryStructureRouter);
payrollRouter.use("/:companyId/attendance", attendanceRouter);
payrollRouter.use("/:companyId/salary", salaryProcessingRouter);
payrollRouter.use("/:companyId/statutory", statutoryRouter);

payrollRouter.post("/:companyId/activate", auth, allow("admin", "accounting"), activatePayrollConfig);

payrollRouter.use("/:companyId/pf/reports", pfReportRouter);
payrollRouter.get(
    "/:companyId/pf/admin-charges/summary",
    auth,
    allow("admin", "accounting"),
    requirePayrollEnabled,
    getPFAdminChargesSummary
);
payrollRouter.post(
    "/:companyId/pf/admin-charges/post-ledger",
    auth,
    allow("admin", "accounting"),
    requirePayrollEnabled,
    postPFAdminChargesLedger
);

export default payrollRouter;

