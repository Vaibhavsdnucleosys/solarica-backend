import { prisma } from "../config/prisma";

export const getDashboardData = async () => {
  const totalLeads = await prisma.lead.count();

  const totalRevenue = await prisma.lead.aggregate({
    _sum: { estimatedValue: true }
  });

  const recentLeads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 5
  });

  const statusStats = await prisma.lead.groupBy({
    by: ["status"],
    _count: true
  });

  return {
    totalLeads,
    revenue: totalRevenue._sum.estimatedValue || 0,
    recentLeads,
    statusStats
  };
};