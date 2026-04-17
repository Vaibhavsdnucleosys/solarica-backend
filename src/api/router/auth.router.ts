import { Router } from "express";
import { registerAdmin, adminLogin, employeeLogin, login } from "../controller/auth.controller";

const authRouter = Router();

// Admin registration (only works once)
authRouter.post("/admin/register", registerAdmin);

// Unified login (handles both admin and employee)
authRouter.post("/login", login);

// Admin login
authRouter.post("/admin/login", adminLogin);

// Employee login
authRouter.post("/employee/login", employeeLogin);

export default authRouter;

