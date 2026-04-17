/**
 * Statutory Configuration Controller
 */
import { Request, Response } from "express";
import { getStatutoryConfig, updateStatutoryConfig, activatePayroll } from "../../../services/payroll/statutory/statutory.service";
import {
    generatePFECR,
    generatePTStatement,
    getPTMonthlyStatutoryReport,
    getPTAnnualStatutoryReport,
    getPTEmployeeWiseStatutoryReport,
    generatePFForm3A,
    generatePFAdminChargesSummary,
    postPFAdminChargesVoucher,
    getPFSummaryReport as generatePFSummaryReport,
    getPFEmployeeWiseReport as generatePFEmployeeWiseReport,
    getPFForm5 as generatePFForm5,
    getPFForm10 as generatePFForm10
} from "../../../services/payroll/statutory/statutoryReport.service";
import { generatePFSummaryExcel, generatePTMonthlyExcel } from "../../../services/payroll/statutory/excelReport.service";

export const getPFECRFile = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { month, year } = req.query;

        const content = await generatePFECR(companyId, Number(month), Number(year));

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename=PF_ECR_${month}_${year}.txt`);
        res.send(content);
    } catch (error: any) {
        console.error("[Statutory Report] PF ECR error:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getPFForm3A = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { financialYear, employeeId } = req.query;

        if (!financialYear) {
            return res.status(400).json({ message: "Financial Year is required" });
        }

        const data = await generatePFForm3A(companyId, String(financialYear), employeeId ? String(employeeId) : undefined);
        res.json({ message: "PF Form 3A data generated", data });
    } catch (error: any) {
        console.error("[Statutory Report] PF Form 3A error:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getPTReport = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { month, year } = req.query;

        const data = await generatePTStatement(companyId, Number(month), Number(year));
        res.json({ message: "PT Report generated", data });
    } catch (error: any) {
        console.error("[Statutory Report] PT Report error:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getPTMonthlyReport = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { month, year, employeeGroupId } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: "Month and Year are required" });
        }

        const data = await getPTMonthlyStatutoryReport(companyId, Number(month), Number(year), employeeGroupId as string);
        res.json({ message: "PT Monthly Report generated", data });
    } catch (error: any) {
        console.error("[Statutory Report] PT Monthly Report error:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getPTAnnualReport = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { year } = req.query;

        if (!year) {
            return res.status(400).json({ message: "Year is required" });
        }

        const data = await getPTAnnualStatutoryReport(companyId, Number(year));
        res.json({ message: "PT Annual Report generated", data });
    } catch (error: any) {
        console.error("[Statutory Report] PT Annual Report error:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getPTEmployeeWiseReport = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { year } = req.query;

        if (!year) {
            return res.status(400).json({ message: "Year is required" });
        }

        const data = await getPTEmployeeWiseStatutoryReport(companyId, Number(year));
        res.json({ message: "Employee-wise PT Report generated", data });
    } catch (error: any) {
        console.error("[Statutory Report] Employee-wise PT error:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getPFAdminChargesSummary = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { fromMonth, fromYear, toMonth, toYear } = req.query;

        if (!fromMonth || !fromYear || !toMonth || !toYear) {
            return res.status(400).json({ message: "fromMonth, fromYear, toMonth, and toYear are required" });
        }

        const fm = Number(fromMonth);
        const fy = Number(fromYear);
        const tm = Number(toMonth);
        const ty = Number(toYear);

        if ([fm, fy, tm, ty].some(n => Number.isNaN(n))) {
            return res.status(400).json({ message: "Invalid date range parameters" });
        }

        if (fm < 1 || fm > 12 || tm < 1 || tm > 12) {
            return res.status(400).json({ message: "Month must be between 1 and 12" });
        }

        const data = await generatePFAdminChargesSummary(companyId, fm, fy, tm, ty);
        res.json(data);
    } catch (error: any) {
        console.error("[Statutory Report] PF Admin Charges error:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const postPFAdminChargesLedger = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const userId = (req as any).user.id;
        const {
            month,
            year,
            narration,
            voucherTypeId,
            adminExpenseLedgerId,
            edliExpenseLedgerId,
            adminPayableLedgerId,
            edliPayableLedgerId,
            voucherDate
        } = req.body;

        if (
            !month ||
            !year ||
            !voucherTypeId ||
            !adminExpenseLedgerId ||
            !edliExpenseLedgerId ||
            !adminPayableLedgerId ||
            !edliPayableLedgerId
        ) {
            return res.status(400).json({
                message:
                    "month, year, voucherTypeId, adminExpenseLedgerId, edliExpenseLedgerId, adminPayableLedgerId, and edliPayableLedgerId are required"
            });
        }

        const result = await postPFAdminChargesVoucher(companyId, userId, {
            month: Number(month),
            year: Number(year),
            narration,
            voucherTypeId,
            adminExpenseLedgerId,
            edliExpenseLedgerId,
            adminPayableLedgerId,
            edliPayableLedgerId,
            voucherDate
        });

        res.json(result);
    } catch (error: any) {
        console.error("[Statutory Report] PF Admin Charges posting error:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getConfig = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const config = await getStatutoryConfig(companyId);
        res.json({ message: "Statutory configuration retrieved", data: config });
    } catch (error: any) {
        console.error("[Statutory Config] Get error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateConfig = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const userId = (req as any).user.id;

        // Auto-create pay heads might take time, but we await it in service
        const config = await updateStatutoryConfig(companyId, userId, req.body);

        res.json({ message: "Statutory configuration updated", data: config });
    } catch (error: any) {
        if (error.message.includes("Registration Number is required")) {
            return res.status(400).json({ message: error.message });
        }
        console.error("[Statutory Config] Update error:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const activatePayrollConfig = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        console.log(`[Statutory Config] Activating payroll for companyId: ${companyId}`);

        const config = await activatePayroll(companyId);
        console.log(`[Statutory Config] Payroll successfully activated for companyId: ${companyId}`);

        res.json({ message: "Payroll activated successfully", data: config });
    } catch (error: any) {
        console.error("[Statutory Config] Activate payroll error:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getPFSummaryReport = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { month, year, employeeGroupId } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: "Month and Year are required" });
        }

        const data = await generatePFSummaryReport(companyId, Number(month), Number(year), employeeGroupId as string);
        res.json({ message: "PF Summary Report generated", data });
    } catch (error: any) {
        console.error("[Statutory Report] PF Summary error:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getPFEmployeeWiseReport = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: "Month and Year are required" });
        }

        const data = await generatePFEmployeeWiseReport(companyId, Number(month), Number(year));
        res.json({ message: "Employee-wise PF Report generated", data });
    } catch (error: any) {
        console.error("[Statutory Report] Employee-wise PF error:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getPFForm5 = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: "Month and Year are required" });
        }

        const data = await generatePFForm5(companyId, Number(month), Number(year));
        res.json({ message: "PF Form 5 generated", data });
    } catch (error: any) {
        console.error("[Statutory Report] PF Form 5 error:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getPFForm10 = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: "Month and Year are required" });
        }

        const data = await generatePFForm10(companyId, Number(month), Number(year));
        res.json({ message: "PF Form 10 generated", data });
    } catch (error: any) {
        console.error("[Statutory Report] PF Form 10 error:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getPFSummaryExcelReport = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { month, year, employeeGroupId } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: "Month and Year are required" });
        }

        const workbook = await generatePFSummaryExcel(companyId, Number(month), Number(year), employeeGroupId as string);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=PF_Summary_${month}_${year}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error: any) {
        console.error("[Statutory Report] PF Summary Excel error:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getPTMonthlyExcelReport = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { month, year, employeeGroupId } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: "Month and Year are required" });
        }

        const workbook = await generatePTMonthlyExcel(companyId, Number(month), Number(year), employeeGroupId as string);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=PT_Monthly_${month}_${year}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error: any) {
        console.error("[Statutory Report] PT Monthly Excel error:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

