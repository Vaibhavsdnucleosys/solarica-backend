import { Router } from "express";
import { listAttendance, markAttendance } from "../../controller/payroll/attendance.controller";
import { auth } from "../../../middleware/auth";
import { allow } from "../../../middleware/role";
import { requirePayrollEnabled } from "../../../middleware/payrollEnabled";

const attendanceRouter = Router({ mergeParams: true });

attendanceRouter.get("/", auth, allow("admin", "accounting"), requirePayrollEnabled, listAttendance);
attendanceRouter.post("/", auth, allow("admin", "accounting"), requirePayrollEnabled, markAttendance);

export default attendanceRouter;

