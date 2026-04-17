import prisma from "../../../config/prisma";
import { PF_CONSTANTS } from "./pf.service";
import { EntryType } from "@prisma/client";
import { createVoucherService } from "../../accounting/voucher.service";

export const generatePFECR = async (companyId: string, month: number, year: number) => {
    // 1. Fetch all approved salary vouchers for the period
    const vouchers = await prisma.salaryVoucher.findMany({
        where: {
            companyId,
            month,
            year,
            status: "APPROVED",
            employee: { pfApplicable: true }
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
        throw new Error("No approved vouchers found for the selected period");
    }

    // 2. Fetch all attendance records for NCP calculation (LOP/Absent)
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    const attendanceRecords = await prisma.attendanceRecord.findMany({
        where: {
            companyId,
            date: { gte: startDate, lt: endDate },
            attendanceType: { in: ["ABSENT", "LEAVE_WITHOUT_PAY"] }
        }
    });

    let ecrContent = "";

    for (const voucher of vouchers) {
        const emp = voucher.employee;

        // Find PF relevant items
        const eeShare = voucher.items.find(i => i.payHead.statutoryType === PF_CONSTANTS.STATUTORY_TYPES.EMPLOYEE)?.amount || 0;
        const erEpf = voucher.items.find(i => i.payHead.statutoryType === PF_CONSTANTS.STATUTORY_TYPES.EMPLOYER_EPF)?.amount || 0;
        const erEps = voucher.items.find(i => i.payHead.statutoryType === PF_CONSTANTS.STATUTORY_TYPES.EMPLOYER_EPS)?.amount || 0;

        // Wages (computedOnAmount) — with fallback for legacy data
        const eeItem = voucher.items.find(i => i.payHead.statutoryType === PF_CONSTANTS.STATUTORY_TYPES.EMPLOYEE);
        const epfWages = eeItem?.computedOnAmount?.toNumber() || (eeItem ? Math.round(eeItem.amount.toNumber() / PF_CONSTANTS.RATES.EMPLOYEE_PF) : 0);
        const epsItem = voucher.items.find(i => i.payHead.statutoryType === PF_CONSTANTS.STATUTORY_TYPES.EMPLOYER_EPS);
        const epsWages = epsItem?.computedOnAmount?.toNumber() || epfWages;
        const edliWages = epsWages; // Usually same as EPS wages

        const grossWages = voucher.grossEarnings;

        // NCP Days (Non-Contributory Period) derived from attendance
        const ncpDays = attendanceRecords.filter(r => r.employeeId === emp.id).length;
        const refund = 0;

        // UAN|Member Name|Gross|EPF Wages|EPS Wages|EDLI Wages|EE Share|EPS Share|ER EPF Diff|NCP Days|Refund
        const line = `${emp.uan || ""}|${emp.name}|${grossWages}|${epfWages}|${epsWages}|${edliWages}|${eeShare}|${erEps}|${erEpf}|${ncpDays}|${refund}\r\n`;
        ecrContent += line;
    }

    return ecrContent;
};

export const generatePTStatement = async (companyId: string, month: number, year: number) => {
    const vouchers = await prisma.salaryVoucher.findMany({
        where: {
            companyId,
            month,
            year,
            status: "APPROVED",
            employee: { ptApplicable: true }
        },
        include: {
            employee: true,
            items: {
                include: { payHead: true }
            }
        }
    });

    // Simple summary for PT
    const reportData = vouchers.map(v => {
        const ptItem = v.items.find(i => i.payHead.statutoryType === "PT");
        return {
            employee: v.employee.name,
            gross: v.grossEarnings,
            ptAmount: ptItem?.amount || 0,
        };
    }).filter(r => Number(r.ptAmount) > 0);

    return reportData;
};


export const generatePFForm3A = async (companyId: string, financialYear: string, employeeId?: string) => {
    // 1. Parse Financial Year (e.g., "2024-25")
    const parts = financialYear.split("-");
    const startYear = parseInt(parts[0]);
    if (isNaN(startYear)) throw new Error("Invalid financial year format. Expected YYYY-YY or YYYY-YYYY");
    const endYear = startYear + 1;

    // Period: April (startYear) to March (endYear)
    const vouchers = await prisma.salaryVoucher.findMany({
        where: {
            companyId,
            employeeId: employeeId || undefined,
            status: "APPROVED",
            employee: { pfApplicable: true },
            OR: [
                { year: startYear, month: { gte: 4 } },
                { year: endYear, month: { lte: 3 } }
            ]
        },
        include: {
            employee: true,
            items: {
                include: { payHead: true }
            }
        },
        orderBy: [
            { employeeId: 'asc' },
            { year: 'asc' },
            { month: 'asc' }
        ]
    });

    const groupedByEmp = vouchers.reduce((acc: any, v) => {
        if (!acc[v.employeeId]) {
            acc[v.employeeId] = {
                employee: {
                    id: v.employee.id,
                    name: v.employee.name,
                    employeeNumber: v.employee.employeeNumber,
                    uan: v.employee.uan
                },
                months: [],
                totals: {
                    pfWages: 0,
                    employeeShare: 0,
                    employerEPF: 0,
                    employerEPS: 0
                }
            };
        }

        const eeShare = v.items.find(i => i.payHead.statutoryType === PF_CONSTANTS.STATUTORY_TYPES.EMPLOYEE)?.amount.toNumber() || 0;
        const erEpf = v.items.find(i => i.payHead.statutoryType === PF_CONSTANTS.STATUTORY_TYPES.EMPLOYER_EPF)?.amount.toNumber() || 0;
        const erEps = v.items.find(i => i.payHead.statutoryType === PF_CONSTANTS.STATUTORY_TYPES.EMPLOYER_EPS)?.amount.toNumber() || 0;
        const eeItem3A = v.items.find(i => i.payHead.statutoryType === PF_CONSTANTS.STATUTORY_TYPES.EMPLOYEE);
        const pfWages = eeItem3A?.computedOnAmount?.toNumber() || (eeItem3A ? Math.round(eeItem3A.amount.toNumber() / PF_CONSTANTS.RATES.EMPLOYEE_PF) : 0);

        acc[v.employeeId].months.push({
            month: v.month,
            year: v.year,
            pfWages,
            employeeShare: eeShare,
            employerEPF: erEpf,
            employerEPS: erEps
        });

        acc[v.employeeId].totals.pfWages += pfWages;
        acc[v.employeeId].totals.employeeShare += eeShare;
        acc[v.employeeId].totals.employerEPF += erEpf;
        acc[v.employeeId].totals.employerEPS += erEps;

        return acc;
    }, {});

    return Object.values(groupedByEmp);
};

export const generatePFAdminChargesSummary = async (
    companyId: string,
    fromMonth: number,
    fromYear: number,
    toMonth: number,
    toYear: number
) => {
    const startKey = fromYear * 100 + fromMonth;
    const endKey = toYear * 100 + toMonth;
    if (startKey > endKey) {
        throw new Error("Invalid date range");
    }

    const vouchers = await prisma.salaryVoucher.findMany({
        where: {
            companyId,
            status: "APPROVED",
            employee: { pfApplicable: true },
            OR: [
                { year: { gt: fromYear, lt: toYear } },
                { year: fromYear, month: { gte: fromMonth } },
                { year: toYear, month: { lte: toMonth } }
            ]
        },
        include: {
            items: {
                include: { payHead: true }
            }
        },
        orderBy: [
            { year: "asc" },
            { month: "asc" }
        ]
    });

    const monthMap = new Map<string, { month: number; year: number; totalPFWages: number }>();

    for (const voucher of vouchers) {
        const key = `${voucher.year}-${voucher.month}`;
        if (!monthMap.has(key)) {
            monthMap.set(key, { month: voucher.month, year: voucher.year, totalPFWages: 0 });
        }
        const pfItem = voucher.items.find(i => i.payHead.statutoryType === PF_CONSTANTS.STATUTORY_TYPES.EMPLOYEE);
        const base = pfItem?.computedOnAmount;
        const pfWages = typeof base === "number" ? base : base?.toNumber ? base.toNumber() : 0;
        const entry = monthMap.get(key)!;
        entry.totalPFWages += pfWages;
    }

    const summary = Array.from(monthMap.values())
        .sort((a, b) => (a.year - b.year) || (a.month - b.month))
        .map(item => {
            const adminCharges = Math.round(item.totalPFWages * PF_CONSTANTS.RATES.EMPLOYER_PF_ADMIN);
            const edliCharges = Math.round(item.totalPFWages * PF_CONSTANTS.RATES.EMPLOYER_EDLI);
            return {
                month: item.month,
                year: item.year,
                totalPFWages: item.totalPFWages,
                adminCharges,
                edliCharges,
                totalEmployerLiability: adminCharges + edliCharges
            };
        });

    return {
        companyId,
        summary
    };
};

export const postPFAdminChargesVoucher = async (
    companyId: string,
    userId: string,
    params: {
        month: number;
        year: number;
        narration?: string;
        voucherTypeId: string;
        adminExpenseLedgerId: string;
        edliExpenseLedgerId: string;
        adminPayableLedgerId: string;
        edliPayableLedgerId: string;
        voucherDate?: string;
    }
) => {
    const { month, year } = params;
    if (!month || !year) {
        throw new Error("Month and Year are required");
    }
    if (month < 1 || month > 12) {
        throw new Error("Month must be between 1 and 12");
    }

    const summaryResult = await generatePFAdminChargesSummary(companyId, month, year, month, year);
    const summaryItem = summaryResult.summary.find(s => s.month === month && s.year === year);

    if (!summaryItem || summaryItem.totalPFWages === 0) {
        throw new Error("No approved salary vouchers with PF wages found for the selected period");
    }

    const adminCharges = summaryItem.adminCharges;
    const edliCharges = summaryItem.edliCharges;

    if (adminCharges <= 0 && edliCharges <= 0) {
        throw new Error("No PF Admin or EDLI charges to post for the selected period");
    }

    const refKey = `PF_ADMIN_EDLI_${year}_${month}`;

    const existing = await prisma.voucher.findFirst({
        where: {
            companyId,
            referenceNumber: refKey
        }
    });

    if (existing) {
        throw new Error("PF Admin & EDLI charges have already been posted for this month and year");
    }

    const voucherDate = params.voucherDate
        ? new Date(params.voucherDate)
        : new Date(year, month, 0);

    const narration =
        params.narration ||
        `PF Admin & EDLI charges for ${month.toString().padStart(2, "0")}/${year}`;

    const entries = [];

    if (adminCharges > 0) {
        entries.push(
            {
                ledgerId: params.adminExpenseLedgerId,
                entryType: EntryType.DEBIT,
                amount: adminCharges,
                description: `PF Admin Charges for ${month}/${year}`
            },
            {
                ledgerId: params.adminPayableLedgerId,
                entryType: EntryType.CREDIT,
                amount: adminCharges,
                description: `PF Admin Charges payable for ${month}/${year}`
            }
        );
    }

    if (edliCharges > 0) {
        entries.push(
            {
                ledgerId: params.edliExpenseLedgerId,
                entryType: EntryType.DEBIT,
                amount: edliCharges,
                description: `EDLI Charges for ${month}/${year}`
            },
            {
                ledgerId: params.edliPayableLedgerId,
                entryType: EntryType.CREDIT,
                amount: edliCharges,
                description: `EDLI Charges payable for ${month}/${year}`
            }
        );
    }

    const voucher = await createVoucherService(companyId, userId, {
        voucherTypeId: params.voucherTypeId,
        voucherDate,
        referenceNumber: refKey,
        narration,
        entries
    });

    return {
        success: true,
        voucherId: voucher.id,
        month,
        year,
        adminCharges,
        edliCharges
    };
};

/**
 * PF Summary Report (Employee-wise detailed as per requirement)
 */
export const getPFSummaryReport = async (companyId: string, month: number, year: number, employeeGroupId?: string) => {
    console.log(`[PF Summary Report] Fetching data for Company: ${companyId}, Period: ${month}/${year}, Group: ${employeeGroupId || 'All'}`);

    const vouchers = await prisma.salaryVoucher.findMany({
        where: {
            companyId,
            month,
            year,
            status: "APPROVED",
            employee: {
                pfApplicable: true,
                ...(employeeGroupId && employeeGroupId !== 'all' ? { employeeGroupId } : {})
            }
        },
        include: {
            employee: true,
            items: {
                include: { payHead: true }
            }
        }
    });

    console.log(`[PF Summary Report] Found ${vouchers.length} approved vouchers`);

    const reportData = vouchers.map(voucher => {
        const emp = voucher.employee;

        // Find PF relevant items - Resiliently check statutoryType OR name
        const eePFItem = voucher.items.find(i => i.payHead.statutoryType === PF_CONSTANTS.STATUTORY_TYPES.EMPLOYEE) ||
            voucher.items.find(i =>
                (i.payHeadName.toUpperCase().includes("PF") || i.payHeadName.toUpperCase().includes("PROVIDENT")) &&
                i.payHeadType === "DEDUCTIONS_FROM_EMPLOYEES"
            );

        const erEPFItem = voucher.items.find(i => i.payHead.statutoryType === PF_CONSTANTS.STATUTORY_TYPES.EMPLOYER_EPF) ||
            voucher.items.find(i =>
            (
                (i.payHeadName.toUpperCase().includes("EPF") || i.payHeadName.toUpperCase().includes("EMPLOYER") || i.payHeadName.toUpperCase().includes("CONTRIBUTION")) &&
                i.payHeadType === "EMPLOYERS_STATUTORY_CONTRIBUTIONS" &&
                !i.payHeadName.toUpperCase().includes("EPS") && !i.payHeadName.toUpperCase().includes("PENSION")
            )
            );

        const erEPSItem = voucher.items.find(i => i.payHead.statutoryType === PF_CONSTANTS.STATUTORY_TYPES.EMPLOYER_EPS) ||
            voucher.items.find(i =>
            (
                (i.payHeadName.toUpperCase().includes("EPS") || i.payHeadName.toUpperCase().includes("PENSION")) &&
                i.payHeadType === "EMPLOYERS_STATUTORY_CONTRIBUTIONS"
            )
            );

        const pfAdminItem = voucher.items.find(i => i.payHead.statutoryType === PF_CONSTANTS.STATUTORY_TYPES.PF_ADMIN);
        const edliItem = voucher.items.find(i => i.payHead.statutoryType === PF_CONSTANTS.STATUTORY_TYPES.EDLI);
        const edliAdminItem = voucher.items.find(i => i.payHead.statutoryType === PF_CONSTANTS.STATUTORY_TYPES.EDLI_ADMIN);

        if (!eePFItem && !erEPFItem && !erEPSItem) {
            console.log(`[PF Summary Report] No PF items found for employee ${emp.name}`);
            return null;
        }

        const eePf = eePFItem?.amount.toNumber() || 0;
        const erEpf = erEPFItem?.amount.toNumber() || 0;
        const erEps = erEPSItem?.amount.toNumber() || 0;
        const pfAdminCharges = pfAdminItem?.amount.toNumber() || 0;
        const edliCharges = edliItem?.amount.toNumber() || 0;
        const edliAdminCharges = edliAdminItem?.amount.toNumber() || 0;

        // PF Wages: prefer computedOnAmount, fallback to reverse-calc from EE PF amount
        const pfWages = eePFItem?.computedOnAmount?.toNumber() ||
            erEPFItem?.computedOnAmount?.toNumber() ||
            erEPSItem?.computedOnAmount?.toNumber() ||
            (eePFItem ? Math.round(eePFItem.amount.toNumber() / PF_CONSTANTS.RATES.EMPLOYEE_PF) : 0);

        return {
            employeeId: emp.id,
            employeeName: emp.name,
            uan: emp.uan || "N/A",
            pfWages,
            eePf,
            erEpf,
            erEps,
            pfAdminCharges,
            edliCharges,
            edliAdminCharges,
            totalContribution: eePf + erEpf + erEps
        };
    }).filter(r => r !== null);

    console.log(`[PF Summary Report] Returning ${reportData.length} rows`);
    return reportData;
};

export const getPFEmployeeWiseReport = async (companyId: string, month: number, year: number) => {
    const vouchers = await prisma.salaryVoucher.findMany({
        // Note: PF/PT reports always read only APPROVED salary vouchers
        where: {
            companyId,
            month,
            year,
            status: "APPROVED",
            employee: { pfApplicable: true }
        },
        include: {
            employee: true,
            items: {
                include: { payHead: true }
            }
        }
    });

    // Fetch attendance for NCP days
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    const attendanceRecords = await prisma.attendanceRecord.findMany({
        where: {
            companyId,
            date: { gte: startDate, lt: endDate },
            attendanceType: { in: ["ABSENT", "LEAVE_WITHOUT_PAY"] }
        }
    });

    const reportData = vouchers.map(voucher => {
        const emp = voucher.employee;
        const eePF = voucher.items.find(i => i.payHead.statutoryType === PF_CONSTANTS.STATUTORY_TYPES.EMPLOYEE);
        const erEPF = voucher.items.find(i => i.payHead.statutoryType === PF_CONSTANTS.STATUTORY_TYPES.EMPLOYER_EPF);
        const erEPS = voucher.items.find(i => i.payHead.statutoryType === PF_CONSTANTS.STATUTORY_TYPES.EMPLOYER_EPS);

        if (!eePF && !erEPF && !erEPS) return null;

        const ncpDays = attendanceRecords.filter(r => r.employeeId === emp.id).length;

        return {
            employeeName: emp.name,
            uan: emp.uan,
            pfAccountNumber: emp.pfAccountNumber,
            pfWageBase: eePF?.computedOnAmount?.toNumber() || (eePF ? Math.round(eePF.amount.toNumber() / PF_CONSTANTS.RATES.EMPLOYEE_PF) : 0),
            employeePFAmount: eePF?.amount.toNumber() || 0,
            employerEPFAmount: erEPF?.amount.toNumber() || 0,
            employerEPSAmount: erEPS?.amount.toNumber() || 0,
            ncpDays
        };
    }).filter(r => r !== null);

    return reportData;
};

export const getPFForm5 = async (companyId: string, month: number, year: number) => {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const newJoinees = await prisma.payrollEmployee.findMany({
        where: {
            companyId,
            pfApplicable: true,
            dateOfJoining: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        },
        include: {
            salaryStructures: {
                where: { isActive: true },
                include: {
                    items: {
                        include: { payHead: true }
                    }
                },
                orderBy: { effectiveFrom: "desc" },
                take: 1
            }
        }
    });

    return newJoinees.map(emp => {
        const latestStructure = emp.salaryStructures[0];
        let basicDA = 0;

        if (latestStructure) {
            const basicHead = latestStructure.items.find((i: any) =>
                i.payHead.name.toLowerCase().includes("basic") ||
                i.payHead.name.toLowerCase().includes("da") ||
                i.payHead.name.toLowerCase().includes("dearness")
            );
            basicDA = basicHead?.amount?.toNumber() || 0;
        }

        return {
            employeeName: emp.name,
            uan: emp.uan,
            pfAccountNumber: emp.pfAccountNumber,
            pfJoinDate: emp.dateOfJoining,
            basicDA
        };
    });
};

export const getPFForm10 = async (companyId: string, month: number, year: number) => {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const exitedEmployees = await prisma.payrollEmployee.findMany({
        where: {
            companyId,
            pfApplicable: true,
            dateOfLeaving: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        }
    });

    return exitedEmployees.map(emp => ({
        employeeName: emp.name,
        uan: emp.uan,
        pfAccountNumber: emp.pfAccountNumber,
        dateOfExit: emp.dateOfLeaving,
        exitReason: null // Placeholder as per requirement
    }));
};

/**
 * Monthly PT Report
 */
export const getPTMonthlyStatutoryReport = async (companyId: string, month: number, year: number, employeeGroupId?: string) => {
    // 1. Fetch vouchers and config for fallback state
    const [vouchers, statutoryConfig] = await Promise.all([
        prisma.salaryVoucher.findMany({
            where: {
                companyId,
                month,
                year,
                status: "APPROVED",
                employee: {
                    ptApplicable: true,
                    ...(employeeGroupId && employeeGroupId !== 'all' ? { employeeGroupId } : {})
                }
            },
            include: {
                employee: true,
                items: {
                    include: { payHead: true }
                }
            }
        }),
        prisma.statutoryConfig.findUnique({
            where: { companyId }
        })
    ]);

    if (vouchers.length === 0) return [];

    // 2. Fetch all PT slabs for relevant states to resolve slab names
    const statesInvolved = Array.from(new Set(vouchers.map(v => v.employee.state || statutoryConfig?.ptState).filter(Boolean)));
    const allSlabs = await prisma.pTSlab.findMany({
        where: { state: { in: statesInvolved as string[] } }
    });

    const reportData = vouchers.map(v => {
        const ptItem = v.items.find(i =>
            i.payHead.statutoryType === "PT" ||
            i.payHead.statutoryType === "PROFESSIONAL_TAX"
        );

        // Include employee if they have a PT item OR if they are PT-applicable
        const isPTApplicable = v.employee.ptApplicable;
        if (!ptItem && !isPTApplicable) return null;

        const resolvedState = v.employee.state || statutoryConfig?.ptState || "N/A";
        const gross = ptItem?.computedOnAmount?.toNumber() || v.grossEarnings.toNumber();

        // Resolve Slab Range
        const isFeb = month === 2;
        // First try to find February-specific slab if it's Feb
        let matchedSlab = isFeb
            ? allSlabs.find(s =>
                s.state === resolvedState &&
                gross >= Number(s.salaryFrom) &&
                (Number(s.salaryTo) === 0 ? true : gross <= Number(s.salaryTo)) &&
                s.isFebruaryOverride
            )
            : null;

        // If not Feb, or no Feb override found, use standard slab
        if (!matchedSlab) {
            matchedSlab = allSlabs.find(s =>
                s.state === resolvedState &&
                gross >= Number(s.salaryFrom) &&
                (Number(s.salaryTo) === 0 ? true : gross <= Number(s.salaryTo)) &&
                !s.isFebruaryOverride
            );
        }

        let ptSlab = "As per Rules";
        if (matchedSlab) {
            const from = Number(matchedSlab.salaryFrom).toLocaleString('en-IN');
            const to = Number(matchedSlab.salaryTo) === 0 ? "Above" : Number(matchedSlab.salaryTo).toLocaleString('en-IN');
            ptSlab = Number(matchedSlab.salaryTo) === 0 ? `${from} & Above` : `${from} - ${to}`;
        }

        // Use stored PT amount, or derive from slab if no voucher item exists or it is 0
        let ptAmount = (ptItem && ptItem.amount.toNumber() > 0)
            ? ptItem.amount.toNumber()
            : (matchedSlab ? Number(matchedSlab.monthlyAmount) : 0);

        // 📍 Maharashtra Gender-Based Override
        // Female Employees: Up to ₹25,000 -> ₹0; Above ₹25,000 -> Slabs (200/300)
        if (resolvedState === "Maharashtra" && v.employee.gender === "FEMALE") {
            if (gross <= 25000) {
                ptAmount = 0;
            }
        }

        return {
            employeeId: v.employee.id,
            employeeName: v.employee.name,
            state: resolvedState,
            grossSalary: gross,
            ptSlab,
            ptAmount
        };
    }).filter(e => e !== null && e.ptAmount >= 0);

    return reportData;
};

/**
 * Annual PT Report
 */
export const getPTAnnualStatutoryReport = async (companyId: string, year: number) => {
    // We assume fiscal year or calendar year based on input. User requested just GET /.../annual?year=
    // Usually means Jan-Dec or Apr-Mar. I'll implement for the calendar year for now as per "across all 12 months".

    const vouchers = await prisma.salaryVoucher.findMany({
        // Note: PF/PT reports always read only APPROVED salary vouchers
        where: {
            companyId,
            year,
            status: "APPROVED",
            employee: { ptApplicable: true }
        },
        include: {
            employee: true,
            items: {
                where: {
                    OR: [
                        { payHead: { statutoryType: "PT" } },
                        { payHead: { statutoryType: "PROFESSIONAL_TAX" } }
                    ]
                },
                include: { payHead: true }
            }
        }
    });

    const monthlyBreakdown: Record<number, Record<string, number>> = {};
    let grandAnnualTotal = 0;

    vouchers.forEach(v => {
        const ptAmount = v.items.reduce((sum, item) => sum + item.amount.toNumber(), 0);
        if (ptAmount === 0) return;

        grandAnnualTotal += ptAmount;
        const state = v.employee.state || "Unknown";

        if (!monthlyBreakdown[v.month]) {
            monthlyBreakdown[v.month] = {};
        }
        monthlyBreakdown[v.month][state] = (monthlyBreakdown[v.month][state] || 0) + ptAmount;
    });

    const report = Object.entries(monthlyBreakdown).flatMap(([monthStr, states]) => {
        return Object.entries(states).map(([state, total]) => ({
            month: parseInt(monthStr),
            state,
            totalPTDeducted: total
        }));
    }).sort((a, b) => a.month - b.month);

    return {
        year,
        grandAnnualTotal,
        report
    };
};

/**
 * Employee-wise PT Report
 */
export const getPTEmployeeWiseStatutoryReport = async (companyId: string, year: number) => {
    const vouchers = await prisma.salaryVoucher.findMany({
        // Note: PF/PT reports always read only APPROVED salary vouchers
        where: {
            companyId,
            year,
            status: "APPROVED",
            employee: { ptApplicable: true }
        },
        include: {
            employee: true,
            items: {
                where: {
                    OR: [
                        { payHead: { statutoryType: "PT" } },
                        { payHead: { statutoryType: "PROFESSIONAL_TAX" } }
                    ]
                },
                include: { payHead: true }
            }
        }
    });

    const empData: Record<string, any> = {};

    vouchers.forEach(v => {
        const ptAmount = v.items.reduce((sum, item) => sum + item.amount.toNumber(), 0);
        if (ptAmount === 0) return;

        if (!empData[v.employeeId]) {
            empData[v.employeeId] = {
                employeeName: v.employee.name,
                employeeNumber: v.employee.employeeNumber,
                state: v.employee.state || "Unknown",
                monthlyAmounts: {},
                annualTotal: 0
            };
        }

        empData[v.employeeId].monthlyAmounts[v.month] = (empData[v.employeeId].monthlyAmounts[v.month] || 0) + ptAmount;
        empData[v.employeeId].annualTotal += ptAmount;
    });

    return Object.values(empData);
};

