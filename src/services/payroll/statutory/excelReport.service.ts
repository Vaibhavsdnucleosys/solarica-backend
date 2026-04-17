import { Workbook, Worksheet, Fill, BorderStyle, Borders } from "exceljs";
import prisma from "../../../config/prisma";
import { getPFSummaryReport, getPTMonthlyStatutoryReport } from "./statutoryReport.service";

/**
 * Professional Excel Report Service
 */

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const STYLES = {
    headerFill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE8F1F8' } // Light Blue/Gray for general header
    } as Fill,
    tableHeaderFill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2A5585' } // Navy Blue for table headers
    } as Fill,
    headerFont: {
        bold: true,
        size: 11,
        color: { argb: 'FFFFFFFF' } // White text
    },
    titleFont: {
        bold: true,
        size: 14
    },
    borderLight: {
        top: { style: 'thin' as BorderStyle, color: { argb: 'FF000000' } },
        left: { style: 'thin' as BorderStyle, color: { argb: 'FF000000' } },
        bottom: { style: 'thin' as BorderStyle, color: { argb: 'FF000000' } },
        right: { style: 'thin' as BorderStyle, color: { argb: 'FF000000' } }
    } as Borders,
    borderThickTop: {
        top: { style: 'medium' as BorderStyle, color: { argb: 'FF000000' } },
        left: { style: 'thin' as BorderStyle, color: { argb: 'FF000000' } },
        bottom: { style: 'medium' as BorderStyle, color: { argb: 'FF000000' } },
        right: { style: 'thin' as BorderStyle, color: { argb: 'FF000000' } }
    } as Borders
};

/**
 * Apply standard report header
 */
async function applyReportHeader(
    sheet: Worksheet,
    title: string,
    companyId: string,
    month: number,
    year: number,
    colCount: number
) {
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { name: true }
    });

    // 1. Title
    sheet.mergeCells(1, 1, 1, colCount);
    const titleCell = sheet.getCell(1, 1);
    titleCell.value = title;
    titleCell.font = STYLES.titleFont;
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // 2. Company Name
    sheet.mergeCells(2, 1, 2, colCount);
    const companyCell = sheet.getCell(2, 1);
    companyCell.value = company?.name || "Company Name";
    companyCell.font = { bold: true };
    companyCell.alignment = { horizontal: 'center' };

    // 3. Period
    sheet.mergeCells(3, 1, 3, colCount);
    const periodCell = sheet.getCell(3, 1);
    periodCell.value = `Payroll Period: ${MONTHS[month - 1]} ${year}`;
    periodCell.alignment = { horizontal: 'center' };

    // Apply header background and borders to all 3 rows
    for (let i = 1; i <= 3; i++) {
        const row = sheet.getRow(i);
        row.eachCell((cell) => {
            cell.fill = STYLES.headerFill;
            if (i === 3) {
                cell.border = { bottom: { style: 'medium' } };
            }
        });
    }

    sheet.getRow(1).height = 30;
    sheet.getRow(2).height = 20;
    sheet.getRow(3).height = 20;

    // Add empty row for spacing
    sheet.addRow([]);
}

/**
 * Generate PF Summary Excel
 */
