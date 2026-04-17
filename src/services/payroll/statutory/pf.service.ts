import { Decimal } from "@prisma/client/runtime/library";

/**
 * PF Constants and Calculation Rates
 */
export const PF_CONSTANTS = {
    STATUTORY_TYPES: {
        EMPLOYEE: "EPF_EE",
        EMPLOYER_EPF: "EPF_ER",
        EMPLOYER_EPS: "EPS_ER",
        PF_ADMIN: "PF_ADMIN",
        EDLI: "EDLI",
        EDLI_ADMIN: "EDLI_ADMIN",
    },
    RATES: {
        EMPLOYEE_PF: 0.12,          // 12%
        EMPLOYER_TOTAL: 0.12,       // 12%
        EMPLOYER_EPS: 0.0833,       // 8.33%
        EMPLOYER_PF_ADMIN: 0.005,   // 0.5%
        EMPLOYER_EDLI: 0.005,       // 0.5%
        EMPLOYER_EDLI_ADMIN: 0.0001, // 0.01%
    },
    CEILINGS: {
        DEFAULT_WAGE_CEILING: 15000,
        EPS_CEILING: 1250,
    }
};

/**
 * Calculate PF components based on EPFO rules
 */
export const calculatePFComponents = (wages: number | Decimal, ceiling: number = PF_CONSTANTS.CEILINGS.DEFAULT_WAGE_CEILING) => {
    const wageNum = typeof wages === "number" ? wages : wages.toNumber();

    // 1. PF Wages (capped at ceiling, usually 15000, but can be full salary if ceiling is very high)
    const pfWages = Math.min(wageNum, ceiling);

    // 2. Employee Contribution (12%)
    const eeContribution = Math.round(pfWages * PF_CONSTANTS.RATES.EMPLOYEE_PF);

    // 3. Employer Split
    // EPS (Pension) = 8.33% of PF wages, capped at 1250
    const eps = Math.min(Math.round(pfWages * PF_CONSTANTS.RATES.EMPLOYER_EPS), PF_CONSTANTS.CEILINGS.EPS_CEILING);

    // EPF (Employer PF) = Total 12% - EPS
    const totalEmployerPf = Math.round(pfWages * PF_CONSTANTS.RATES.EMPLOYER_TOTAL);
    const erEpfDiff = totalEmployerPf - eps;

    // 4. Admin Charges
    const adminCharges = Math.round(pfWages * PF_CONSTANTS.RATES.EMPLOYER_PF_ADMIN);
    const edliCharges = Math.round(pfWages * PF_CONSTANTS.RATES.EMPLOYER_EDLI);
    const edliAdminCharges = Math.round(pfWages * PF_CONSTANTS.RATES.EMPLOYER_EDLI_ADMIN);

    return {
        pfWages,
        eeContribution,
        eps,
        erEpfDiff,
        adminCharges,
        edliCharges,
        edliAdminCharges
    };
};

