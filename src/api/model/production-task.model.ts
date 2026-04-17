import { prisma } from "../../init/db.init";

export const createProductionTaskModel = async (
    description: string,
    targetQuantity: number,
    priority: string,
    quotationId?: string,
    invoiceId?: string,
    customerName?: string,
    customerEmail?: string,
    orderDetails?: string,
    systemCapacity?: number,
    deliveryAddress?: string,
    assigneeId?: string,
    assigneeName?: string,
    deadline?: string
) => {
    return await prisma.productionTask.create({
        data: {
            description,
            targetQuantity,
            priority,
            status: "Pending",
            completedQuantity: 0,
            quotationId,
            invoiceId,
            customerName,
            customerEmail,
            orderDetails,
            systemCapacity,
            deliveryAddress,
            assigneeId,
            assigneeName,
            deadline: deadline ? new Date(deadline) : undefined
        },
    });
};

export const getProductionTasksModel = async () => {
    return await prisma.productionTask.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });
};

export const updateProductionTaskModel = async (id: string, data: any) => {
    return await prisma.productionTask.update({
        where: { id },
        data
    });
};

export const getProductionTasksByAssigneeModel = async (assigneeId: string) => {
    return await prisma.productionTask.findMany({
        where: {
            assigneeId
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

export const deleteProductionTaskModel = async (id: string) => {
    return await prisma.productionTask.delete({
        where: { id }
    });
};

