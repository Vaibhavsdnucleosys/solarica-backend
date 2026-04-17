import { Router } from "express";
import * as ctrl from "../../controller/payroll/employeeGroup.controller";
import { auth } from "../../../middleware/auth";
import { allow } from "../../../middleware/role";
import { requirePayrollEnabled } from "../../../middleware/payrollEnabled";

const employeeGroupRouter = Router({ mergeParams: true });

employeeGroupRouter.get("/", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.listGroups);
employeeGroupRouter.post("/", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.createGroup);
employeeGroupRouter.get("/:id", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.getGroup);
employeeGroupRouter.put("/:id", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.updateGroup);
employeeGroupRouter.delete("/:id", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.deleteGroup);

export default employeeGroupRouter;

