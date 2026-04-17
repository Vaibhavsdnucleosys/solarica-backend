import { Request, Response } from "express";
import {
  getAllEmployeesReportModel,
  getEmployeeReportByIdModel,
  getTeamPerformanceSummaryModel,
  getMonthlySalesReportModel,
  //getServiceTypeAnalyticsModel
} from "../model/employee-report.model";

// Get all employees reports (Admin only)
export const getAllEmployeesReports = async (req: Request, res: Response) => {
  try {
    const { company } = req.query;
    const reports = await getAllEmployeesReportModel(company as string);
    res.json({
      message: "Employee reports retrieved successfully",
      reports
    });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get specific employee report (Admin only)
export const getEmployeeReportById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { company } = req.query;

  try {
    const report = await getEmployeeReportByIdModel(id, company as string);
    res.json({
      message: "Employee report retrieved successfully",
      report
    });
  } catch (error: any) {
    if (error.message === 'Employee not found or not a sales employee') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get team performance summary (Admin only)
export const getTeamPerformanceSummary = async (req: Request, res: Response) => {
  try {
    const { company } = req.query;
    const summary = await getTeamPerformanceSummaryModel(company as string);
    res.json({
      message: "Team performance summary retrieved successfully",
      summary
    });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get monthly sales report
export const getMonthlySalesReport = async (req: Request, res: Response) => {
  try {
    const months = req.query.months
      ? Math.min(Number(req.query.months), 12) // Max 12 months
      : 12; // Default to 12 months
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const { company } = req.query;

    const report = await getMonthlySalesReportModel(months, year, company as string);

    res.json({
      message: "Monthly sales report retrieved successfully",
      data: report
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch monthly sales report",
      error: error.message
    });
  }
};

// Get service type analytics (Admin only)
// export const getServiceTypeAnalytics = async (req: Request, res: Response) => {
//   try {
//     const analytics = await getServiceTypeAnalyticsModel();
//     res.json({
//       message: "Service type analytics retrieved successfully",
//       analytics
//     });
//   } catch (error: any) {
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

