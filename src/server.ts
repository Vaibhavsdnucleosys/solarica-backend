import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { logger } from "./config/logger.config";
import "./workers/quotation.worker"; // Start the worker

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...", { error: err.message, stack: err.stack });
  process.exit(1);
});

// Handle unhandled rejections
process.on("unhandledRejection", (err: any) => {
  logger.error("UNHANDLED REJECTION! 💥 Shutting down...", { error: err.message, stack: err.stack });
  server.close(() => {
    process.exit(1);
  });
});


