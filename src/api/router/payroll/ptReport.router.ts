import { Router } from "express";
import * as statutoryCtrl from "../../controller/payroll/statutory.controller";
import { auth } from "../../../middleware/auth";
import { allow } from "../../../middleware/role";
import { requirePayrollEnabled } from "../../../middleware/payrollEnabled";

const ptReportRouter = Router({ mergeParams: true });

ptReportRouter.get("/monthly", auth, allow("admin", "accounting"), requirePayrollEnabled, statutoryCtrl.getPTMonthlyReport);
ptReportRouter.get("/monthly/excel", auth, allow("admin", "accounting"), requirePayrollEnabled, statutoryCtrl.getPTMonthlyExcelReport);
ptReportRouter.get("/annual", auth, allow("admin", "accounting"), requirePayrollEnabled, statutoryCtrl.getPTAnnualReport);
ptReportRouter.get("/employee-wise", auth, allow("admin", "accounting"), requirePayrollEnabled, statutoryCtrl.getPTEmployeeWiseReport);
ptReportRouter.get("/statement", auth, allow("admin", "accounting"), requirePayrollEnabled, statutoryCtrl.getPTReport);

export default ptReportRouter;

