import { Router } from "express";
import { auth } from "../../middleware/auth";
import { allow } from "../../middleware/role";
import {
  createWorker,
  getAllWorkers,
  getWorkerById,
  updateWorker,
  deleteWorker,
  getWorkersByCompany
} from "../controller/worker.controller";

const workerRouter = Router();

// Admin only routes
workerRouter.post("/", auth, allow("admin"), createWorker);
workerRouter.get("/", auth, allow("admin"), getAllWorkers);
workerRouter.get("/:id", auth, allow("admin"), getWorkerById);
workerRouter.put("/:id", auth, allow("admin"), updateWorker);
workerRouter.delete("/:id", auth, allow("admin"), deleteWorker);
workerRouter.get("/company/:company", auth, allow("admin"), getWorkersByCompany);

export default workerRouter;

