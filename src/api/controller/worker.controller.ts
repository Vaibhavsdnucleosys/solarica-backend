import { Request, Response } from "express";
import {
  createWorkerModel,
  getAllWorkersModel,
  getWorkerByIdModel,
  updateWorkerModel,
  deleteWorkerModel,
  getWorkersByCompanyModel
} from "../model/worker.model";

// Create new worker (Admin only)
export const createWorker = async (req: Request, res: Response) => {
  const { name, email, company, location, userId } = req.body;

  // Validate input
  if (!name || !email || !company || !location) {
    return res.status(400).json({
      message: "Name, email, company, and location are required"
    });
  }

  try {
    const worker = await createWorkerModel(name, email, company, location, userId);
    res.status(201).json({
      message: "Worker created successfully",
      worker
    });
  } catch (error: any) {
    if (error.message === "Worker with this email already exists") {
      return res.status(409).json({ message: error.message });
    }
    if (error.message === "User not found" ||
      error.message === "Cannot assign admin user to worker profile" ||
      error.message === "User is already linked to a worker profile") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all workers with details (Admin only)
export const getAllWorkers = async (req: Request, res: Response) => {
  try {
    const workers = await getAllWorkersModel();
    res.json({
      message: "Workers retrieved successfully",
      workers
    });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get worker by ID (Admin only)
export const getWorkerById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const worker = await getWorkerByIdModel(id);
    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }
    res.json({
      message: "Worker retrieved successfully",
      worker
    });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update worker (Admin only)
export const updateWorker = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, company, location, userId } = req.body;

  try {
    const worker = await updateWorkerModel(id, name, email, company, location, userId);
    res.json({
      message: "Worker updated successfully",
      worker
    });
  } catch (error: any) {
    if (error.message === "Worker not found" ||
      error.message === "User not found" ||
      error.message === "Cannot assign admin user to worker profile" ||
      error.message === "User is already linked to another worker profile") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "Email already exists") {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete worker (Admin only)
export const deleteWorker = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await deleteWorkerModel(id);
    res.json(result);
  } catch (error: any) {
    if (error.message === "Worker not found") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "Cannot delete worker who is leading a team. Please assign a new leader first.") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get workers by company (Admin only)
export const getWorkersByCompany = async (req: Request, res: Response) => {
  const { company } = req.params;

  try {
    const workers = await getWorkersByCompanyModel(company);
    res.json({
      message: `Workers from ${company} retrieved successfully`,
      workers
    });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
};


