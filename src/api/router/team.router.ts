import { Router } from "express";
import { auth } from "../../middleware/auth";
import { allow } from "../../middleware/role";
import {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addWorkerToTeam,
  removeWorkerFromTeam,
  getTeamMembers,
  getWorkersWithoutTeams
} from "../controller/team.controller";

const teamRouter = Router();

// Admin only routes
teamRouter.post("/", auth, allow("admin"), createTeam);
teamRouter.get("/", auth, allow("admin"), getAllTeams);
teamRouter.get("/:id", auth, allow("admin"), getTeamById);
teamRouter.put("/:id", auth, allow("admin"), updateTeam);
teamRouter.delete("/:id", auth, allow("admin"), deleteTeam);


// Team management routes
teamRouter.post("/add-worker", auth, allow("admin"), addWorkerToTeam);
teamRouter.post("/remove-worker", auth, allow("admin"), removeWorkerFromTeam);
teamRouter.get("/:teamId/members", auth, allow("admin"), getTeamMembers);
teamRouter.get("/workers/without-team", auth, allow("admin"), getWorkersWithoutTeams);

export default teamRouter;

