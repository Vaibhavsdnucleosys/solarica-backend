import prisma from "../../config/prisma";

export const createNotificationModel = async (
    title: string,
    message: string,
    type: string = "INFO",
    quotationId?: string,
    userId?: string
) => {
    return await prisma.notification.create({
        data: {
            title,
            message,
            type,
            quotationId,
            userId
        }
    });
};

export const getNotificationsModel = async () => {
    return await prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50 // Limit to last 50
    });
};

export const markAsReadModel = async (id: string) => {
    return await prisma.notification.update({
        where: { id },
        data: { isRead: true }
    });
};

export const markAllAsReadModel = async () => {
    return await prisma.notification.updateMany({
        where: { isRead: false },
        data: { isRead: true }
    });
};

