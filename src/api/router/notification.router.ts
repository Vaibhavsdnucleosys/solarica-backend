import { Router } from "express";
import { auth } from "../../middleware/auth";
import { allow } from "../../middleware/role";
import {
    getNotifications,
    markAsRead,
    markAllAsRead
} from "../controller/notification.controller";

const notificationRouter = Router();

// All notification routes require authentication
notificationRouter.get("/", auth, allow("admin", "sales", "accounting"), getNotifications);
notificationRouter.patch("/:id/read", auth, allow("admin", "sales", "accounting"), markAsRead);
notificationRouter.patch("/read-all", auth, allow("admin", "sales", "accounting"), markAllAsRead);

export default notificationRouter;

