import prisma from "../../config/prisma";

// Get employee performance report
export const getEmployeeReportModel = async (employeeId?: string, company?: string) => {
  // Get all sales employees (excluding admin)
  const salesEmployees = await prisma.user.findMany({
    where: {
      role: {
        name: {
          in: ['sales', 'Sales', 'Sales Employee', 'sales employee', 'admin', 'Admin', 'Administrator']
        }
      },
      ...(employeeId && { id: employeeId })
    },
    select: {
      id: true,
      name: true,          // ✅ user name
      email: true,
      createdAt: true,
      salesTarget: true,
      role: {
        select: {
          name: true
        }
      },

      quotations: {
        where: company ? {
          fromCompanyName: {
            contains: company,
            mode: 'insensitive'
          }
        } : {},
        select: {
          id: true,
          companyEmail: true,
          status: true,
          netPayableAmount: true,
          createdAt: true
        }
      },
    }
  });

  console.log(`[DEBUG] Found ${salesEmployees.length} sales employees matching filter.`);
  if (salesEmployees.length > 0) {
    salesEmployees.forEach(e => {
      console.log(`[DEBUG] Employee: ${e.name} (${e.role.name}), Quotations: ${e.quotations?.length}`);
    });
  }


  // Generate reports for each employee
  const reports = salesEmployees.map(employee => {
    const quotations = employee.quotations;

    // Calculate metrics
    const totalClientsVisited = quotations.length;
    const totalClientsConverted = quotations.filter(q => q.status === 'ACCEPTED').length;
    const successRate = totalClientsVisited > 0
      ? Math.round((totalClientsConverted / totalClientsVisited) * 100)
      : 0;

    // Calculate total deal value
    const totalDealValue = quotations
      .filter(q => q.status === 'ACCEPTED')
      .reduce((sum, q) => sum + q.netPayableAmount, 0);

    // Get service types offered
    // const serviceTypesOffered = [
    //   ...new Set(quotations.map(q => q.serviceType))
    // ];

    return {
      employeeId: employee.id,
      email: employee.email,
      employeeName: employee.name || 'Unknown',
      totalClientsVisited,
      totalClientsConverted,
      successRate,
      //serviceTypesOffered,
      totalDealValue,
      salesTarget: employee.salesTarget,
      totalQuotations: quotations.length,
      pendingQuotations: quotations.filter(q => q.status === 'SENT').length,
      rejectedQuotations: quotations.filter(q => q.status === 'REJECTED').length,
      followupQuotations: quotations.filter(q => q.status === 'followup').length
    };
  });

  return reports;
};

// Get all employees report (admin only)
export const getAllEmployeesReportModel = async (company?: string) => {
  return await getEmployeeReportModel(undefined, company);
};

// Get specific employee report
export const getEmployeeReportByIdModel = async (employeeId: string, company?: string) => {
  const reports = await getEmployeeReportModel(employeeId, company);

  if (reports.length === 0) {
    throw new Error('Employee not found or not a sales employee');
  }

  return reports[0];
};

// Get team performance summary
export const getTeamPerformanceSummaryModel = async (company?: string) => {
  const reports = await getEmployeeReportModel(undefined, company);

  const totalEmployees = reports.length;
  const totalClientsVisited = reports.reduce((sum, r) => sum + r.totalClientsVisited, 0);
  const totalClientsConverted = reports.reduce((sum, r) => sum + r.totalClientsConverted, 0);
  const averageSuccessRate = totalEmployees > 0
    ? Math.round(reports.reduce((sum, r) => sum + r.successRate, 0) / totalEmployees)
    : 0;
  const totalDealValue = reports.reduce((sum, r) => sum + r.totalDealValue, 0);

  // Top performer
  const topPerformer = reports.reduce((top, current) =>
    current.totalDealValue > top.totalDealValue ? current : top, reports[0] || null
  );

  return {
    summary: {
      totalEmployees,
      totalClientsVisited,
      totalClientsConverted,
      averageSuccessRate,
      totalDealValue,
      totalQuotations: reports.reduce((sum, r) => sum + r.totalQuotations, 0),
      pendingQuotations: reports.reduce((sum, r) => sum + r.pendingQuotations, 0),
      rejectedQuotations: reports.reduce((sum, r) => sum + r.rejectedQuotations, 0),
      rejectionRate: reports.reduce((sum, r) => sum + r.totalQuotations, 0) > 0
        ? Math.round((reports.reduce((sum, r) => sum + r.rejectedQuotations, 0) / reports.reduce((sum, r) => sum + r.totalQuotations, 0)) * 100)
        : 0
    },
    topPerformer: topPerformer ? {
      employeeName: topPerformer.employeeName,
      email: topPerformer.email,
      totalDealValue: topPerformer.totalDealValue,
      successRate: topPerformer.successRate
    } : null,
    employeeReports: reports
  };
};

