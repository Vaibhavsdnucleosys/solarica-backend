import prisma from "../../config/prisma";

// Set PT Exemption status for an employee (toggles "PT_EXEMPT" in accessGrants of linked Worker)
export const setPTExemptModel = async (userId: string, isExempt: boolean) => {
    // 1. Find the worker linked to this user
    const worker = await prisma.worker.findUnique({
        where: { userId }
    });

    if (!worker) {
        throw new Error("Worker profile not found for this user");
    }

    // 2. Update accessGrants
    let grants = worker.accessGrants || [];

    if (isExempt) {
        if (!grants.includes("PT_EXEMPT")) {
            grants.push("PT_EXEMPT");
        }
    } else {
        grants = grants.filter(g => g !== "PT_EXEMPT");
    }

    // 3. Save
    return await prisma.worker.update({
        where: { id: worker.id },
        data: { accessGrants: grants },
        include: { user: true } // Return user data too for confirmation
    });
};

// Bulk exempt employees
export const bulkPTExemptModel = async (userIds: string[], isExempt: boolean) => {
    // We need to iterate or do a smarter update. Since grants are arrays and can vary per user,
    // we can't easily do a single updateMany unless we replace the whole array, which is dangerous.
    // So we iterate.
    const results = [];
    for (const userId of userIds) {
        try {
            const res = await setPTExemptModel(userId, isExempt);
            results.push({ userId, success: true, data: res });
        } catch (error: any) {
            results.push({ userId, success: false, error: error.message });
        }
    }
    return results;
};

