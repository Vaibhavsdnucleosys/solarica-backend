import prisma from "../../config/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import * as payrollLockService from "./payrollLock.service";
import { getStatutoryConfig } from "./statutory/statutory.service";
import { getPTSlabsByState } from "./statutory/ptSlab.service";
import { calculatePFComponents, PF_CONSTANTS } from "./statutory/pf.service";

/**
 * Process monthly payroll for a company
 */
export const processPayroll = async (
    companyId: string,
    month: number,
    year: number,
    employeeIds?: string[],
    userId: string = "system",
    employeeGroupId?: string
) => {
    // 1. Check Payroll Lock (Prerequisite for Tally)
    // Pass employeeGroupId to check group-specific status
    const { status } = await payrollLockService.getDerivedPayrollStatus(companyId, month, year, employeeGroupId);

    if (status === "OPEN") {
        throw new Error(`Payroll for ${month}/${year} must be LOCKED before it can be processed.`);
    }

    // 2. Fetch Master Data
    const statutoryConfig = await getStatutoryConfig(companyId);

    // 3. Idempotency Check: Get employees already processed for this month
    const existingVouchers = await prisma.salaryVoucher.findMany({
        where: {
            companyId,
            month,
            year,
            status: { not: "CANCELLED" }
        },
        select: { employeeId: true }
    });

    const processedEmployeeIds = new Set(existingVouchers.map(v => v.employeeId));

    console.log('[Payroll] companyId received:', companyId);
    // Fetch Employees with Group status and filter by group if requested
    const employees = await prisma.payrollEmployee.findMany({
        where: {
            companyId,
            isActive: true,
            ...(employeeGroupId && employeeGroupId !== 'all' ? { employeeGroupId } : {}),
            ...(employeeIds && employeeIds.length > 0 ? { id: { in: employeeIds } } : {})
        },
        include: {
            employeeGroup: true // Needed for eligibility check
        }
    });

    // Period Boundary (Needed for structure lookup and processing)
    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0); // Last day of month
    const daysInMonth = periodEnd.getDate();

    // Fetch all applicable Salary Structures (Employee and Group level) for the period
    const applicableStructures = await prisma.salaryStructure.findMany({
        where: {
            companyId,
            isActive: true,
            effectiveFrom: { lte: periodEnd },
            OR: [
                { effectiveTo: null },
                { effectiveTo: { gte: periodStart } }
            ]
        },
        orderBy: { effectiveFrom: 'desc' },
        include: {
            items: {
                where: {
                    payHead: { isActive: true }
                },
                include: { payHead: true }
            }
        }
    });

    console.log('[Payroll] employees found:', employees.length);
    console.log(`[PayrollEngine] Found ${employees.length} active employees for company ${companyId}`);

    // --- ELIGIBILITY FILTER ---
    // Rule: All active employees are eligible. 
    // We will skip those without a valid Salary Structure during the main loop.
    const eligibleEmployees = employees;

    const results = {
        processed: 0,
        skipped: 0,
        errors: [] as any[],
        vouchers: [] as string[]
    };

    const employeesToProcess = eligibleEmployees.filter(e => !processedEmployeeIds.has(e.id));
    const alreadyProcessedCount = eligibleEmployees.length - employeesToProcess.length;
    const ineligibleCount = employees.length - eligibleEmployees.length;

    // --- ENRICHED METADATA ---
    const metadata = {
        totalFound: employees.length,
        totalEligible: eligibleEmployees.length,
        alreadyProcessed: alreadyProcessedCount,
        ineligible: ineligibleCount
    };

    console.log(`[Payroll] Employees found: ${employees.length}, Eligible: ${eligibleEmployees.length}, Already processed: ${alreadyProcessedCount}`);

    if (employees.length === 0) {
        return {
            ...results,
            ...metadata,
            message: "No active employees found for processing for this company.",
            processed: 0,
            skipped: 0
        };
    }

    if (eligibleEmployees.length === 0) {
        return {
            ...results,
            ...metadata,
            message: `No employees eligible for processing. ${ineligibleCount} skipped because their groups do not allow salary definition.`,
            processed: 0,
            skipped: ineligibleCount
        };
    }

    // 4. Process each pending employee
    console.log(`[Payroll] Employees to process in this run: ${employeesToProcess.length}`);

    if (employeesToProcess.length === 0) {
        return {
            ...results,
            totalFound: employees.length,
            totalEligible: eligibleEmployees.length,
            ineligible: ineligibleCount,
            alreadyProcessed: alreadyProcessedCount,
            message: "No pending employees eligible for processing (all are already processed or ineligible).",
            processed: 0,
            skipped: alreadyProcessedCount + ineligibleCount
        };
    }

    // 4. Process each pending employee
    for (const employee of employeesToProcess) {
        try {
            console.log('[Payroll] Processing Employee:', employee.name);
            console.log('[Payroll] Group:', employee.employeeGroupId);

            // Tally-style Selection Logic: 
            // 1. Employee-specific structure (latest)
            // 2. Fallback to Group-specific structure (latest)
            const employeeStructure = applicableStructures.find(s => s.employeeId === employee.id);
            const groupStructure = employee.employeeGroupId
                ? applicableStructures.find(s => s.employeeGroupId === employee.employeeGroupId)
                : null;

            const structure = employeeStructure || groupStructure;

            console.log('[Payroll] Salary structure:', structure ? (employeeStructure ? 'FOUND (Employee-level)' : 'FOUND (Group-level)') : 'NOT FOUND');

            if (!structure) {
                results.skipped++;
                const skipReason = "No active Salary Structure found (directly or via group)";
                results.errors.push({
                    employeeId: employee.id,
                    name: employee.name,
                    reason: skipReason,
                    code: 'NO_APPLICABLE_SALARY_STRUCTURE'
                });
                console.log(`[Payroll] Skipping ${employee.name}: ${skipReason}`);
                continue;
            }

            // A. Attendance Summary
            let attendanceRecords: any[] = [];
            let LOPDays = 0;

            console.log(`[PayrollEngine] Processing employee: ${employee.name} (Eligibility: Group ${employee.employeeGroup?.name || 'Primary'}, Salary Required: ${employee.employeeGroup?.defineSalaryDetails})`);
            console.log(`[PayrollEngine] Attendance Required Config: ${statutoryConfig.attendanceRequired}`);

            if (statutoryConfig.attendanceRequired) {
                attendanceRecords = await prisma.attendanceRecord.findMany({
                    where: {
                        companyId,
                        employeeId: employee.id,
                        date: { gte: periodStart, lte: periodEnd }
                    }
                });

                if (attendanceRecords.length > 0) {
                    LOPDays = attendanceRecords.filter(r => r.attendanceType === "ABSENT" || r.attendanceType === "LEAVE_WITHOUT_PAY").length;
                    console.log(`[PayrollEngine] Found ${attendanceRecords.length} attendance records. LOP Days: ${LOPDays}`);
                } else {
                    console.log(`[PayrollEngine] NO attendance records found for ${employee.name}. Defaulting to full presence.`);
                }
            } else {
                console.log(`[PayrollEngine] Attendance not required for ${employee.name}. Defaulting to full presence.`);
            }

            const paidDays = daysInMonth - LOPDays;
            console.log(`[PayrollEngine] Period: ${daysInMonth} days. Paid days: ${paidDays}`);

            // B. Calculation Pass 1: Independent PayHeads (Flat Rate, Attendance, User Defined)
            let grossEarnings = new Decimal(0);
            let totalDeductions = new Decimal(0);
            const calculatedItems: Array<{
                payHeadId: string;
                amount: Decimal;
                payHeadName: string;
                payHeadType: any;
                affectsNetSalary: boolean;
                computedOnAmount?: Decimal;
                computedPercentage?: Decimal;
                statutoryType?: string;
            }> = [];

            const payHeadMap: Record<string, Decimal> = {};

            // Sort items: Computed values last
            const sortedItems = [...structure.items].sort((a, b) => {
                if (a.payHead.calcType === "AS_COMPUTED_VALUE" && b.payHead.calcType !== "AS_COMPUTED_VALUE") return 1;
                if (a.payHead.calcType !== "AS_COMPUTED_VALUE" && b.payHead.calcType === "AS_COMPUTED_VALUE") return -1;
                return 0;
            });

            for (const item of sortedItems) {
                // Skip statutory items if disabled for this individual employee
                const sType = item.payHead.statutoryType;
                if (sType) {
                    const isPF = Object.values(PF_CONSTANTS.STATUTORY_TYPES).includes(sType);
                    const isPT = sType === "PT" || sType === "PROFESSIONAL_TAX";
                    const isESI = sType === "ESI";

                    if (isPF && !employee.pfApplicable) continue;
                    if (isPT && !employee.ptApplicable) continue;
                    if (isESI && !employee.esiApplicable) continue;
                }

                let amount = new Decimal(0);
                const baseAmount = new Decimal(item.amount || 0);

                switch (item.payHead.calcType) {
                    case "FLAT_RATE":
                        amount = baseAmount;
                        break;
                    case "ON_ATTENDANCE":
                        amount = baseAmount.div(daysInMonth).mul(paidDays);
                        break;
                    case "AS_USER_DEFINED_VALUE":
                        amount = baseAmount; // Use override from structure if provided
                        break;
                    case "AS_COMPUTED_VALUE":
                        // Resolve base for computation
                        let computationBase = new Decimal(0);
                        if (item.payHead.computeOn === "CURRENT_EARNINGS_TOTAL") {
                            computationBase = grossEarnings;
                        } else if (item.payHead.computeOn === "SPECIFIED_PAY_HEADS") {
                            computationBase = (item.payHead.computePayHeadIds as string[]).reduce(
                                (sum, id) => sum.plus(payHeadMap[id] || 0),
                                new Decimal(0)
                            );
                        }

                        const pct = new Decimal(item.percentage || item.payHead.computePercentage || 0);
                        amount = computationBase.mul(pct.div(100));
                        break;
                }

                // Apply to map for dependent calculations
                payHeadMap[item.payHeadId] = amount;

                // Track totals
                if (item.payHead.payHeadType === "EARNINGS_FOR_EMPLOYEES" || item.payHead.payHeadType === "BONUS" || item.payHead.payHeadType === "REIMBURSEMENT") {
                    grossEarnings = grossEarnings.plus(amount);
                } else if (item.payHead.payHeadType === "DEDUCTIONS_FROM_EMPLOYEES") {
                    totalDeductions = totalDeductions.plus(amount);
                }

                calculatedItems.push({
                    payHeadId: item.payHeadId,
                    amount,
                    payHeadName: item.payHead.name,
                    payHeadType: item.payHead.payHeadType,
                    affectsNetSalary: item.payHead.affectNetSalary,
                    statutoryType: item.payHead.statutoryType || undefined
                });
            }


            // C. Statutory Calculations (PF, PT)
            // 1. PF (Provident Fund)
            // Rule: Rely on individual employee flag first.
            if (employee.pfApplicable) {
                // Determine Basic + DA for PF Wages
                // Use statutoryType BASIC (or similar) instead of names
                const pfWageBase = calculatedItems
                    .filter(i => i.statutoryType === "BASIC" || i.payHeadName.toLowerCase().includes("basic") || i.payHeadName.toLowerCase().includes("da"))
                    .reduce((sum, item) => sum.plus(item.amount), new Decimal(0));

                const pfCeiling = statutoryConfig.pfWageCeiling ? Number(statutoryConfig.pfWageCeiling) : 1000000; // Use high value if null to allow full salary
                const pfResults = calculatePFComponents(pfWageBase, pfCeiling);

                // A. Employee PF Deduction (12%)
                const pfPayHead = await prisma.payHead.findFirst({
                    where: {
                        companyId,
                        payHeadType: "DEDUCTIONS_FROM_EMPLOYEES",
                        OR: [
                            { statutoryType: PF_CONSTANTS.STATUTORY_TYPES.EMPLOYEE },
                            { name: { contains: "PF", mode: "insensitive" } },
                            { name: { contains: "Provident Fund", mode: "insensitive" } }
                        ]
                    }
                });

                if (pfPayHead) {
                    console.log(`[Payroll] Found EE PF PayHead: ${pfPayHead.name}`);
                    const eeAmt = new Decimal(pfResults.eeContribution);

                    // Robust matching: Check by ID or if the item in calculatedItems already has PF statutory type/name
                    const existingIdx = calculatedItems.findIndex(i =>
                        i.payHeadId === pfPayHead.id ||
                        i.statutoryType === PF_CONSTANTS.STATUTORY_TYPES.EMPLOYEE ||
                        (i.payHeadName.toUpperCase().includes("PF") && i.payHeadType === "DEDUCTIONS_FROM_EMPLOYEES")
                    );

                    if (existingIdx >= 0) {
                        // Update existing
                        totalDeductions = totalDeductions.minus(calculatedItems[existingIdx].amount);
                        totalDeductions = totalDeductions.plus(eeAmt);
                        calculatedItems[existingIdx].amount = eeAmt;
                        calculatedItems[existingIdx].computedOnAmount = new Decimal(pfResults.pfWages);
                        calculatedItems[existingIdx].statutoryType = PF_CONSTANTS.STATUTORY_TYPES.EMPLOYEE;
                        // Important: Ensure the correct PayHead ID is used if we matched by name
                        calculatedItems[existingIdx].payHeadId = pfPayHead.id;
                    } else {
                        // Add new
                        totalDeductions = totalDeductions.plus(eeAmt);
                        calculatedItems.push({
                            payHeadId: pfPayHead.id,
                            amount: eeAmt,
                            payHeadName: pfPayHead.name,
                            payHeadType: "DEDUCTIONS_FROM_EMPLOYEES",
                            affectsNetSalary: true,
                            computedOnAmount: new Decimal(pfResults.pfWages),
                            statutoryType: PF_CONSTANTS.STATUTORY_TYPES.EMPLOYEE
                        });
                    }
                } else {
                    console.warn(`[Payroll] WARNING: Employee PF Deduction PayHead not found for company ${companyId}`);
                }

                // B. Employer Contributions (Splits & Charges) - Do NOT affect Net Salary
                const erConfigs = [
                    { type: PF_CONSTANTS.STATUTORY_TYPES.EMPLOYER_EPF, nameTag: "EPF", search: "EPF", amt: pfResults.erEpfDiff },
                    { type: PF_CONSTANTS.STATUTORY_TYPES.EMPLOYER_EPS, nameTag: "EPS", search: "EPS", amt: pfResults.eps },
                    { type: PF_CONSTANTS.STATUTORY_TYPES.PF_ADMIN, nameTag: "Admin", search: "Admin", amt: pfResults.adminCharges },
                    { type: PF_CONSTANTS.STATUTORY_TYPES.EDLI, nameTag: "EDLI", search: "EDLI", amt: pfResults.edliCharges },
                    { type: PF_CONSTANTS.STATUTORY_TYPES.EDLI_ADMIN, nameTag: "EDLI Admin", search: "EDLI Admin", amt: pfResults.edliAdminCharges },
                ];

                for (const config of erConfigs) {
                    const head = await prisma.payHead.findFirst({
                        where: {
                            companyId,
                            payHeadType: "EMPLOYERS_STATUTORY_CONTRIBUTIONS",
                            OR: [
                                { statutoryType: config.type },
                                { name: { contains: config.search, mode: "insensitive" } }
                            ]
                        }
                    });

                    if (head) {
                        console.log(`[Payroll] Found Employer PF Head (${config.nameTag}): ${head.name}`);
                        const amt = new Decimal(config.amt);
                        // Robust matching for employer items
                        const existingIdx = calculatedItems.findIndex(i =>
                            i.payHeadId === head.id ||
                            i.statutoryType === config.type ||
                            (i.payHeadName.toUpperCase().includes(config.search.toUpperCase()) && i.payHeadType === "EMPLOYERS_STATUTORY_CONTRIBUTIONS")
                        );

                        if (existingIdx >= 0) {
                            calculatedItems[existingIdx].amount = amt;
                            calculatedItems[existingIdx].computedOnAmount = new Decimal(pfResults.pfWages);
                            calculatedItems[existingIdx].statutoryType = config.type;
                            calculatedItems[existingIdx].payHeadId = head.id;
                        } else {
                            calculatedItems.push({
                                payHeadId: head.id,
                                amount: amt,
                                payHeadName: head.name,
                                payHeadType: "EMPLOYERS_STATUTORY_CONTRIBUTIONS",
                                affectsNetSalary: false,
                                statutoryType: config.type,
                                computedOnAmount: new Decimal(pfResults.pfWages)
                            });
                        }
                    } else {
                        console.warn(`[Payroll] WARNING: Employer PF Head for ${config.nameTag} not found for company ${companyId}`);
                    }
                }
            }

            // 2. PT (Professional Tax)
            const ptState = employee.state;
            if (employee.ptApplicable && ptState) {
                const slabs = await getPTSlabsByState(ptState);
                if (slabs.length > 0) {
                    const isFeb = month === 2;
                    // First try to find February-specific slab if it's Feb
                    let slab = isFeb
                        ? slabs.find(s => grossEarnings.gte(s.salaryFrom) && (s.salaryTo.isZero() || grossEarnings.lte(s.salaryTo)) && s.isFebruaryOverride)
                        : null;

                    // If not Feb, or no Feb override found, use standard slab
                    if (!slab) {
                        slab = slabs.find(s =>
                            grossEarnings.gte(s.salaryFrom) &&
                            (s.salaryTo.isZero() || grossEarnings.lte(s.salaryTo)) &&
                            !s.isFebruaryOverride
                        );
                    }

                    if (slab) {
                        let ptAmount = new Decimal(slab.monthlyAmount);

                        // 📍 Maharashtra Gender-Based Override
                        // Female Employees: Up to ₹25,000 -> ₹0; Above ₹25,000 -> Slabs (200/300)
                        if (ptState === "Maharashtra" && employee.gender === "FEMALE") {
                            if (grossEarnings.lte(25000)) {
                                console.log(`[Payroll] Maharashtra Female PT Exemption Applied (Gross: ${grossEarnings})`);
                                ptAmount = new Decimal(0);
                            }
                        }

                        // Find a PT PayHead if exists in system
                        const ptPayHead = await prisma.payHead.findFirst({
                            where: {
                                companyId,
                                OR: [
                                    { statutoryType: "PT" },
                                    { name: { contains: "Professional Tax", mode: "insensitive" } },
                                    { name: { contains: "PT", mode: "insensitive" } }
                                ]
                            }
                        });

                        if (ptPayHead) {
                            // Robust matching for PT
                            const existingIdx = calculatedItems.findIndex(i =>
                                i.payHeadId === ptPayHead.id ||
                                i.statutoryType === "PT" || i.statutoryType === "PROFESSIONAL_TAX" ||
                                (i.payHeadName.toUpperCase().includes("PT") || i.payHeadName.toUpperCase().includes("PROFESSIONAL TAX"))
                            );

                            if (existingIdx >= 0) {
                                // Update existing
                                totalDeductions = totalDeductions.minus(calculatedItems[existingIdx].amount);
                                totalDeductions = totalDeductions.plus(ptAmount);
                                calculatedItems[existingIdx].amount = ptAmount;
                                calculatedItems[existingIdx].computedOnAmount = grossEarnings;
                                calculatedItems[existingIdx].statutoryType = "PT";
                                calculatedItems[existingIdx].payHeadId = ptPayHead.id;
                            } else {
                                // Add new
                                totalDeductions = totalDeductions.plus(ptAmount);
                                calculatedItems.push({
                                    payHeadId: ptPayHead.id,
                                    amount: ptAmount,
                                    payHeadName: ptPayHead.name,
                                    payHeadType: "DEDUCTIONS_FROM_EMPLOYEES",
                                    affectsNetSalary: true,
                                    statutoryType: "PT",
                                    computedOnAmount: grossEarnings
                                });
                            }
                        }
                    } else {
                        console.log(`[Payroll] No PT slab found for employee ${employee.name} in state ${ptState} with gross ${grossEarnings}`);
                    }
                }
            }

            // D. Save Voucher
            const netSalary = grossEarnings.minus(totalDeductions);

            const voucher = await prisma.salaryVoucher.create({
                data: {
                    companyId,
                    employeeId: employee.id,
                    month,
                    year,
                    periodStart,
                    periodEnd,
                    totalWorkingDays: daysInMonth,
                    daysPresent: paidDays,
                    daysAbsent: LOPDays,
                    grossEarnings,
                    totalDeductions,
                    netSalary,
                    processedBy: userId,
                    status: "PROCESSED",
                    items: {
                        create: calculatedItems.map(item => ({
                            payHeadId: item.payHeadId,
                            amount: item.amount,
                            payHeadName: item.payHeadName,
                            payHeadType: item.payHeadType,
                            affectsNetSalary: item.affectsNetSalary,
                            computedOnAmount: item.computedOnAmount,
                            computedPercentage: item.computedPercentage
                        }))
                    }
                }
            });

            results.processed++;
            results.vouchers.push(voucher.id);

        } catch (error: any) {
            console.error(`[Payroll] CRITICAL ERROR processing ${employee.name}:`, error);
            results.errors.push({ employeeId: employee.id, name: employee.name, reason: error.message });
        }
    }

    const finalResult = {
        ...results,
        totalFound: employees.length,
        totalEligible: eligibleEmployees.length,
        ineligible: ineligibleCount,
        alreadyProcessed: alreadyProcessedCount,
        message: results.processed > 0
            ? `Salary processed for ${results.processed} employees successfully.`
            : `Salary processed for ${results.processed} employees. ${results.skipped} employees were skipped.`
    };

    console.log('[Payroll] Final Process Result:', finalResult);
    return finalResult;
};

