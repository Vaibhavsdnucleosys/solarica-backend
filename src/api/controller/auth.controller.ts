import bcrypt from "bcrypt";
import prisma from "../../config/prisma";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { logger } from "../../config/logger.config";


export const registerAdmin = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // Check if admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: { name: "admin" } }
  });
  if (existingAdmin) {
    return res.status(403).json({
      message: "Admin registration blocked - admin already exists",
      hint: "Use login endpoint instead"
    });
  }

  // Validate input
  if (!email || !password || !name) {
    return res.status(400).json({ message: "Name and Email and password required" });
  }

  // Get or create admin role
  let adminRole = await prisma.role.findUnique({ where: { name: "admin" } });
  if (!adminRole) {
    adminRole = await prisma.role.create({ data: { name: "admin" } });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      roleId: adminRole.id
    },
    include: { role: true }
  });

  // Return only non-sensitive data
  const { password: _, ...adminData } = admin;

  res.status(201).json({
    message: "Admin registered successfully",
    admin: adminData
  });
};

export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const admin = await prisma.user.findUnique({
    where: { email },
    include: { role: true }
  });
  if (!admin || admin.role.name !== "admin") {
    return res.status(404).json({ message: "Admin not found" });
  }

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return res.status(401).json({ message: "Invalid password" });

  const token = jwt.sign(
    { id: admin.id, role: admin.role.name, email: admin.email },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  const { password: _, ...adminData } = admin;

  res.json({
    message: "Login successful",
    token,
    admin: adminData
  });
};

export const employeeLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true }
  });
  if (!user || user.role.name === "admin") {
    return res.status(404).json({ message: "Employee not found" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid password" });

  const token = jwt.sign(
    { id: user.id, role: user.role.name, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  const { password: _, ...userData } = user;

  res.json({
    message: "Login successful",
    token,
    employee: userData
  });
};

// Register user with specific role
export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, roleName } = req.body;

  // Validate input
  if (!name || !email || !password || !roleName) {
    return res.status(400).json({ message: "Name, Email, password, and role required" });
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ message: "User with this email already exists" });
  }

  // Get or create role
  let role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      roleId: role.id
    },
    include: { role: true }
  });

  // Return only non-sensitive data
  const { password: _, ...userData } = user;

  res.status(201).json({
    message: "User registered successfully",
    user: userData
  });
};

export const login = async (req: Request, res: Response) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });

    if (!user) {
      logger.warn(`Failed login attempt: User not found (${email})`);
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isActive) {
      logger.warn(`Failed login attempt: Account deactivated (${email})`);
      return res.status(403).json({ message: "Account is deactivated. Please contact admin." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      logger.warn(`Failed login attempt: Invalid password for ${email}`);
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role.name, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const { password: _, ...userData } = user;

    logger.info(`User logged in: ${email} (Role: ${user.role.name})`);

    res.json({
      message: "Login successful",
      token,
      user: userData
    });
  } catch (error: any) {
    logger.error("Login fatal error:", { error: error.message, email });
    res.status(500).json({ message: "Internal server error" });
  }
};

