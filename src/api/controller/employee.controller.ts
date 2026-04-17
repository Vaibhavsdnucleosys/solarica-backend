import { Request, Response } from "express";
import {
  createEmployeeModel,
  getAllEmployeesModel,
  getEmployeeByIdModel,
  updateEmployeeModel,
  deleteEmployeeModel,
  getEmployeesByCategoryModel,
  getCurrentEmployeeModel,
  updateEmployeeSalesTargetModel
} from "../model/employee.model";

// Create new employee (Admin only)
export const createEmployee = async (req: Request, res: Response) => {
  const { email, password, roleName, name, mobile, grants } = req.body;

  // Validate input
  if (!email || !password || !roleName || !name) {
    return res.status(400).json({
      message: "Email, password, role, and name required"
    });
  }

  try {
    const result = await createEmployeeModel(email, password, roleName, name, mobile);
    res.status(201).json({
      message: "Employee created successfully",
      employee: result
    });
  } catch (error: any) {
    if (error.message === "User with this email already exists") {
      return res.status(409).json({ message: error.message });
    }
    if (error.message.includes("Role must be one of")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all employees (Admin only)
export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await getAllEmployeesModel();
    res.json({
      message: "Employees retrieved successfully",
      employees
    });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get employee by ID (Admin only)
export const getEmployeeById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const employee = await getEmployeeByIdModel(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({
      message: "Employee retrieved successfully",
      employee
    });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update employee (Admin only)
export const updateEmployee = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, roleName, mobile } = req.body;

  try {
    const user = await updateEmployeeModel(id, name, email, roleName, mobile);
    res.json({
      message: "Employee updated successfully",
      employee: user
    });
  } catch (error: any) {
    if (error.message === "User not found") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "Email already exists" || error.message.includes("Role must be one of")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete employee (Admin only)
export const deleteEmployee = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await deleteEmployeeModel(id);
    res.json(result);
  } catch (error: any) {
    if (error.message === "User not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get employees by role (Admin only)
export const getEmployeesByCategory = async (req: Request, res: Response) => {
  const { roleName } = req.params;

  try {
    const users = await getEmployeesByCategoryModel(roleName);
    res.json({
      message: `Users with role ${roleName} retrieved successfully`,
      employees: users
    });
  } catch (error: any) {
    if (error.message.includes("Role must be one of")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get current employee profile (Employee only)
export const getCurrentEmployee = async (req: Request, res: Response) => {
  try {
    // userId comes from auth middleware (JWT)
    const userId = (req as any).user.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await getCurrentEmployeeModel(userId);

    if (!user) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      message: "Employee profile fetched successfully",
      data: user
    });

  } catch (error) {
    console.error("Get current employee error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Update employee's sales target
export const updateEmployeeSalesTarget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { salesTarget } = req.body;
    const userId = (req as any).user.id;

    if (salesTarget === undefined || salesTarget === null) {
      return res.status(400).json({ message: "Sales target is required" });
    }

    const updatedEmployee = await updateEmployeeSalesTargetModel(
      id,
      Number(salesTarget),
      userId
    );

    res.json({
      message: "Employee sales target updated successfully",
      data: updatedEmployee
    });
  } catch (error: any) {
    if (error.message === 'Not authorized to update this employee') {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({
      message: "Failed to update employee sales target",
      error: error.message
    });
  }
};

