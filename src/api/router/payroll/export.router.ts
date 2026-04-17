import { Router } from "express";
import { auth } from "../../../middleware/auth";
import { allow } from "../../../middleware/role";
import * as exportCtrl from "../../controller/payroll/export.controller";

/**
 * Statutory Export Router
 * Path: /api/payroll/:companyId/export/
 */
const exportRouter = Router({ mergeParams: true });

// All routes require auth and admin/accounting roles
exportRouter.get("/pf", auth, allow("admin", "accounting"), exportCtrl.getPFExport);
exportRouter.get("/pt", auth, allow("admin", "accounting"), exportCtrl.getPTExport);
exportRouter.get("/statutory", auth, allow("admin", "accounting"), exportCtrl.getStatutoryExport);

export default exportRouter;

