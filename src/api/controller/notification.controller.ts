import { Request, Response } from "express";
import { logger } from "../../config/logger.config";
import {
    getNotificationsModel,
    markAsReadModel,
    markAllAsReadModel
} from "../model/notification.model";

export const getNotifications = async (req: Request, res: Response) => {
    try {
        console.log(`[Notification Controller] Fetching notifications for user: ${(req as any).user?.email}`);
        const notifications = await getNotificationsModel();
        return res.json({
            message: "Notifications retrieved successfully",
            notifications
        });
    } catch (error: any) {
        logger.error('[Notification Controller] getNotifications error:', { message: error.message, stack: error.stack });
        return res.status(500).json({ 
            success: false, 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const notification = await markAsReadModel(id);
        res.json({
            message: "Notification marked as read",
            notification
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        await markAllAsReadModel();
        res.json({
            message: "All notifications marked as read"
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