export const generatePFSummaryExcel = async (companyId: string, month: number, year: number, employeeGroupId?: string) => {
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet("PF Summary Report");

    const data = await getPFSummaryReport(companyId, month, year, employeeGroupId);
    const colCount = 7;

    // await applyReportHeader(sheet, "PF Summary Report", companyId, month, year, colCount);

    if (!data || data.length === 0) {
        const msgRow = sheet.addRow(["No approved payroll data available for the selected period."]);
        sheet.mergeCells(msgRow.number, 1, msgRow.number, colCount);
        const msgCell = sheet.getCell(msgRow.number, 1);
        msgCell.alignment = { horizontal: 'center' };
        msgCell.font = { italic: true, color: { argb: 'FF888888' } };
        return workbook;
    }

    // Headers
    const headerRow = sheet.addRow([
        "Employee Name",
        "UAN",
        "PF Wages",
        "Employee PF",
        "Employer EPF",
        "Employer EPS",
        "Total PF"
    ]);

    headerRow.eachCell((cell) => {
        cell.fill = STYLES.tableHeaderFill;
        cell.font = STYLES.headerFont;
        cell.border = STYLES.borderLight;
        cell.alignment = { horizontal: 'center' };
    });
    headerRow.height = 25;

    // Data Rows
    let totalWages = 0;
    let totalEE = 0;
    let totalEPF = 0;
    let totalEPS = 0;
    let totalPF = 0;

    data.forEach((item) => {
        const row = sheet.addRow([
            item.employeeName,
            item.uan,
            item.pfWages,
            item.eePf,
            item.erEpf,
            item.erEps,
            item.totalContribution
        ]);

        totalWages += item.pfWages;
        totalEE += item.eePf;
        totalEPF += item.erEpf;
        totalEPS += item.erEps;
        totalPF += item.totalContribution;

        row.eachCell((cell, colNumber) => {
            cell.border = STYLES.borderLight;
            if (colNumber >= 3) {
                cell.numFmt = '"₹"#,##0.00';
                cell.alignment = { horizontal: 'right' };
            }
            if (colNumber === 3) {
                cell.font = { bold: true }; // Emphasize PF Wages
            }
        });
    });

    // Totals Row
    const totalsRow = sheet.addRow([
        "TOTAL",
        "",
        totalWages,
        totalEE,
        totalEPF,
        totalEPS,
        totalPF
    ]);

    totalsRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.border = STYLES.borderThickTop;
        if (colNumber >= 3) {
            cell.numFmt = '"₹"#,##0.00';
            cell.alignment = { horizontal: 'right' };
        }
    });

    // Column Widths
    sheet.columns = [
        { width: 30 }, // Name
        { width: 20 }, // UAN
        { width: 15 }, // Wages
        { width: 15 }, // EE
        { width: 15 }, // EPF
        { width: 15 }, // EPS
        { width: 15 }  // Total
    ];

    return workbook;
};

/**
 * Generate PT Monthly Excel
 */
export const generatePTMonthlyExcel = async (companyId: string, month: number, year: number, employeeGroupId?: string) => {
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet("PT Monthly Report");

    const data = await getPTMonthlyStatutoryReport(companyId, month, year, employeeGroupId);
    const colCount = 5;

    // await applyReportHeader(sheet, "Professional Tax Monthly Report", companyId, month, year, colCount);

    if (!data || data.length === 0) {
        const msgRow = sheet.addRow(["No approved payroll data available for the selected period."]);
        sheet.mergeCells(msgRow.number, 1, msgRow.number, colCount);
        const msgCell = sheet.getCell(msgRow.number, 1);
        msgCell.alignment = { horizontal: 'center' };
        msgCell.font = { italic: true, color: { argb: 'FF888888' } };
        return workbook;
    }

    // Headers
    const headerRow = sheet.addRow([
        "Employee Name",
        "State",
        "Gross Salary",
        "PT Slab",
        "PT Amount"
    ]);

    headerRow.eachCell((cell) => {
        cell.fill = STYLES.tableHeaderFill;
        cell.font = STYLES.headerFont;
        cell.border = STYLES.borderLight;
        cell.alignment = { horizontal: 'center' };
    });
    headerRow.height = 25;

    // Data Rows
    let totalGross = 0;
    let totalPT = 0;

    data.forEach((item) => {
        if (!item) return;
        const row = sheet.addRow([
            item.employeeName,
            item.state,
            item.grossSalary,
            item.ptSlab,
            item.ptAmount
        ]);

        totalGross += item.grossSalary;
        totalPT += item.ptAmount;

        row.eachCell((cell, colNumber) => {
            cell.border = STYLES.borderLight;
            if (colNumber === 3 || colNumber === 5) {
                cell.numFmt = '"₹"#,##0.00';
                cell.alignment = { horizontal: 'right' };
            }
        });
    });

    // Totals Row
    const totalsRow = sheet.addRow([
        "TOTAL",
        "",
        totalGross,
        "",
        totalPT
    ]);

    totalsRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.border = STYLES.borderThickTop;
        if (colNumber === 3 || colNumber === 5) {
            cell.numFmt = '"₹"#,##0.00';
            cell.alignment = { horizontal: 'right' };
        }
    });

    // Column Widths
    sheet.columns = [
        { width: 30 }, // Name
        { width: 20 }, // State
        { width: 20 }, // Gross
        { width: 20 }, // Slab
        { width: 15 }  // Amount
    ];

    return workbook;
};

