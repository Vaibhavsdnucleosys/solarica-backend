import { prisma } from "../config/prisma";

export { prisma };

export const initDB = async () => {
  try {
    await prisma.$connect();
    console.log("🚀 Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed. Service will continue but DB features will fail.", error);
    // process.exit(1); // commented out to prevent server crash
  }
};

