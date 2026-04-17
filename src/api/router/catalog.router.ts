import { Router } from "express";
import { auth } from "../../middleware/auth";
import { allow } from "../../middleware/role";
import {
  getAllCatalogsController,
  getSolarHeatersController,
  getSolarPanelsController,
  getSolarInvertersController,
  getDecorativeLightsController,
  getSolarCamerasController,
  getSolarPumpDcController,
  getSolarAcPumpControllerController,
  getSolarStreetLightAllInOneController
} from "../controller/catalog.controller";

const catalogRouter = Router();

// Master API - Get all catalogs
catalogRouter.get("/", auth, allow("admin", "sales", "user", "employee", "manager", "operation", "accounting"), getAllCatalogsController);

// Individual catalog APIs
catalogRouter.get("/solar-heaters", auth, allow("admin", "sales", "user", "employee", "manager", "operation", "accounting"), getSolarHeatersController);
catalogRouter.get("/solar-panels", auth, allow("admin", "sales", "user", "employee", "manager", "operation", "accounting"), getSolarPanelsController);
catalogRouter.get("/solar-inverters", auth, allow("admin", "sales", "user", "employee", "manager", "operation", "accounting"), getSolarInvertersController);
catalogRouter.get("/decorative-lights", auth, allow("admin", "sales", "user", "employee", "manager", "operation", "accounting"), getDecorativeLightsController);
catalogRouter.get("/solar-cameras", auth, allow("admin", "sales", "user", "employee", "manager", "operation", "accounting"), getSolarCamerasController);
catalogRouter.get("/solar-pump-dc", auth, allow("admin", "sales", "user", "employee", "manager", "operation", "accounting"), getSolarPumpDcController);
catalogRouter.get("/solar-pump-ac", auth, allow("admin", "sales", "user", "employee", "manager", "operation", "accounting"), getSolarAcPumpControllerController);
catalogRouter.get("/solar-street-light", auth, allow("admin", "sales", "user", "employee", "manager", "operation", "accounting"), getSolarStreetLightAllInOneController);

export default catalogRouter;

