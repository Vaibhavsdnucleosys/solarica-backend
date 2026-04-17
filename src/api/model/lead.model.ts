// src/api/model/lead.model.ts
import prisma from "../../config/prisma";
import { Prisma } from "@prisma/client";
// ✅ CREATE
export const createLeadModel = async (
  name: string,
  company: string,
  email: string,
  phone: string,
  source: string,
  createdById: string,
  estimatedValue?: number,
  notes?: string,
   customerType?: string
) => {
  return await prisma.lead.create({
    data: {
      name,
      company,
      email,
      phone,
      source,
      status: "New",
      estimatedValue,
      notes,
      createdById,
       customerType,
    },
  });
};

// ✅ GET ALL (Admin sees all, others see own)
export const getLeadsModel = async (
  userId: string,
  userRole: string,
  filters: any = {}
) => {
  const { status, source, search } = filters;

  const where: Prisma.LeadWhereInput =
    userRole === "admin" ? {} : { createdById: userId };

  // const where: Prisma.LeadWhereInput =
  // userRole === "admin"
  //   ? { customerType: "Indian" }   // ✅ FILTER ADDED
  //   : {
  //       createdById: userId,
  //       customerType: "Indian"     // ✅ FILTER ADDED
  //     };

  if (status) where.status = status;
  if (source) where.source = source;

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  return await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          worker: {
            select: {
              company: true,
            },
          },
        },
      },
    },
  });
};

// ✅ GET SINGLE (Admin can access any)
export const getLeadByIdModel = async (
  id: string,
  userId: string,
  userRole: string
) => {
  const where: Prisma.LeadWhereInput =
    userRole === "admin"
      ? { id }
      : { id, createdById: userId };

  return await prisma.lead.findFirst({
    where,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          worker: {
            select: {
              company: true,
            },
          },
        },
      },
    },
  });
};

// ✅ UPDATE (Admin can update any)
// [UPGRADE]: The update logic has been shifted to updateMany to resolve a Prisma unique constraint error present in Code A.
// Since owner-based filtering (createdById) involves a non-unique field, updateMany is required for combined filtering.
export const updateLeadModel = async (
  id: string,
  userId: string,
  userRole: string,
  data: Prisma.LeadUpdateInput
) => {
  const where =
    userRole === "admin"
      ? { id }
      : { id, createdById: userId };

  return await prisma.lead.updateMany({
    where,
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
};

// ✅ DELETE (Admin can delete any)
// [UPGRADE]: Changed from delete to deleteMany to support owner-based authorization filtering on non-unique fields.
export const deleteLeadModel = async (
  id: string,
  userId: string,
  userRole: string
) => {
  const where =
    userRole === "admin"
      ? { id }
      : { id, createdById: userId };

  return await prisma.lead.deleteMany({
    where,
  });
};

// ✅ STATS (Admin sees all data)
export const getLeadStatsModel = async (
  userId: string,
  userRole: string
) => {
  const where =
    userRole === "admin" ? {} : { createdById: userId };

  const stats = await prisma.lead.groupBy({
    by: ["status"],
    where,
    _count: { id: true },
    _sum: { estimatedValue: true },
  });

  const totalLeads = await prisma.lead.count({ where });

  const totalValue = await prisma.lead.aggregate({
    where,
    _sum: { estimatedValue: true },
  });

  return {
    byStatus: stats.map((stat) => ({
      status: stat.status,
      count: stat._count.id,
      value: stat._sum.estimatedValue || 0,
    })),
    total: {
      count: totalLeads,
      value: totalValue._sum.estimatedValue || 0,
    },
  };
};

// ✅ GET ALL EMAILS
export const getAllLeadEmails = async () => {
  try {
    const leads = await prisma.lead.findMany({
      where: {
        email: {
          // [UPGRADE]: Switched to native Prisma string exclusion for cleaner syntax and performance
          not: "",
        },
      },
      select: {
        email: true,
      },
    });

    return [...new Set(leads.map((l) => l.email!))];
  } catch (error) {
    console.error("Error in getAllLeadEmails:", error);
    throw error;
  }
};

// ✅ SEARCH NAMES (Admin sees all)
export const searchLeadNamesModel = async (
  query: string,
  userId: string,
  userRole: string
) => {
  const where: Prisma.LeadWhereInput =
    userRole === "admin" ? {} : { createdById: userId };

  return await prisma.lead.findMany({
    where: {
      ...where,
      name: {
        contains: query,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
      company: true,
    },
    take: 10,
    orderBy: {
      name: "asc",
    },
  });
};

// ✅ GET ALL PHONE NUMBERS
export const getAllLeadPhoneNumbers = async () => {
  try {
    const leads = await prisma.lead.findMany({
      where: {
        phone: {
          // [UPGRADE]: Switched to native Prisma string exclusion for cleaner syntax and performance
          not: "",
        },
      },
      select: {
        phone: true,
      },
    });

    return [...new Set(leads.map((l) => l.phone).filter(Boolean))];
  } catch (error) {
    console.error("Error in getAllLeadPhoneNumbers:", error);
    throw error;
  }
};