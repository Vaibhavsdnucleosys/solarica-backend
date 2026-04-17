import { Router } from "express";
import { auth } from "../../middleware/auth";
import { allow } from "../../middleware/role";
import {
  getAllEmployeesReports,
  getEmployeeReportById,
  getTeamPerformanceSummary,
  getMonthlySalesReport
} from "../controller/employee-report.controller";

const employeeReportRouter = Router();

// Admin only routes
// Admin and Sales routes
employeeReportRouter.get("/", auth, allow("admin", "sales"), getAllEmployeesReports);
employeeReportRouter.get("/summary", auth, allow("admin"), getTeamPerformanceSummary);
employeeReportRouter.get("/monthly-sales-report", auth, allow("admin", "sales"), getMonthlySalesReport);
//employeeReportRouter.get("/analytics", auth, allow("admin"), getServiceTypeAnalytics);
employeeReportRouter.get("/:id", auth, allow("admin"), getEmployeeReportById);

export default employeeReportRouter;

