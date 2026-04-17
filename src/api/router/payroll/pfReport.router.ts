import { Router } from "express";
import * as ctrl from "../../controller/payroll/statutory.controller";
import { auth } from "../../../middleware/auth";
import { allow } from "../../../middleware/role";
import { requirePayrollEnabled } from "../../../middleware/payrollEnabled";

const pfReportRouter = Router({ mergeParams: true });

pfReportRouter.get("/summary", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.getPFSummaryReport);
pfReportRouter.get("/summary/excel", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.getPFSummaryExcelReport);
pfReportRouter.get("/employee-wise", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.getPFEmployeeWiseReport);
pfReportRouter.get("/form-5", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.getPFForm5);
pfReportRouter.get("/ecr", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.getPFECRFile);
pfReportRouter.get("/form-3a", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.getPFForm3A);

export default pfReportRouter;

