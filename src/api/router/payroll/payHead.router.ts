import { Router } from "express";
import * as ctrl from "../../controller/payroll/payHead.controller";
import { auth } from "../../../middleware/auth";
import { allow } from "../../../middleware/role";
import { requirePayrollEnabled } from "../../../middleware/payrollEnabled";

const payHeadRouter = Router({ mergeParams: true });

payHeadRouter.get("/", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.listPayHeads);
payHeadRouter.get("/:id", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.getPayHead);
payHeadRouter.post("/", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.createPayHead);
payHeadRouter.put("/:id", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.updatePayHead);
payHeadRouter.delete("/:id", auth, allow("admin", "accounting"), requirePayrollEnabled, ctrl.deletePayHead);

export default payHeadRouter;

