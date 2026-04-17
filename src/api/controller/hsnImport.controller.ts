import { Request, Response } from 'express';
import XLSX from 'xlsx';
import fs from 'fs';
import { prisma } from '../../config/prisma';

export const importHsn = async (req: Request, res: Response) => {
    try {
        const filePath = req.file?.path;
        if (!filePath) return res.status(400).json({ error: "File not uploaded" });

        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rawData: any[] = XLSX.utils.sheet_to_json(sheet);

        const finalData: any[] = [];

        rawData.forEach((row: any) => {
            const codes = (row["hsnCode"] || "").toString().split(',');

            codes.forEach((codeRaw: string) => {
                const code = codeRaw.trim();
                if (!code) return;

                const igst = parseFloat((row["IGST Rate (%)"] || "0").toString().replace('%', '')) || 0;
                const cess = parseFloat((row["Compensation Cess"] || "0").toString().replace('%', '')) || 0;

                finalData.push({
                    hsnCode: code,
                    description: row["description"] || "",

                    // ✅ MAIN MAPPING
                    gstRate: igst,
                    cessRate: cess,

                    // ✅ CATEGORY AUTO
                    category: code.length > 4 ? "HSN" : "SAC",

                    // ✅ DEFAULT
                    isActive: true
                });
            });
        });

        // ✅ REMOVE DUPLICATES
        const uniqueData = Array.from(
            new Map(finalData.map(item => [item.hsnCode, item])).values()
        );

        // ✅ INSERT INTO DB
        await prisma.hSN.createMany({
            data: uniqueData,
            skipDuplicates: true
        });

        fs.unlinkSync(filePath); // delete temp file

        res.json({
            message: "HSN Imported Successfully",
            total: uniqueData.length
        });

    } catch (error) {
        console.error("IMPORT ERROR:", error);
        res.status(500).json({ error: "Import failed" });
    }
};