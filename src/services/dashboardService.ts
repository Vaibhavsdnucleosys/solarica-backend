// import { prisma } from "../config/prisma";

// export const getDashboardData = async () => {
// const quotations =
//     await prisma.quotation.findMany();

//     const groupedCompanies: any = {};

//     quotations.forEach((q: any) => {

//         const company =
//             q.companyName || "Unknown";

//         if (!groupedCompanies[company]) {

//             groupedCompanies[company] = {
//                 companyName: company,
//                 totalRevenue: 0,
//                 totalPayments: 0,
//                 totalExpense: 0,
//                 balance: 0,
//                 projects: []
//             };
//         }

//         const amount =
//             Number(q.finalAmount || 0);

//         const payment =
//             Number(q.paidAmount || 0);

//         const expense =
//             Number(q.expenseAmount || 0);

//         const balance =
//             amount - payment;

//         groupedCompanies[company].totalRevenue += amount;

//         groupedCompanies[company].totalPayments += payment;

//         groupedCompanies[company].totalExpense += expense;

//         groupedCompanies[company].balance += balance;

//         groupedCompanies[company].projects.push({

//             id: q.id,

//             companyName:
//                 q.projectName,

//             clientName:
//                 q.clientName,

//             projectAmount:
//                 amount,

//             payments:
//                 payment,

//             balance:
//                 balance,

//             tasks:
//                 q.productionTasks?.length || 0,
                

//             expense:
//                 expense,

//             unpaidExpense:
//                 expense,

//             profit:
//                 payment - expense
//         });
//     });

//     return {
//         companies:
//             Object.values(groupedCompanies)
//     };
// };

import { prisma } from "../config/prisma";

export const getCompanyDashboardData =
    async () => {

        const quotations =
            await prisma.quotation.findMany({

                orderBy: {
                    createdAt: "desc"
                }
            });

        const groupedCompanies: any = {};

        quotations.forEach((q: any) => {

          const companyName =
    q.fromCompanyName ||
    "Unknown";

            if (
                !groupedCompanies[companyName]
            ) {

                groupedCompanies[companyName] = {

                    id: companyName,

                    companyName,

                    stats: {

                        turnover: 0,

                        paymentsReceived: 0,

                        totalExpense: 0,

                        clientBalance: 0,

                        profit: 0
                    },

                    projectPerformance: []
                };
            }

            const amount =
                Number(
                    q.finalAmount ||
                    q.totalAmount ||
                    0
                );

            const payment =
                Number(
                    q.paidAmount ||
                    q.paymentReceived ||
                    0
                );

            const expense =
                Number(
                    q.expenseAmount ||
                    0
                );

            const balance =
                amount - payment;

            const profit =
                amount - expense;

            groupedCompanies[
                companyName
            ].stats.turnover += amount;

            groupedCompanies[
                companyName
            ].stats.paymentsReceived += payment;

            groupedCompanies[
                companyName
            ].stats.totalExpense += expense;

            groupedCompanies[
                companyName
            ].stats.clientBalance += balance;

            groupedCompanies[
                companyName
            ].stats.profit += profit;

            groupedCompanies[
                companyName
            ].projectPerformance.push({

                id: q.id,

                companyName,

           projectName:
    q.serviceType ||
    q.systemCapacityKw
        ? `${q.systemCapacityKw || ''}KW ${q.serviceType || 'Solar Project'}`
        : q.companyName ||
          'Solar Project',

             customerName: 
    q.companyName,

                projectAmount:
                    amount,

                payments:
                    payment,

                expense,

                balance,

                profit
            });
        });

        return {

            companies:
                Object.values(
                    groupedCompanies
                )
        };
    };
