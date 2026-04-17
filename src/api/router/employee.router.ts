import { Router } from "express";
import { auth } from "../../middleware/auth";
import { allow } from "../../middleware/role";
import { updateEmployeeSalesTarget } from "../controller/employee.controller";

import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeesByCategory,
  getCurrentEmployee
} from "../controller/employee.controller";

const employeeRouter = Router();

// Admin only routes
employeeRouter.post("/", auth, allow("admin"), createEmployee);
employeeRouter.get("/", auth, allow("admin", "operation", "sales", "accounting"), getAllEmployees);
employeeRouter.get("/role/:roleName", auth, allow("admin"), getEmployeesByCategory);
employeeRouter.get("/:id", auth, getEmployeeById);
employeeRouter.put("/:id", auth, allow("admin"), updateEmployee);
employeeRouter.delete("/:id", auth, allow("admin"), deleteEmployee);
employeeRouter.get("/profile", auth, getCurrentEmployee);
employeeRouter.patch("/:id/target", auth, allow("admin"), updateEmployeeSalesTarget);
// Employee only routes
//employeeRouter.get("/profile/me", auth, allow("role1", "role2", "role3"), getCurrentEmployee);

export default employeeRouter;

