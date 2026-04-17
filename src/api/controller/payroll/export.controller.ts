import { Request, Response } from "express";
import * as exportService from "../../../services/payroll/statutory/statutoryExport.service";

/**
 * Statutory Export Controller
 */

export const getPFExport = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ success: false, message: "Month and Year are required" });
        }

        const data = await exportService.exportPFData(companyId, Number(month), Number(year));
        res.status(200).json({ success: true, data });
    } catch (error: any) {
        console.error("[Statutory Export] PF error:", error);
        res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};

export const getPTExport = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ success: false, message: "Month and Year are required" });
        }

        const data = await exportService.exportPTData(companyId, Number(month), Number(year));
        res.status(200).json({ success: true, data });
    } catch (error: any) {
        console.error("[Statutory Export] PT error:", error);
        res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};

export const getStatutoryExport = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ success: false, message: "Month and Year are required" });
        }

        const data = await exportService.exportStatutoryData(companyId, Number(month), Number(year));
        res.status(200).json({ success: true, data });
    } catch (error: any) {
        console.error("[Statutory Export] Combined error:", error);
        res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};

