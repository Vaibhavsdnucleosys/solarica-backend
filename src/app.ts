import express from "express";
import cors from "cors";
import { initDB } from "./init/db.init";
import { indexRouter } from "./api/router/index.router";
import { requestLogger } from "./middleware/logger.middleware";
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { serverAdapter } from "./config/bullboard.config";
import hsnRoutes from "./api/router/hsn.router";
const app = express();

// CORS configuration
// app.use(cors({ origin: true, credentials: true }));
app.use(cors({
  origin: "*", // allow all for now (we'll secure later)
  credentials: true
}));
app.use(express.json());
app.use(requestLogger);


// Initialize database connection
initDB();

import tallyRouter from "./api/router/tally.router";

app.use("/api/v1", indexRouter);
app.use("/", tallyRouter); // Expose on root level as per request /crm/* or /api/v1/crm/*? Request said /crm/*


// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    supportedSubmitMethods: []
  }
}));

// Register the dashboard route with your app
app.use('/admin/queues', serverAdapter.getRouter());

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("!!! GLOBAL ERROR !!!");
  console.error("Error Message:", err.message);
  console.error("Stack Trace:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message
  });
});





app.use(express.json());

app.use("/api/v1/hsn-master", hsnRoutes);



app.get("/", (req, res) => {
  res.send("API is running...");
});
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});
export default app;

