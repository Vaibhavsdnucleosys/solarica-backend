import { Router } from "express";
import { auth } from "../../middleware/auth";
import { allow } from "../../middleware/role";

import {
  createQuotation,
  generateQuotationPDF,
  getAllQuotations,
  getQuotationById,
  sendQuotationEmail,
  updateQuotationStatus,
  deleteQuotation,
  downloadPDF,
  getServiceTypes,
  upload,
  uploadDocs,
  uploadQuotationDocs,
  getQuotationDocs,
  updateQuotation,
  getNextEstimateNumber
} from "../controller/quotation.controller";
import { createProductionTask } from "../controller/production-task.controller";




const quotationRouter = Router();

// Public routes
quotationRouter.post("/respond/:id", updateQuotationStatus); // For email responses
quotationRouter.get("/respond/:id", updateQuotationStatus); // Support legacy GET links too
quotationRouter.get("/service-types", getServiceTypes); // Get available service types
quotationRouter.get("/next-estimate-number", getNextEstimateNumber); // Get next estimate number for a company
quotationRouter.get("/:id/download-pdf", downloadPDF); // PDF download with signed URL

// Admin & Sales only routes
quotationRouter.post("/", auth, allow("admin", "sales", "accounting", "operation"), createQuotation);
quotationRouter.get("/", auth, allow("admin", "sales", "operation", "operations", "accounting"), getAllQuotations);
quotationRouter.get("/:id", auth, allow("admin", "sales", "operation", "operations", "accounting"), getQuotationById);
quotationRouter.post("/:id/send-email", auth, allow("admin", "sales", "accounting", "operation"), sendQuotationEmail);
quotationRouter.post("/:id/generate-pdf", auth, allow("admin", "sales", "accounting", "operation"), generateQuotationPDF);
quotationRouter.post("/:id/upload-docs", auth, allow("admin", "sales", "accounting", "operation"), uploadDocs.fields([
  { name: 'doc1', maxCount: 1 },
  { name: 'doc2', maxCount: 1 },
  { name: 'doc3', maxCount: 1 }
]), uploadQuotationDocs);
quotationRouter.get("/:id/view-docs", auth, allow("admin", "sales", "operation", "user", "employee", "manager", "accounting"), getQuotationDocs);
quotationRouter.put("/:id", auth, allow("admin", "sales", "accounting", "operation"), updateQuotation);



// Admin only routes
quotationRouter.delete("/:id", auth, allow("admin"), deleteQuotation);
quotationRouter.post("/:quotationId/create-production-task", auth, allow("admin", "sales", "operation", "manager"), createProductionTask);

export default quotationRouter;

