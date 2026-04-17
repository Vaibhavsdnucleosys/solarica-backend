import { Router } from "express";
import { auth } from "../../middleware/auth";
import {
    getProductionTasks,
    updateProductionTask,
    getProductionTasksByAssignee,
    createProductionTask,
    uploadWorkOrder,
    deleteProductionTask
} from "../controller/production-task.controller";
import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const productionTaskRouter = Router();

productionTaskRouter.get("/", auth, getProductionTasks);
productionTaskRouter.post("/", auth, createProductionTask);
productionTaskRouter.post("/upload-work-order", auth, upload.single('file'), uploadWorkOrder);
productionTaskRouter.patch("/:id", auth, updateProductionTask);
productionTaskRouter.delete("/:id", auth, deleteProductionTask);
productionTaskRouter.get("/assignee/:assigneeId", auth, getProductionTasksByAssignee);

export default productionTaskRouter;

