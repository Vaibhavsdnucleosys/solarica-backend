import { Request, Response } from "express";
import {
  getSolarHeaterCatalog,
  getSolarPanelCatalog,
  getSolarInverterCatalog,
  getDecorativeLightCatalog,
  getSolarCameraCatalog,
  getAllCatalogs,
  getSolarPumpDcCatalog,
  getSolarAcPumpControllerCatalog,
  getSolarStreetLightAllInOneCatalog
} from "../model/catalog.model";

// Get all catalogs (master API)
export const getAllCatalogsController = async (req: Request, res: Response) => {
  try {
    const catalogs = await getAllCatalogs();
    res.status(200).json({
      success: true,
      data: catalogs
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch catalogs",
      error: error.message
    });
  }
};

// Get solar heaters catalog
export const getSolarHeatersController = async (req: Request, res: Response) => {
  try {
    const heaters = await getSolarHeaterCatalog();
    res.status(200).json({
      success: true,
      data: heaters
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch solar heaters catalog",
      error: error.message
    });
  }
};

// Get solar panels catalog
export const getSolarPanelsController = async (req: Request, res: Response) => {
  try {
    const panels = await getSolarPanelCatalog();
    res.status(200).json({
      success: true,
      data: panels
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch solar panels catalog",
      error: error.message
    });
  }
};

// Get solar inverters catalog
export const getSolarInvertersController = async (req: Request, res: Response) => {
  try {
    const inverters = await getSolarInverterCatalog();
    res.status(200).json({
      success: true,
      data: inverters
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch solar inverters catalog",
      error: error.message
    });
  }
};

// Get decorative lights catalog
export const getDecorativeLightsController = async (req: Request, res: Response) => {
  try {
    const lights = await getDecorativeLightCatalog();
    res.status(200).json({
      success: true,
      data: lights
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch decorative lights catalog",
      error: error.message
    });
  }
};

// Get solar cameras catalog
export const getSolarCamerasController = async (req: Request, res: Response) => {
  try {
    const cameras = await getSolarCameraCatalog();
    res.status(200).json({
      success: true,
      data: cameras
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch solar cameras catalog",
      error: error.message
    });
  }
};

export const getSolarPumpDcController = async (req: Request, res: Response) => {
  try {
    const pumpDc = await getSolarPumpDcCatalog();
    res.status(200).json({
      success: true,
      data: pumpDc
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch solar pump dc catalog",
      error: error.message
    });
  }
};

export const getSolarAcPumpControllerController = async (req: Request, res: Response) => {
  try {
    const pumpAc = await getSolarAcPumpControllerCatalog();
    res.status(200).json({
      success: true,
      data: pumpAc
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch solar ac pump controller catalog",
      error: error.message
    });
  }
};

export const getSolarStreetLightAllInOneController = async (req: Request, res: Response) => {
  try {
    const streetLightAllInOne = await getSolarStreetLightAllInOneCatalog();
    res.status(200).json({
      success: true,
      data: streetLightAllInOne
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch solar street light all in one catalog",
      error: error.message
    });
  }
};

