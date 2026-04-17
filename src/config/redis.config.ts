/**
 * Shared Redis connection configuration (DISABLED)
 */
export const redisConnection: any = {
    // Dummy implementation to prevent connection errors
    on: () => { },
    once: () => { },
    emit: () => { },
    quit: async () => { },
    disconnect: async () => { },
    status: 'closed'
};

