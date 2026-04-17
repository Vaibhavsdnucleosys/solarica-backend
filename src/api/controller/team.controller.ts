import { Request, Response } from "express";
import {
  createTeamModel,
  getAllTeamsModel,
  getTeamByIdModel,
  updateTeamModel,
  deleteTeamModel,
  addWorkerToTeamModel,
  removeWorkerFromTeamModel,
  getTeamMembersModel,
  getWorkersWithoutTeamsModel
} from "../model/team.model";

// Create new team (Admin only)
export const createTeam = async (req: Request, res: Response) => {
  const { name, location, leaderId, company } = req.body;

  // Validate input
  if (!name || !location || !leaderId || !company) {
    return res.status(400).json({
      message: "Name, location, company, and leaderId are required"
    });
  }

  try {
    const team = await createTeamModel(name, location, leaderId, company);
    res.status(201).json({
      message: "Team created successfully",
      team
    });
  } catch (error: any) {
    if (error.message === "Team with this name already exists" ||
      error.message === "Worker not found" ||
      error.message === "This worker is already leading another team") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all teams with details (Admin only)
export const getAllTeams = async (req: Request, res: Response) => {
  try {
    const teams = await getAllTeamsModel();
    res.json({
      message: "Teams retrieved successfully",
      teams
    });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get team by ID (Admin only)
export const getTeamById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const team = await getTeamByIdModel(id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.json({
      message: "Team retrieved successfully",
      team
    });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update team (Admin only)
export const updateTeam = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, location, leaderId } = req.body;

  try {
    const team = await updateTeamModel(id, name, location, leaderId);
    res.json({
      message: "Team updated successfully",
      team
    });
  } catch (error: any) {
    if (error.message === "Team not found" ||
      error.message === "Team name already exists" ||
      error.message === "Worker not found" ||
      error.message === "This worker is already leading another team") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete team (Admin only)
export const deleteTeam = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await deleteTeamModel(id);
    res.json(result);
  } catch (error: any) {
    if (error.message === "Team not found") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "Cannot delete team with workers. Please remove all workers first.") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};



// Add worker to team (Admin only)
export const addWorkerToTeam = async (req: Request, res: Response) => {
  const { teamId, workerId } = req.body;

  if (!teamId || !workerId) {
    return res.status(400).json({
      message: "Team ID and Worker ID are required"
    });
  }

  try {
    const worker = await addWorkerToTeamModel(teamId, workerId);
    res.json({
      message: "Worker added to team successfully",
      worker
    });
  } catch (error: any) {
    if (error.message === "Team not found" ||
      error.message === "Worker not found" ||
      error.message === "Worker is already in a team") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove worker from team (Admin only)
export const removeWorkerFromTeam = async (req: Request, res: Response) => {
  const { workerId } = req.body;

  if (!workerId) {
    return res.status(400).json({
      message: "Worker ID is required"
    });
  }

  try {
    const worker = await removeWorkerFromTeamModel(workerId);
    res.json({
      message: "Worker removed from team successfully",
      worker
    });
  } catch (error: any) {
    if (error.message === "Worker not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get team members (Admin only)
export const getTeamMembers = async (req: Request, res: Response) => {
  const { teamId } = req.params;

  try {
    const team = await getTeamMembersModel(teamId);
    res.json({
      message: "Team members retrieved successfully",
      team
    });
  } catch (error: any) {
    if (error.message === "Team not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get workers without teams (Admin only)
export const getWorkersWithoutTeams = async (req: Request, res: Response) => {
  try {
    const workers = await getWorkersWithoutTeamsModel();
    res.json({
      message: "Workers without teams retrieved successfully",
      workers
    });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
};

