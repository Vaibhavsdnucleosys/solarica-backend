import prisma from "../../config/prisma";

// Create a new task with multiple assignees
export const createTaskModel = async (
    name: string,
    dueDate: Date,
    priority: string,
    target: number,
    description: string | undefined,
    assigneeIds: string[], // Changed to array
    createdById: string
) => {
    return await prisma.task.create({
        data: {
            name,
            dueDate,
            priority,
            target,
            description,
            createdById,
            // Create assignments for each assignee
            assignments: {
                create: assigneeIds.map(userId => ({
                    userId,
                    completedTarget: 0,
                })),
            },
        },
        include: {
            assignments: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
};

// Get all tasks with optional filtering by assignee
export const getAllTasksModel = async (userId?: string) => {
    const where: any = {};

    if (userId) {
        where.assignments = {
            some: {
                userId: userId,
            },
        };
    }

    return await prisma.task.findMany({
        where,
        include: {
            assignments: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

// Update task progress for a specific user
export const updateTaskProgressModel = async (
    taskId: string,
    userId: string,
    completedTarget: number
) => {
    // First get the task to check the target
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
            assignments: true,
        },
    });

    if (!task) {
        throw new Error('Task not found');
    }

    if (completedTarget > task.target) {
        throw new Error('Completed target cannot exceed the assigned target');
    }

    // Update the specific user's progress
    const assignment = await prisma.taskAssignment.update({
        where: {
            taskId_userId: {
                taskId,
                userId,
            },
        },
        data: {
            completedTarget,
        },
    });

    // Calculate overall task status based on all assignments
    const allAssignments = await prisma.taskAssignment.findMany({
        where: { taskId },
    });

    // Calculate average completion percentage across all assignees
    const totalCompletion = allAssignments.reduce(
        (sum, a) => sum + a.completedTarget,
        0
    );
    const averageCompletion = totalCompletion / allAssignments.length;
    const percentage = (averageCompletion / task.target) * 100;

    let status = 'TO_DO';
    if (percentage === 100) {
        status = 'COMPLETED';
    } else if (percentage > 0 && percentage < 100) {
        status = 'IN_PROGRESS';
    }

    // Update task status
    const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { status },
        include: {
            assignments: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    return updatedTask;
};

// Get task analytics
export const getTaskAnalyticsModel = async () => {
    // Get total high priority tasks
    const highPriorityCount = await prisma.task.count({
        where: {
            priority: 'HIGH',
        },
    });

    // Get active members (unique assignees)
    const activeMembersData = await prisma.taskAssignment.groupBy({
        by: ['userId'],
    });
    const activeMembersCount = activeMembersData.length;

    // Get task completion stats
    const completedCount = await prisma.task.count({
        where: { status: 'COMPLETED' },
    });

    const inProgressCount = await prisma.task.count({
        where: { status: 'IN_PROGRESS' },
    });

    const todoCount = await prisma.task.count({
        where: { status: 'TO_DO' },
    });

    return {
        highPriorityTasks: highPriorityCount,
        activeMembers: activeMembersCount,
        taskCompletion: {
            completed: completedCount,
            inProgress: inProgressCount,
            toDo: todoCount,
        },
    };
};

