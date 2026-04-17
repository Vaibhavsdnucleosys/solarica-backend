import express from "express";
import { prisma } from "../../config/prisma";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
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

    res.json({
      totalLeads,
      revenue: totalRevenue._sum.estimatedValue || 0,
      recentLeads,
      statusStats
    });
  } catch (err) {
    res.status(500).json({ error: "Dashboard fetch failed" });
  }
});

export default router;