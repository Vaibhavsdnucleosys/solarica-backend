import { Router } from "express";
import { auth } from "../../middleware/auth";
import { allow } from "../../middleware/role";
import { togglePTExempt, createPTExemption, getPTExemptStatus } from "../controller/payroll.controller";
import * as exportCtrl from "../controller/payroll/export.controller";

const payrollRouter = Router();

// Statutory Export Routes (JSON Data Only)
payrollRouter.get("/:companyId/export/pf", auth, allow("admin", "accounting"), exportCtrl.getPFExport);
payrollRouter.get("/:companyId/export/pt", auth, allow("admin", "accounting"), exportCtrl.getPTExport);
payrollRouter.get("/:companyId/export/statutory", auth, allow("admin", "accounting"), exportCtrl.getStatutoryExport);

// PT Exemption Routes
payrollRouter.put("/employees/:id/pt-exempt", auth, allow("admin", "accounting", "operation", "manager"), togglePTExempt);
payrollRouter.post("/pt/exemptions", auth, allow("admin", "accounting", "operation", "manager"), createPTExemption);
payrollRouter.get("/employees/:id/pt-exempt", auth, allow("admin", "accounting", "operation", "manager"), getPTExemptStatus);

export default payrollRouter;

