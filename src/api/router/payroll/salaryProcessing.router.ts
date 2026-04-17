import { Router } from "express";
import * as ctrl from "../../controller/payroll/salaryProcessing.controller";
import { auth } from "../../../middleware/auth";
import { allow } from "../../../middleware/role";
import { requirePayrollEnabled } from "../../../middleware/payrollEnabled";

const salaryProcessingRouter = Router({ mergeParams: true });

salaryProcessingRouter.get("/", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.listVouchers);
salaryProcessingRouter.get("/:id", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.getVoucher);
salaryProcessingRouter.post("/process", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.processSalary);
salaryProcessingRouter.post("/approve", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.approveVouchers);

export default salaryProcessingRouter;

