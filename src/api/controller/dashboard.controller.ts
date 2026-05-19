import { Request, Response } from "express";
import { getDashboardOverviewModel } from "../model/dashboard.model";
import { getCompanyDashboardData } from "../../services/dashboardService";

export const getDashboardOverview = async (
    req: Request,
    res: Response
) => {

    try {

        const data =
            await getDashboardOverviewModel();

        res.json({
            success: true,
            data
        });

    } catch (error: any) {

        console.error(
            "Dashboard Error",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getCompanyDashboardOverview =
    async (
        req: Request,
        res: Response
    ) => {

        try {

            const data =
                await getCompanyDashboardData();

            return res.status(200).json({

                success: true,

                data
            });

        } catch (error) {

            console.error(
                "Company Dashboard Error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to load company dashboard"
            });
        }
    };