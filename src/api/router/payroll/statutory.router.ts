import { Router } from "express";
import { getConfig, updateConfig } from "../../controller/payroll/statutory.controller"; // Named imports
import { auth } from "../../../middleware/auth";
import { allow } from "../../../middleware/role";

import { requirePayrollEnabled } from "../../../middleware/payrollEnabled";

const statutoryRouter = Router({ mergeParams: true });

statutoryRouter.get("/config", auth, allow("admin", "accounting"), getConfig);
statutoryRouter.put("/config", auth, allow("admin", "accounting"), requirePayrollEnabled, updateConfig);

export default statutoryRouter;

