import dotenv from "dotenv";
dotenv.config();

import "./workers/quotation.worker";
import { logger } from "./config/logger.config";

logger.info("🚀 Background Worker Service Started");

// Handle Graceful Shutdown
process.on("SIGTERM", () => {
    logger.info("Worker shutting down safely...");
    process.exit(0);
});

