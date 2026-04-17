import prisma from "../../config/prisma";

/**
 * Lock a payroll period for a specific group or all groups
 * - employeeGroupId = "all" or undefined → lock every group + a global marker
 * - employeeGroupId = specific id → lock only that group
 */
export const lockPayrollPeriod = async (
    companyId: string,
    month: number,
    year: number,
    userId: string,
    employeeGroupId?: string
) => {
    if (!employeeGroupId || employeeGroupId === "all") {
        // "All Employees" → lock every group individually
        const groups = await prisma.employeeGroup.findMany({
            where: { companyId, isActive: true },
            select: { id: true, name: true }
        });

        const results = [];

        // Global lock (null employeeGroupId)
        results.push(await upsertLock(companyId, month, year, userId, null));

        // Per-group locks
        for (const group of groups) {
            results.push(await upsertLock(companyId, month, year, userId, group.id));
        }

        return { message: `Payroll locked for all ${groups.length} groups`, data: results };
    } else {
        // Specific group lock only
        const lock = await upsertLock(companyId, month, year, userId, employeeGroupId);
        return { message: `Payroll locked for selected group`, data: lock };
    }
};

/**
 * Helper: create lock if not exists
 */
async function upsertLock(
    companyId: string,
    month: number,
    year: number,
    userId: string,
    employeeGroupId: string | null
) {
    const existing = await (prisma as any).payrollLock.findFirst({
        where: { companyId, month, year, employeeGroupId }
    });

    if (existing) return existing;

    return await (prisma as any).payrollLock.create({
        data: {
            companyId,
            month,
            year,
            lockedBy: userId,
            employeeGroupId
        }
    });
}

/**
 * Get derived payroll status — GROUP-AWARE
 * Checks lock for the specific group, then voucher status for that group
 */
export const getDerivedPayrollStatus = async (
    companyId: string,
    month: number,
    year: number,
    employeeGroupId?: string
) => {
    // 1. Check group-specific lock
    let lockWhere: any = { companyId, month, year };

    if (employeeGroupId && employeeGroupId !== "all") {
        lockWhere.employeeGroupId = employeeGroupId;
    } else {
        // For "all" check global lock (null employeeGroupId)
        lockWhere.employeeGroupId = null;
    }

    const lock = await (prisma as any).payrollLock.findFirst({
        where: lockWhere,
        select: {
            id: true,
            companyId: true,
            month: true,
            year: true,
            lockedAt: true,
            lockedBy: true,
            employeeGroupId: true
        }
    });

    if (!lock) return { status: "OPEN", lockInfo: null };

    // 2. Check vouchers for the specific group
    const voucherWhere: any = { companyId, month, year };
    if (employeeGroupId && employeeGroupId !== "all") {
        voucherWhere.employee = { employeeGroupId };
    }

    const vouchers = await prisma.salaryVoucher.findMany({
        where: voucherWhere,
        select: { status: true }
    });

    if (vouchers.length === 0) {
        return { status: "LOCKED", lockInfo: lock };
    }

    const allApproved = vouchers.every(v => v.status === "APPROVED");
    if (allApproved) {
        return { status: "APPROVED", lockInfo: lock };
    }

    return { status: "PROCESSED", lockInfo: lock };
};

/**
 * Unlock a payroll period for a specific group or all groups
 */
export const unlockPayrollPeriod = async (
    companyId: string,
    month: number,
    year: number,
    employeeGroupId?: string
) => {
    // Determine which locks to remove
    const lockWhere: any = { companyId, month, year };

    if (employeeGroupId && employeeGroupId !== "all") {
        lockWhere.employeeGroupId = employeeGroupId;
    }
    // If "all" or undefined → remove ALL locks for this period (all groups + global)

    // Check vouchers for the targeted group
    const voucherWhere: any = { companyId, month, year };
    if (employeeGroupId && employeeGroupId !== "all") {
        voucherWhere.employee = { employeeGroupId };
    }

    const vouchersCount = await prisma.salaryVoucher.count({ where: voucherWhere });

    if (vouchersCount > 0) {
        throw new Error(`Cannot unlock payroll for ${month}/${year} — salary vouchers exist. Delete them first.`);
    }

    return await (prisma as any).payrollLock.deleteMany({ where: lockWhere });
};

/**
 * Get lock status for a period (Legacy/Compatibility)
 */
export const getPayrollLockStatus = async (companyId: string, month: number, year: number) => {
    return await (prisma as any).payrollLock.findFirst({
        where: { companyId, month, year, employeeGroupId: null },
        select: {
            id: true,
            companyId: true,
            month: true,
            year: true,
            lockedAt: true,
            lockedBy: true
        }
    });
};

/**
 * Check if a date is within a locked period
 */
export const isPeriodLocked = async (companyId: string, date: Date) => {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const lock = await (prisma as any).payrollLock.findFirst({
        where: { companyId, month, year },
        select: { id: true }
    });

    return !!lock;
};

