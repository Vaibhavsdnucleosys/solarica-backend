import prisma from "../../config/prisma";

// Get all solar heaters
export const getSolarHeaterCatalog = async () => {
  return await prisma.solarHeaterCatalog.findMany({
    orderBy: { id: 'asc' }
  });
};

// Get all solar panels
export const getSolarPanelCatalog = async () => {
  return await prisma.solarPanelCatalog.findMany({
    orderBy: { id: 'asc' }
  });
};

// Get all solar inverters
export const getSolarInverterCatalog = async () => {
  return await prisma.solarInverterCatalog.findMany({
    orderBy: { capacityKw: 'asc' }
  });
};

// Get all decorative lights
export const getDecorativeLightCatalog = async () => {
  return await prisma.decorativeLightCatalog.findMany({
    orderBy: { id: 'asc' }
  });
};

// Get all solar cameras
export const getSolarCameraCatalog = async () => {
  return await prisma.solarCameraCatalog.findMany({
    orderBy: { id: 'asc' }
  });
};

// Get all solar pump dc
export const getSolarPumpDcCatalog = async () => {
  return await prisma.solarPumpDcCatalog.findMany({
    orderBy: { id: 'asc' }
  });
};

// Get all solar ac pump controller
export const getSolarAcPumpControllerCatalog = async () => {
  return await prisma.solarAcPumpControllerCatalog.findMany({
    orderBy: { id: 'asc' }
  });
};

// Get all solar street light all in one
export const getSolarStreetLightAllInOneCatalog = async () => {
  return await prisma.solarStreetLightAllInOneCatalog.findMany({
    orderBy: { id: 'asc' }
  });
};

// Get all catalogs in one call
export const getAllCatalogs = async () => {
  const [solarHeaters, solarPanels, solarInverters, decorativeLights, solarCameras, solarPumpDc, solarAcPumpController, solarStreetLightAllInOne] = await Promise.all([
    getSolarHeaterCatalog(),
    getSolarPanelCatalog(),
    getSolarInverterCatalog(),
    getDecorativeLightCatalog(),
    getSolarCameraCatalog(),
    getSolarPumpDcCatalog(),
    getSolarAcPumpControllerCatalog(),
    getSolarStreetLightAllInOneCatalog()
  ]);

  return {
    solarHeaters,
    solarPanels,
    solarInverters,
    decorativeLights,
    solarCameras,
    solarPumpDc,
    solarAcPumpController,
    solarStreetLightAllInOne
  };
};

