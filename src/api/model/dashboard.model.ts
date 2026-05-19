import prisma from "../../config/prisma";

export const getDashboardOverviewModel =
    async () => {

        // ALL QUOTATIONS
        const quotations =
            await prisma.quotation.findMany({
                orderBy: {
                    createdAt: "desc"
                },
                include: {
                    items: true
                }
            });

        // ALL INVOICES
        const invoices =
            await prisma.invoice.findMany();

        // ALL TASKS
        const productionTasks =
            await prisma.productionTask.findMany();

        // ALL COMPANIES
        const companies =
            await prisma.company.findMany({
                select: {
                    id: true,
                    name: true,
                    displayName: true
                }
            });

        // TOTAL TURNOVER
        const turnover =
            invoices.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.grandTotalPayable || 0
                    ),
                0
            );

        // TOTAL PAYMENTS
        const paymentsReceived =
            invoices.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.paidAmount || 0
                    ),
                0
            );

        // CLIENT BALANCE
        const clientBalance =
            invoices.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.remainingAmount || 0
                    ),
                0
            );

        // TOTAL EXPENSE
        const totalExpense =
            productionTasks.reduce(
                (sum, task) =>
                    sum +
                    Number(
                        task.dispatchQty || 0
                    ),
                0
            );

        // PROJECT TABLE
        const projectPerformance =
            quotations.map((q: any, index) => {

                const relatedInvoice =
                    invoices.find(
                        (i: any) =>
                            i.customerName ===
                            q.companyName
                    );

                const relatedTasks =
                    productionTasks.filter(
                        (t: any) =>
                            t.quotationId === q.id
                    );

                const completedTasks =
                    relatedTasks.filter(
                        (t: any) =>
                            t.status ===
                            "Production Done"
                    ).length;

                return {
                    id: index + 1,

                    quotationId:
                        q.id,

                    companyName:
                        q.companyName,

                    customer:
                        q.companyName,

                    projectAmount:
                        Number(
                            q.totalAmount || 0
                        ),

                    payments:
                        Number(
                            relatedInvoice?.paidAmount || 0
                        ),

                    balance:
                        Number(
                            relatedInvoice?.remainingAmount || 0
                        ),

                    tasks:
                        `${completedTasks} / ${relatedTasks.length}`,

                    expense:
                        Number(
                            q.systemCost || 0
                        ),

                    unpaidExpense:
                        Number(
                            relatedInvoice?.remainingAmount || 0
                        ),

                    profit:
                        Number(
                            q.netPayableAmount || 0
                        ),

                    status:
                        q.status,

                    company:
                        q.fromCompanyName,

                    createdAt:
                        q.createdAt
                };
            });

        return {

            stats: {

                turnover,

                paymentsReceived,

                clientBalance,

                totalExpense,

                totalProjects:
                    quotations.length,

                totalCompanies:
                    companies.length,

                totalTasks:
                    productionTasks.length
            },

            companies,

            projectPerformance
        };
    };