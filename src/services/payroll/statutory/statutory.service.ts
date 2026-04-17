import prisma from "../../../config/prisma";
import { ensurePayrollVoucherType } from "../payrollAccounting.service";

export const getStatutoryConfig = async (companyId: string) => {
    let config = await prisma.statutoryConfig.findUnique({
        where: { companyId }
    });

    if (!config) {
        // Create default config if not exists
        config = await prisma.statutoryConfig.create({
            data: {
                companyId,
                payrollEnabled: false,
                attendanceRequired: true
            }
        });
    }

    return config;
};

export const updateStatutoryConfig = async (companyId: string, userId: string, data: any) => {
    const config = await prisma.statutoryConfig.upsert({
        where: { companyId },
        create: {
            ...data,
            companyId,
            updatedBy: userId
        },
        update: {
            ...data,
            updatedBy: userId
        }
    });

    return config;
};

export const activatePayroll = async (companyId: string) => {
    const config = await prisma.statutoryConfig.upsert({
        where: { companyId },
        create: {
            companyId,
            payrollEnabled: true,
            attendanceRequired: true
        },
        update: {
            payrollEnabled: true
        }
    });

    // Ensure system-defined "Payroll" voucher type is created
    await ensurePayrollVoucherType(companyId);

    return config;
};

