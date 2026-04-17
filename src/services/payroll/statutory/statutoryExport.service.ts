import prisma from "../../../config/prisma";
import { EntryType } from "@prisma/client";

/**
 * Statutory Export Service
 * Provides structured JSON data for PF and PT exports
 */

// Local constants mirrored from pf.service if missing
const STATUTORY_TYPES = {
    EMPLOYEE_PF: "EMPLOYEE_PF",
    EMPLOYER_EPF: "EMPLOYER_EPF",
    EMPLOYER_EPS: "EMPLOYER_EPS",
    PT: "PT",
    PROFESSIONAL_TAX: "PROFESSIONAL_TAX"
};

const STATUTORY_RATES = {
    ADMIN_CHARGES_RATE: 0.005, // 0.5%
    EDLI_RATE: 0.005, // 0.5%
};

/**
 * Export PF Data
 */
export const exportPFData = async (companyId: string, month: number, year: number) => {
    // 1. Fetch Salary Vouchers (derived from existing report logic)
    // Note: mirror the prisma call from statutoryReport.service.ts
    // although we use prisma as any to handle potential missing types in local dev
    const vouchers = await (prisma as any).salaryVoucher.findMany({
        where: {
            companyId,
            month,
            year,
            status: "APPROVED",
        },
        include: {
            employee: true,
            items: {
                include: {
                    payHead: true,
                },
            },
        },
    });

    if (vouchers.length === 0) {
        return {
            period: { month, year },
            summary: {
                totalEmployees: 0,
                totalGross: 0,
                totalPFWages: 0,
                totalEmployeePF: 0,
                totalEmployerEPF: 0,
                totalEmployerEPS: 0,
                totalAdminCharges: 0,
                totalEDLI: 0
            },
            data: []
        };
    }

    let totalGross = 0;
    let totalPFWages = 0;
    let totalEmployeePF = 0;
    let totalEmployerEPF = 0;
    let totalEmployerEPS = 0;

    const exportData = vouchers.map((v: any) => {
        const emp = v.employee;

        // Find PF components
        const pfItem = v.items.find((i: any) =>
            i.payHead.statutoryType === STATUTORY_TYPES.EMPLOYEE_PF ||
            i.payHead.statutoryType === "EMPLOYEE_PF" ||
            i.payHead.statutoryType === "PF"
        );

        const erEpfItem = v.items.find((i: any) => i.payHead.statutoryType === STATUTORY_TYPES.EMPLOYER_EPF);
        const erEpsItem = v.items.find((i: any) => i.payHead.statutoryType === STATUTORY_TYPES.EMPLOYER_EPS);

        const gross = Number(v.grossEarnings || 0);
        const pfWages = Number(pfItem?.computedOnAmount || 0);
        const eePF = Number(pfItem?.amount || 0);
        const erEPF = Number(erEpfItem?.amount || 0);
        const erEPS = Number(erEpsItem?.amount || 0);

        // Admin & EDLI are usually calculated on PF Wages
        const adminCharges = Math.round(pfWages * STATUTORY_RATES.ADMIN_CHARGES_RATE);
        const edli = Math.round(pfWages * STATUTORY_RATES.EDLI_RATE);

        totalGross += gross;
        totalPFWages += pfWages;
        totalEmployeePF += eePF;
        totalEmployerEPF += erEPF;
        totalEmployerEPS += erEPS;

        return {
            employeeId: emp.id,
            employeeName: emp.name,
            employeeNumber: emp.employeeNumber,
            uan: emp.uan || "",
            grossWages: gross,
            pfWages: pfWages,
            employeePF: eePF,
            employerEPS: erEPS,
            employerEPF: erEPF,
            adminCharges: adminCharges,
            edli: edli,
            netPF: eePF + erEPS + erEPF
        };
    });

    const totalAdminCharges = Math.round(totalPFWages * STATUTORY_RATES.ADMIN_CHARGES_RATE);
    const totalEDLI = Math.round(totalPFWages * STATUTORY_RATES.EDLI_RATE);

    return {
        companyId,
        period: { month, year },
        summary: {
            totalEmployees: vouchers.length,
            totalGross,
            totalPFWages,
            totalEmployeePF,
            totalEmployerEPF,
            totalEmployerEPS,
            totalAdminCharges,
            totalEDLI,
            totalContribution: totalEmployeePF + totalEmployerEPF + totalEmployerEPS + totalAdminCharges + totalEDLI
        },
        data: exportData
    };
};

/**
 * Export PT Data
 */
export const exportPTData = async (companyId: string, month: number, year: number) => {
    const vouchers = await (prisma as any).salaryVoucher.findMany({
        where: {
            companyId,
            month,
            year,
            status: "APPROVED",
        },
        include: {
            employee: true,
            items: {
                include: {
                    payHead: true,
                },
            },
        },
    });

    if (vouchers.length === 0) {
        return {
            period: { month, year },
            summary: {
                totalEmployees: 0,
                totalGross: 0,
                totalPT: 0
            },
            stateWiseTotals: {},
            data: []
        };
    }

    const stateWiseTotals: Record<string, { count: number, total: number }> = {};
    let totalGross = 0;
    let totalPT = 0;

    const exportData = vouchers.map((v: any) => {
        const emp = v.employee;
        const ptItem = v.items.find((i: any) =>
            i.payHead.statutoryType === STATUTORY_TYPES.PT ||
            i.payHead.statutoryType === STATUTORY_TYPES.PROFESSIONAL_TAX ||
            i.payHead.statutoryType === "PT"
        );

        const gross = Number(v.grossEarnings || 0);
        const ptAmount = Number(ptItem?.amount || 0);
        const state = emp.state || "Unknown";

        totalGross += gross;
        totalPT += ptAmount;

        if (!stateWiseTotals[state]) {
            stateWiseTotals[state] = { count: 0, total: 0 };
        }
        stateWiseTotals[state].count += 1;
        stateWiseTotals[state].total += ptAmount;

        return {
            employeeId: emp.id,
            employeeName: emp.name,
            employeeNumber: emp.employeeNumber,
            state: state,
            grossSalary: gross,
            ptAmount: ptAmount
        };
    }).filter((r: any) => r.ptAmount > 0);

    return {
        companyId,
        period: { month, year },
        summary: {
            totalEmployees: exportData.length,
            totalGross,
            totalPT
        },
        stateWiseTotals,
        data: exportData
    };
};

/**
 * Combined Statutory Export
 */
export const exportStatutoryData = async (companyId: string, month: number, year: number) => {
    const pf = await exportPFData(companyId, month, year);
    const pt = await exportPTData(companyId, month, year);

    return {
        companyId,
        period: { month, year },
        pfData: pf,
        ptData: pt
    };
};

