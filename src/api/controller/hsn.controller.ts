import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import XLSX from 'xlsx';
import fs from 'fs';


// ✅ LIST
export const list = async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const search = String(req.query.search || '');
    const skip = (page - 1) * limit;

    const where = search
        ? {
              OR: [
                  { hsnCode: { contains: search, mode: 'insensitive' as any } },
                  { description: { contains: search, mode: 'insensitive' as any } }
              ]
          }
        : {};

    const [data, total] = await Promise.all([
        prisma.hSN.findMany({
            where,
            skip,
            take: limit,
            orderBy: { hsnCode: 'asc' }
        }),
        prisma.hSN.count({ where })
    ]);

    res.json({
        data,
        meta: {
            total,
            page,
            lastPage: Math.ceil(total / limit)
        }
    });
};


// ✅ CREATE
export const create = async (req: Request, res: Response) => {
    try {
        const data = await prisma.hSN.create({
            data: {
                hsnCode: req.body.hsnCode,
                description: req.body.description,
                cgstRate: Number(req.body.cgstRate || 0),
                sgstRate: Number(req.body.sgstRate || 0),
                igstRate: Number(req.body.igstRate || 0),
                category: req.body.category || 'SAC',
                isActive: true
            }
        });

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Create failed' });
    }
};


// ✅ UPDATE
export const update = async (req: Request, res: Response) => {
    try {
        const data = await prisma.hSN.update({
        where: { id: Number(req.params.id) },
            data: {
                description: req.body.description,
                cgstRate: Number(req.body.cgstRate),
                sgstRate: Number(req.body.sgstRate),
                igstRate: Number(req.body.igstRate),
                category: req.body.category,
                isActive: req.body.isActive
            }
        });

        res.json(data);
    } catch {
        res.status(500).json({ error: 'Update failed' });
    }
};

// export const importHsn = async (req: Request, res: Response) => {
//     try {
//         const file = req.file;

//         // 🔴 File validation
//         if (!file || !file.path) {
//             console.log("File issue:", file);
//             return res.status(400).json({ error: "File missing" });
//         }

//         // 📄 Read Excel file
//         // const workbook = XLSX.readFile(file.path);
//         if (!fs.existsSync(file.path)) {
//     console.log("File not found:", file.path);
//     return res.status(400).json({ error: "Uploaded file not found" });
// }

// const workbook = XLSX.readFile(file.path);
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];

//         const rawData: any[] = XLSX.utils.sheet_to_json(sheet);

//         console.log("First Row:", rawData[0]); // ✅ Debug

//         const finalData: {
//             hsnCode: string;
//             description: string;
//             cgstRate: number;
//             sgstRate: number;
//             igstRate: number;
//             cess: number;
//             category: string;
//             isActive: boolean;
//         }[] = [];

//         rawData.forEach((row: any) => {
//             try {
//                 // 🧠 Handle multi-line + comma-separated HSN codes
//                 const codes = (row["hsnCode"] || "")
//                     .toString()
//                     .replace(/\n/g, '')   // remove line breaks
//                     .split(',')
//                     .map((c: string) => c.trim())
//                     .filter((c: string) => c);

//                 // 📊 Parse GST values safely
//                 const cgst =
//                     parseFloat(
//                         (row["CGST Rate (%)"] || "0").toString().replace('%', '').trim()
//                     ) || 0;

//                 const sgst =
//                     parseFloat(
//                         (row["SGST/UTGST Rate (%)"] || "0").toString().replace('%', '').trim()
//                     ) || 0;

//                 const igst =
//                     parseFloat(
//                         (row["IGST Rate (%)"] || "0").toString().replace('%', '').trim()
//                     ) || 0;

//                 const cess =
//                     parseFloat(
//                         (row["Compensation Cess"] || "0").toString().replace('%', '').trim()
//                     ) || 0;

//                 codes.forEach((code: string) => {
//                     finalData.push({
//                         hsnCode: code,
//                         description: (row["description"] || "").toString(),
//                         cgstRate: cgst,
//                         sgstRate: sgst,
//                         igstRate: igst,
//                         cess: cess,
//                         category: code.length > 4 ? "HSN" : "SAC",
//                         isActive: true
//                     });
//                 });

