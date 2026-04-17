import { Router } from "express";
import { auth } from "../../middleware/auth";
import { allow } from "../../middleware/role";
import {
    createTask,
    getAllTasks,
    updateTaskProgress,
    getTaskAnalytics,
} from "../controller/task.controller";

const taskRouter = Router();

// Admin/Operation Master routes
taskRouter.post("/", auth, allow("admin", "operation", "operations"), createTask);
taskRouter.get("/", auth, allow("admin", "sales", "operation", "operations", "Operation Employee"), getAllTasks);
taskRouter.get("/analytics", auth, allow("admin", "operation", "operations"), getTaskAnalytics);

// Assigned user routes
taskRouter.patch("/:id/progress", auth, updateTaskProgress);

export default taskRouter;

