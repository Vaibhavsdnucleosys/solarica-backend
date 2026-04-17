import { Router } from "express";
import * as ctrl from "../../controller/payroll/payrollEmployee.controller";
import { auth } from "../../../middleware/auth";
import { allow } from "../../../middleware/role";
import { requirePayrollEnabled } from "../../../middleware/payrollEnabled";


const payrollEmployeeRouter = Router({ mergeParams: true });

payrollEmployeeRouter.get("/", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.listEmployees);
payrollEmployeeRouter.post("/", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.createEmployee);
payrollEmployeeRouter.get("/:id", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.getEmployee);
payrollEmployeeRouter.put("/:id", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.updateEmployee);
payrollEmployeeRouter.delete("/:id", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.deleteEmployee);

export default payrollEmployeeRouter;

