import { Router } from "express";
import * as ptSlabCtrl from "../../controller/payroll/ptSlab.controller";
import { auth } from "../../../middleware/auth";
import { allow } from "../../../middleware/role";

const ptSlabRouter = Router();

// PT Slab Master CRUD - Admin only
ptSlabRouter.post("/", auth, allow("admin"), ptSlabCtrl.createPTSlab);
ptSlabRouter.get("/", auth, allow("admin", "accounting"), ptSlabCtrl.getPTSlabsByState);
ptSlabRouter.put("/:id", auth, allow("admin"), ptSlabCtrl.updatePTSlab);
ptSlabRouter.delete("/:id", auth, allow("admin"), ptSlabCtrl.deletePTSlab);

export default ptSlabRouter;

