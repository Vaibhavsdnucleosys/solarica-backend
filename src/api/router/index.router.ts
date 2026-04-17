import express from "express";
import authRouter from "./auth.router";
import employeeRouter from "./employee.router";
import workerRouter from "./worker.router";
import teamRouter from "./team.router";
import quotationRouter from "./quotation.router";
import employeeReportRouter from "./employee-report.router";
import leadRouter from "./lead.router";
import notificationRouter from "./notification.router";
import paymentProofRouter from "./payment-proof.router";
import catalogRouter from "./catalog.router";
import invoiceRouter from "./invoice.router";
import taskRouter from "./task.router";
import accountingRouter from "./accounting";
import inventoryRouter from "./inventory";
import payrollRouter from "./payroll";
import payrollLegacyRouter from "./payroll.router";
import hsnRouter from './hsn.router';
import dashboardRouter from "./dashboard.router";
import productionTaskRouter from "./production-task.router";
import workOrderRouter from "./work-order.router";
import marketingRouter from "./marketing.router";

const indexRouter = express.Router();

indexRouter.use("/auth", authRouter);
indexRouter.use("/employees", employeeRouter);
indexRouter.use("/workers", workerRouter);
indexRouter.use("/teams", teamRouter);
indexRouter.use("/quotations", quotationRouter);
indexRouter.use("/quotations", paymentProofRouter);
indexRouter.use("/employee-reports", employeeReportRouter);
indexRouter.use("/leads", leadRouter);
indexRouter.use("/notifications", notificationRouter);
indexRouter.use("/catalog", catalogRouter);
indexRouter.use("/invoices", invoiceRouter);
indexRouter.use("/tasks", taskRouter);
indexRouter.use("/production-tasks", productionTaskRouter);
indexRouter.use("/work-order", workOrderRouter);
indexRouter.use("/accounting", accountingRouter);
indexRouter.use("/marketing", marketingRouter);
indexRouter.use("/inventory", inventoryRouter);
indexRouter.use("/payroll", payrollRouter);
indexRouter.use("/payroll", payrollLegacyRouter);
indexRouter.use('/hsn-master', hsnRouter);
indexRouter.use("/dashboard", dashboardRouter);

export { indexRouter };

