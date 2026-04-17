import { Router } from "express";
import { auth } from "../../middleware/auth";
import { allow } from "../../middleware/role";
import {
  createInvoice,
  getInvoice,
  getAllInvoices,
  updateInvoice,
  deleteInvoice,
  downloadInvoice,
  getDeliveryPreview,
  sendInvoiceEmail,
  generateInvoiceWithDeliveryDate,
  downloadSalesInvoice,
  getNextInvoiceNumber,
  getNextExportNumber,
  respondToInvoice,
  convertToProforma
} from "../controller/invoice.controller";

import { createProductionTask } from "../controller/production-task.controller";
import { uploadInvoiceProof, getInvoiceProofs } from "../controller/payment-proof.controller";
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  }
});

const invoiceRouter = Router();

invoiceRouter.post("/:id/proofs", auth, allow("admin", "sales", "accounting", "operation"), upload.single('file'), uploadInvoiceProof);
invoiceRouter.get("/:id/proofs", auth, getInvoiceProofs);

invoiceRouter.get("/:id/download-invoice", downloadInvoice);
invoiceRouter.get("/:id/delivery-preview", getDeliveryPreview);
invoiceRouter.get("/:id/download-sales-invoice", downloadSalesInvoice);
invoiceRouter.get("/respond/:id", respondToInvoice);


// Get next export number (must be before :id routes)
invoiceRouter.get("/next-export-number", auth, allow("admin", "sales", "accounting", "operation"), getNextExportNumber);

// Invoice CRUD operations
invoiceRouter.get("/next-number", auth, allow("admin", "sales", "accounting", "operation"), getNextInvoiceNumber);
invoiceRouter.post("/", auth, allow("admin", "sales", "accounting", "operation"), createInvoice);
invoiceRouter.get("/", auth, allow("admin", "sales", "operation", "operations", "accounting"), getAllInvoices);
invoiceRouter.post("/:invoiceId/create-production-task", auth, allow("admin", "sales", "operation", "operations", "accounting"), createProductionTask);
invoiceRouter.get("/:id", auth, allow("admin", "sales", "operation", "operations", "accounting"), getInvoice);
invoiceRouter.put("/:id", auth, allow("admin", "sales", "accounting", "operation"), updateInvoice);
invoiceRouter.patch("/:id/proforma", auth, allow("admin", "sales", "accounting", "operation"), convertToProforma);
invoiceRouter.post("/:id/send-email", auth, allow("admin", "sales", "accounting", "operation"), sendInvoiceEmail);
invoiceRouter.get("/:id/delivery-preview", auth, allow("admin", "sales", "accounting", "operation"), generateInvoiceWithDeliveryDate);
invoiceRouter.delete("/:id", auth, allow("admin"), deleteInvoice);

export default invoiceRouter;