// Get monthly sales report for all sales employees with totals
export const getMonthlySalesReportModel = async (months: number = 12, year?: number, company?: string) => {
  const currentYear = year || new Date().getFullYear();
  const currentDate = new Date();
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - months + 1, 1);

  // Get all sales employees
  const salesEmployees = await prisma.user.findMany({
    where: {
      role: {
        name: {
          in: ['sales', 'Sales']
        }
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      salesTarget: true,  // Include sales target
      quotations: {
        where: {
          status: 'accepted',
          createdAt: {
            gte: startDate,
            lte: currentDate
          },
          ...(company ? {
            fromCompanyName: {
              contains: company,
              mode: 'insensitive'
            }
          } : {})
        },
        select: {
          //budget: true,
          netPayableAmount: true,
          createdAt: true
        }
      }
    }
  });

  // Initialize monthly data structure
  const monthlyData: Array<{
    month: number;
    year: number;
    monthName: string;
    totalSales: number;
    employeeData: Array<{
      employeeId: string;
      employeeName: string;
      sales: number;
      quotationsIssued: number;
      target: number | null;
      achievement: number | null;
    }>;
  }> = [];

  // Initialize months array
  for (let i = 0; i < months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    monthlyData.unshift({
      month,
      year,
      monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
      totalSales: 0,
      employeeData: []
    });
  }

  // Process each employee's sales
  salesEmployees.forEach(employee => {
    const employeeStatsByMonth = new Map<string, { sales: number, count: number }>();

    // Initialize all months
    monthlyData.forEach(monthData => {
      const key = `${monthData.month}-${monthData.year}`;
      employeeStatsByMonth.set(key, { sales: 0, count: 0 });
    });

    // Calculate sales and counts for each month
    employee.quotations.forEach(quotation => {
      const quoteDate = new Date(quotation.createdAt);
      const month = quoteDate.getMonth() + 1;
      const year = quoteDate.getFullYear();
      const key = `${month}-${year}`;

      const current = employeeStatsByMonth.get(key) || { sales: 0, count: 0 };
      employeeStatsByMonth.set(key, {
        sales: current.sales + Number(quotation.netPayableAmount),
        count: current.count + 1
      });
    });

    // Add employee data to each month
    monthlyData.forEach(monthData => {
      const key = `${monthData.month}-${monthData.year}`;
      const stats = employeeStatsByMonth.get(key) || { sales: 0, count: 0 };

      monthData.employeeData.push({
        employeeId: employee.id,
        employeeName: employee.name,
        sales: stats.sales,
        quotationsIssued: stats.count,
        target: employee.salesTarget ? Number(employee.salesTarget) / 12 : null,
        achievement: employee.salesTarget
          ? (stats.sales / (Number(employee.salesTarget) / 12)) * 100
          : null
      });

      // Add to total sales
      monthData.totalSales += stats.sales;
    });
  });

  // Calculate summary
  const summary = {
    totalSales: monthlyData.reduce((sum, month) => sum + month.totalSales, 0),
    averageMonthlySales: monthlyData.length > 0
      ? monthlyData.reduce((sum, month) => sum + month.totalSales, 0) / monthlyData.length
      : 0,
    totalEmployees: salesEmployees.length,
    months: monthlyData.map(m => `${m.monthName} ${m.year}`)
  };

  return {
    summary,
    monthlyData,
    employees: salesEmployees.map(e => ({
      id: e.id,
      name: e.name,
      email: e.email,
      salesTarget: e.salesTarget
    }))
  };
};

