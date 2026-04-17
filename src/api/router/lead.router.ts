// src/api/router/lead.router.ts
import { Router } from "express";
import { auth } from "../../middleware/auth";
import { allow } from "../../middleware/role";
import {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
  getLeadStats,
  getLeadEmails,
  searchLeadNames,
  getLeadPhoneNumbers,
} from "../controller/lead.controller";

const leadRouter = Router();

// Protected routes (require authentication)


// Lead CRUD operations
leadRouter.post("/", auth, allow("admin", "sales", "accounting", "operation"), createLead);
leadRouter.get("/", auth, allow("admin", "sales", "accounting", "operation"), getLeads);
leadRouter.get("/stats", auth, allow("admin", "sales", "accounting", "operation"), getLeadStats);
leadRouter.get('/emails', auth, allow('admin', 'sales', 'accounting', 'operation'), getLeadEmails)
leadRouter.get('/phones', auth, allow('admin', 'sales', 'accounting', 'operation'), getLeadPhoneNumbers)
leadRouter.get("/search", auth, allow("admin", "sales", "accounting", "operation"), searchLeadNames);
leadRouter.get("/:id", auth, allow("admin", "sales", "accounting", "operation"), getLead);
leadRouter.put("/:id", auth, allow("admin", "sales", "accounting", "operation"), updateLead);
leadRouter.delete("/:id", auth, allow("admin", "sales"), deleteLead);

export default leadRouter;

