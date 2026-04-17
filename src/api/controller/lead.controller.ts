  // src/api/controller/lead.controller.ts
  import { Request, Response } from "express";
  import {
    createLeadModel,
    getLeadsModel,
    getLeadByIdModel,
    updateLeadModel,
    deleteLeadModel,
    getLeadStatsModel,
    getAllLeadEmails,
    searchLeadNamesModel,
    getAllLeadPhoneNumbers,
  } from "../model/lead.model";

  export const createLead = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const {
        name,
        company,
        email,
        phone,
        source,
        estimatedValue,
        notes,
        customerType
      } = req.body;

      const lead = await createLeadModel(
        name,
        company,
        email,
        phone,
        source,
        userId,
        estimatedValue,
        notes,
          customerType
      );

      res.status(201).json({
        message: "Lead created successfully",
        data: lead,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to create lead", error: error.message });
    }
  };

  export const getLeads = async (req: Request, res: Response) => {
    try {
      console.log("[Get Leads] Starting request...");
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      const filters = req.query;

      console.log("[Get Leads] User ID:", userId);
      console.log("[Get Leads] User Role:", userRole);
      console.log("[Get Leads] Filters:", filters);

      const leads = await getLeadsModel(userId, userRole, filters);

      console.log("[Get Leads] Successfully fetched", leads.length, "leads");

      res.json({ data: leads });
    } catch (error: any) {
      console.error("[Get Leads] Error:", error);
      console.error("[Get Leads] Error Message:", error.message);
      console.error("[Get Leads] Error Stack:", error.stack);
      res.status(500).json({
        message: "Failed to fetch leads",
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  };

  export const getLead = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      const lead = await getLeadByIdModel(id, userId, userRole);

      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      res.json({ data: lead });
    } catch (error: any) {
      res.status(500).json({
        message: "Failed to fetch lead",
        error: error.message,
      });
    }
  };

  export const updateLead = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      const lead = await updateLeadModel(id, userId, userRole, req.body);

      res.json({
        message: "Lead updated successfully",
        data: lead,
      });
    } catch (error: any) {
      res.status(500).json({
        message: "Failed to update lead",
        error: error.message,
      });
    }
  };

  export const deleteLead = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      await deleteLeadModel(id, userId, userRole);

      res.json({ message: "Lead deleted successfully" });
    } catch (error: any) {
      res.status(500).json({
        message: "Failed to delete lead",
        error: error.message,
      });
    }
  };

  export const getLeadStats = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      const stats = await getLeadStatsModel(userId, userRole);

      res.json({ data: stats });
    } catch (error: any) {
      res.status(500).json({
        message: "Failed to fetch lead statistics",
        error: error.message,
      });
    }
  };


  // In lead.controller.ts
  export const getLeadEmails = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }

      const emails = await getAllLeadEmails();

      res.status(200).json({
        success: true,
        data: emails
      });
    } catch (error: any) {
      console.error("Error in getLeadEmails:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch lead emails: " + error.message
      });
    }
  };

  export const searchLeadNames = async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      if (!query) {
        return res.json({ data: [] });
      }

      const leads = await searchLeadNamesModel(query, userId, userRole);
      res.json({ data: leads });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to search leads", error: error.message });
    }
  };

  export const getLeadPhoneNumbers = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }

      const phones = await getAllLeadPhoneNumbers();

      res.status(200).json({
        success: true,
        data: phones
      });
    } catch (error: any) {
      console.error("Error in getLeadPhoneNumbers:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch lead phone numbers: " + error.message
      });
    }
  };

