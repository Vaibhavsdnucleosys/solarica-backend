import { Request, Response } from "express";
import {
    getProductionTasksModel,
    updateProductionTaskModel,
    getProductionTasksByAssigneeModel,
    deleteProductionTaskModel
} from "../model/production-task.model";
import { PrismaClient } from "@prisma/client";
import { uploadToSupabase, generateSignedURL } from "../../config/supabase";

const prisma = new PrismaClient();

export const uploadWorkOrder = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const fileExt = file.originalname.split('.').pop();
        const fileName = `work-order-${Date.now()}.${fileExt}`;
        const filePath = `work-orders/${fileName}`;

        await uploadToSupabase(file.buffer, filePath, file.mimetype, 'documents');

        // Generate signed URL immediately for preview
        let fullUrl = filePath;
        try {
            fullUrl = await generateSignedURL(filePath, 'documents');
        } catch (e) {
            console.error('Failed to generate signed URL:', e);
        }

        res.status(200).json({
            success: true,
            filePath,
            url: fullUrl
        });
    } catch (error: any) {
        console.error("Error uploading work order:", error);
        res.status(500).json({ error: "Failed to upload work order" });
    }
};

// Create production task (can be called from Quotation)
// Create production task
export const createProductionTask = async (req: Request, res: Response) => {
    try {
        const {
            description,
            targetQuantity,
            deadline,
            priority,
            assigneeId,
            quotationId,
            workOrderUrl,
            customerName,
            customerEmail,
            orderDetails,
            systemCapacity,
            deliveryAddress,
            assigneeName,
            invoiceId
        } = req.body;

        // Validation
        if (!description || !targetQuantity || !priority) {
            return res.status(400).json({
                message: "Missing required fields: description, targetQuantity, priority",
            });
        }

        const task = await prisma.productionTask.create({
            data: {
                description,
                targetQuantity: typeof targetQuantity === 'number' ? targetQuantity : parseInt(targetQuantity),
                deadline: deadline ? new Date(deadline) : null,
                priority,
                assigneeId,
                quotationId,
                workOrderUrl,
                status: "Pending",
                completedQuantity: 0,
                customerName,
                customerEmail,
                orderDetails,
                systemCapacity,
                deliveryAddress,
                assigneeName,
                invoiceId
            }
        });

        res.status(201).json({
            message: "Production task created successfully",
            task: task,
        });
    } catch (error: any) {
        console.error("Error creating production task:", error);
        res.status(500).json({ error: "Failed to create task", details: error.message });
    }
};

// Get all production tasks
export const getProductionTasks = async (req: Request, res: Response) => {
    try {
        const tasks = await getProductionTasksModel();

        // Sign workOrderUrl if present
        const signedTasks = await Promise.all(tasks.map(async (task) => {
            if (task.workOrderUrl) {
                try {
                    const signedUrl = await generateSignedURL(task.workOrderUrl, 'documents');
                    return { ...task, workOrderUrl: signedUrl };
                } catch (e) {
                    console.error('Failed to sign work order URL:', e);
                    return task;
                }
            }
            return task;
        }));

        res.json({ tasks: signedTasks });
    } catch (error: any) {
        console.error('[Get Production Tasks] Error:', error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
};

// Update production task
export const updateProductionTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove ID if present in body to avoid error
        delete updateData.id;

        const task = await updateProductionTaskModel(id, updateData);
        res.json(task);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get tasks by assignee
export const getProductionTasksByAssignee = async (req: Request, res: Response) => {
    try {
        const { assigneeId } = req.params;
        const tasks = await prisma.productionTask.findMany({
            where: { assigneeId },
            orderBy: { createdAt: 'desc' }
        });

        // Sign workOrderUrl if present
        const signedTasks = await Promise.all(tasks.map(async (task) => {
            if (task.workOrderUrl) {
                try {
                    const signedUrl = await generateSignedURL(task.workOrderUrl, 'documents');
                    return { ...task, workOrderUrl: signedUrl };
                } catch (e) {
                    console.error('Failed to sign work order URL:', e);
                    return task;
                }
            }
            return task;
        }));

        res.status(200).json(signedTasks);
    } catch (error) {
        console.error("Error fetching assignee tasks:", error);
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
};

// Delete production task
export const deleteProductionTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await deleteProductionTaskModel(id);
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting production task:", error);
        res.status(500).json({ message: error.message || "Failed to delete task" });
    }
};