//             } catch (err) {
//                 console.log("Row Error:", row, err); // ✅ debug per row
//             }
//         });

//         console.log("Total Records:", finalData.length);

//         // 💾 Insert into DB
//         await prisma.hSN.createMany({
//             data: finalData,
//             skipDuplicates: true
//         });

//         // 🧹 Delete uploaded file safely
//         if (fs.existsSync(file.path)) {
//             fs.unlinkSync(file.path);
//         }

//         return res.json({
//             message: "Imported Successfully",
//             count: finalData.length
//         });

//     } catch (error) {
//         console.error("IMPORT ERROR:", error);
//         return res.status(500).json({ error: "Import failed" });
//     }
// };

export const importHsn = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file || !file.path) {
      return res.status(400).json({ error: "File missing" });
    }

    const workbook = XLSX.readFile(file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData: any[] = XLSX.utils.sheet_to_json(sheet);

    const finalData: any[] = [];
    const seen = new Set(); // ✅ prevent duplicates

    rawData.forEach((row: any) => {
      if (!row["hsnCode"]) return;

      // ✅ CLEAN HSN CODE
      let rawCode = row["hsnCode"].toString();

      // remove newline / spaces / junk
      rawCode = rawCode.replace(/\n/g, " ").trim();

      // split multiple codes
      const codes = rawCode.split(/,|or/i);

      codes.forEach((codeRaw: string) => {
        let code = codeRaw.trim();

        // ✅ KEEP ONLY NUMERIC HSN
        code = code.replace(/[^0-9]/g, "");

        if (!code) return;

        // ✅ REMOVE DUPLICATES
        if (seen.has(code)) return;
        seen.add(code);

        const cgst =
          parseFloat(
            (row["CGST Rate (%)"] || "0").toString().replace("%", "")
          ) || 0;

        const sgst =
          parseFloat(
            (row["SGST/UTGST Rate (%)"] || "0")
              .toString()
              .replace("%", "")
          ) || 0;

        const igst =
          parseFloat(
            (row["IGST Rate (%)"] || "0").toString().replace("%", "")
          ) || 0;

        finalData.push({
          hsnCode: code,
          description: String(row["description"] || ""),
          cgstRate: cgst,
          sgstRate: sgst,
          igstRate: igst,
          category: "HSN",
          isActive: true,
        });
      });
    });

    if (finalData.length === 0) {
      return res.status(400).json({ error: "No valid data found" });
    }

    await prisma.hSN.createMany({
      data: finalData,
      skipDuplicates: true, // ✅ IMPORTANT
    });

    fs.unlinkSync(file.path);

    return res.json({
      message: "Imported Successfully",
      count: finalData.length,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      error: "Import failed",
      details: error.message,
    });
  }
};

// export const importHsn = async (req: Request, res: Response) => {
//     try {
//         const file = req.file;

//         if (!file || !file.path) {
//             return res.status(400).json({ error: "File missing" });
//         }

//         const workbook = XLSX.readFile(file.path);
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];

//         const rawData: any[] = XLSX.utils.sheet_to_json(sheet);

//         const finalData: {
//             hsnCode: string;
//             description: string;
//             gstRate: number;
//             category: string;
//             isActive: boolean;
//         }[] = [];

//         rawData.forEach((row: any) => {
//             const codes = (row["hsnCode"] || "").toString().split(',');

//             codes.forEach((codeRaw: string) => {
//                 const code = codeRaw.trim();
//                 if (!code) return;

//                 const igst =
//                     parseFloat(
//                         (row["IGST Rate (%)"] || "0")
//                             .toString()
//                             .replace('%', '')
//                     ) || 0;

//                 finalData.push({
//                     hsnCode: code,
//                     description: row["description"] || "",
//                     gstRate: igst,
//                     category: code.length > 4 ? "HSN" : "SAC",
//                     isActive: true
//                 });
//             });
//         });

//         await prisma.hSN.createMany({
//             data: finalData,
//             skipDuplicates: true
//         });

//         // delete temp file
//         fs.unlinkSync(file.path);

//         return res.json({
//             message: "Imported Successfully",
//             count: finalData.length
//         });

//     } catch (error) {
//         console.error("IMPORT ERROR:", error);
//         return res.status(500).json({ error: "Import failed" });
//     }
// };