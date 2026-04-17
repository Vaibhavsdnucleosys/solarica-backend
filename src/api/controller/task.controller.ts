import { Request, Response } from "express";
import {
    createTaskModel,
    getAllTasksModel,
    updateTaskProgressModel,
    getTaskAnalyticsModel,
} from "../model/task.model";

// Create a new task (Admin/Operation Master only)
export const createTask = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { name, dueDate, priority, target, description, assigneeIds } = req.body;

        // Validate required fields
        if (!name || !dueDate || !priority || !target || !assigneeIds) {
            return res.status(400).json({
                message: "Missing required fields: name, dueDate, priority, target, assigneeIds",
            });
        }

        // Validate assigneeIds is an array
        if (!Array.isArray(assigneeIds) || assigneeIds.length === 0) {
            return res.status(400).json({
                message: "assigneeIds must be a non-empty array",
            });
        }

        // Validate priority
        if (!['LOW', 'MEDIUM', 'HIGH'].includes(priority.toUpperCase())) {
            return res.status(400).json({
                message: "Priority must be LOW, MEDIUM, or HIGH",
            });
        }

        const task = await createTaskModel(
            name,
            new Date(dueDate),
            priority.toUpperCase(),
            parseInt(target),
            description,
            assigneeIds,
            userId
        );

        res.status(201).json({
            message: "Task created successfully",
            data: task,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get all tasks with optional filtering
export const getAllTasks = async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;

        const tasks = await getAllTasksModel(userId as string | undefined);

        res.json({
            message: "Tasks retrieved successfully",
            data: tasks,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Update task progress (for assigned users)
export const updateTaskProgress = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { completedTarget } = req.body;
        const userId = (req as any).user.id; // Get the logged-in user

        if (completedTarget === undefined || completedTarget === null) {
            return res.status(400).json({
                message: "completedTarget is required",
            });
        }

        const task = await updateTaskProgressModel(
            id,
            userId,
            parseInt(completedTarget)
        );

        res.json({
            message: "Task progress updated successfully",
            data: task,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get task analytics
export const getTaskAnalytics = async (req: Request, res: Response) => {
    try {
        const analytics = await getTaskAnalyticsModel();

        res.json({
            message: "Task analytics retrieved successfully",
            data: analytics,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

