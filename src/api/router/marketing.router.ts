import { Router } from "express";
// import { auth } from "../../middleware/auth"; // Uncomment if auth is needed
import { sendBulkEmailController } from "../controller/marketing.controller";
import multer from 'multer';

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per file
});

const marketingRouter = Router();

// Route for sending bulk emails
// Using 'attachments' as the field name for files, max 5 files
marketingRouter.post("/bulk-email", upload.array('attachments', 5), sendBulkEmailController);

export default marketingRouter;

