import { Request, Response } from "express";
import * as ptSlabService from "../../../services/payroll/statutory/ptSlab.service";

/**
 * Handle PT slab creation
 */
export const createPTSlab = async (req: Request, res: Response) => {
    try {
        const slab = await ptSlabService.createPTSlab(req.body);
        res.status(201).json({ message: "PT Slab created successfully", data: slab });
    } catch (error: any) {
        console.error("[PT Slab Controller] Create error:", error);
        res.status(400).json({ message: error.message || "Failed to create PT slab" });
    }
};

/**
 * Handle listing PT slabs by state
 */
export const getPTSlabsByState = async (req: Request, res: Response) => {
    try {
        const { state } = req.query;
        if (!state) {
            return res.status(400).json({ message: "State is required" });
        }
        const slabs = await ptSlabService.getPTSlabsByState(state as string);
        res.json({ data: slabs });
    } catch (error: any) {
        console.error("[PT Slab Controller] List error:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

/**
 * Handle PT slab update
 */
export const updatePTSlab = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const slab = await ptSlabService.updatePTSlab(id, req.body);
        res.json({ message: "PT Slab updated successfully", data: slab });
    } catch (error: any) {
        console.error("[PT Slab Controller] Update error:", error);
        res.status(400).json({ message: error.message || "Failed to update PT slab" });
    }
};

/**
 * Handle PT slab deletion
 */
export const deletePTSlab = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await ptSlabService.deletePTSlab(id);
        res.json({ message: "PT Slab deleted successfully" });
    } catch (error: any) {
        console.error("[PT Slab Controller] Delete error:", error);
        res.status(400).json({ message: error.message || "Failed to delete PT slab" });
    }
};

