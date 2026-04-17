import { Router } from "express";
import { listSalaryStructures, createSalaryStructure, deleteSalaryStructureItem, getLatestSalaryStructure } from "../../controller/payroll/salaryStructure.controller"; // Named imports
import { auth } from "../../../middleware/auth";
import { allow } from "../../../middleware/role";
import { requirePayrollEnabled } from "../../../middleware/payrollEnabled";

const salaryStructureRouter = Router({ mergeParams: true });

salaryStructureRouter.get("/", auth, allow("admin", "accounting"), requirePayrollEnabled, listSalaryStructures);
salaryStructureRouter.get("/latest", auth, allow("admin", "accounting"), requirePayrollEnabled, getLatestSalaryStructure);
salaryStructureRouter.post("/", auth, allow("admin", "accounting"), requirePayrollEnabled, createSalaryStructure);
salaryStructureRouter.delete("/items/:itemId", auth, allow("admin", "accounting"), requirePayrollEnabled, deleteSalaryStructureItem);

export default salaryStructureRouter;

