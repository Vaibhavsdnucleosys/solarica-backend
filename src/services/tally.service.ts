import axios from 'axios';
import { TallyXML } from '../utils/tally-xml';



const TALLY_URL = 'http://localhost:9000';

// Helper to parse simple XML response (regex for simplicity to avoid huge xml2js dependency for now)
const parseTallyResponse = (responseXml: string) => {
    // Check for errors
    if (responseXml.includes("<STATUS>0</STATUS>")) {
        return { success: false, message: "Tally Unknown Error", raw: responseXml };
    }

    // Created
    if (responseXml.includes("<CREATED>1</CREATED>")) {
        return { success: true, message: "Created Successfully", raw: responseXml };
    }

    // Updated
    if (responseXml.includes("<ALTERED>1</ALTERED>")) {
        return { success: true, message: "Updated Successfully", raw: responseXml };
    }

    // Errors
    if (responseXml.includes("<LINEERROR>")) {
        // Extract error message
        const match = responseXml.match(/<LINEERROR>(.*?)<\/LINEERROR>/);
        return { success: false, message: match ? match[1] : "Tally Error", raw: responseXml };
    }

    return { success: true, message: "Request Processed (Check Raw)", raw: responseXml };
};

export const TallyService = {

    // Check Connection
    checkConnection: async () => {
        try {
            await axios.get(TALLY_URL, { timeout: 2000 });
            return true;
        } catch (error) {
            return false;
        }
    },

    // Create Party (Ledger)
    createParty: async (data: { name: string; group?: string; gstin?: string; openingBalance?: number }) => {
        try {
            const xml = TallyXML.buildLedger(data);
            const response = await axios.post(TALLY_URL, xml, {
                headers: { 'Content-Type': 'text/xml' }
            });
            return parseTallyResponse(response.data);
        } catch (error: any) {
            console.error("Tally Post Error:", error.message);
            return { success: false, message: "Failed to connect to Tally. Is it running on port 9000?", error: error.message };
        }
    },

    // Create Invoice (Sales Voucher)
    createInvoice: async (data: { invoiceNo: string; date: string; partyName: string; amount: number; salesLedger?: string }) => {
        try {
            const xml = TallyXML.buildSalesVoucher(data);
            const response = await axios.post(TALLY_URL, xml, {
                headers: { 'Content-Type': 'text/xml' }
            });
            return parseTallyResponse(response.data);
        } catch (error: any) {
            console.error("Tally Post Error:", error.message);
            return { success: false, message: "Failed to connect to Tally.", error: error.message };
        }
    },

    // Get Stats & Financials
    getStats: async () => {
        try {
            // Request 1: Statistics (Counts)
            const xml = TallyXML.buildGetStats();
            const response = await axios.post(TALLY_URL, xml, { headers: { 'Content-Type': 'text/xml' } });
            const logData = typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2);

            // DEBUG LOGGING
            const fs = require('fs');
            fs.writeFileSync('tally_debug_log.txt', `XML SENT:\n${xml}\n\nRESPONSE:\n${logData}`);

            // Regex Parsing based on actual Tally XML structure
            const extractCount = (name: string) => {
                const regex = new RegExp(`<STATNAME>${name}<\\/STATNAME>\\s*<STATVALUE>\\s*<STATDIRECT>(\\d+)<\\/STATDIRECT>`, 'i');
                const match = logData.match(regex);
                return match ? parseInt(match[1]) : 0;
            };

            const ledgersCount = extractCount('Ledgers');

            // Calculate Total Vouchers
            const voucherTypes = [
                'Sales', 'Purchase', 'Payment', 'Receipt', 'Contra', 'Journal',
                'Credit Note', 'Debit Note', 'Delivery Note', 'Receipt Note',
                'Material In', 'Material Out', 'Memorandum', 'Reversing Journal',
                'Stock Journal', 'Physical Stock', 'Payroll', 'Attendance'
            ];

            let vouchersCount = 0;
            voucherTypes.forEach(type => {
                vouchersCount += extractCount(type);
            });

            // Request 2: Financials (Trial Balance) for Sales & Receivables
            let totalSales = 0;
            let totalReceivables = 0;

            try {
                const xmlFinancial = TallyXML.buildFinancials();
                const responseFinancial = await axios.post(TALLY_URL, xmlFinancial, { headers: { 'Content-Type': 'text/xml' } });
                const finData = typeof responseFinancial.data === 'string' ? responseFinancial.data : JSON.stringify(responseFinancial.data);

                fs.writeFileSync('tally_financial_debug.txt', `XML SENT:\n${xmlFinancial}\n\nRESPONSE:\n${finData}`);

                // Simple Regex to capture Amount
                // Sales Accounts -> Closing Credit (DSPCLCRAMTA)
                // Sundry Debtors -> Closing Debit (DSPCLDRAMTA)

                // Matches <DSPDISPNAME>Sales Accounts</DSPDISPNAME> ... <DSPCLCRAMTA>12000.00</DSPCLCRAMTA>
                // We assume the amount appears AFTER the name within a reasonable distance or same block

                const extractAmount = (name: string, tag: 'DSPCLCRAMTA' | 'DSPCLDRAMTA') => {
                    // Escape special chars in name? Not needed for simple names
                    // Look for Name, then capture first occurrence of tag
                    // Note: This is fragile if multiple accounts have similar names, but Trial Balance Group Summary usually returns one entry per Group
                    const regex = new RegExp(`<DSPDISPNAME>${name}<\\/DSPDISPNAME>.*?<${tag}>(.*?)<\\/${tag}>`, 's');
                    const match = finData.match(regex);
                    return match ? parseFloat(match[1]) : 0;
                };

                totalSales = extractAmount('Sales Accounts', 'DSPCLCRAMTA');
                totalReceivables = extractAmount('Sundry Debtors', 'DSPCLDRAMTA');
            } catch (err) {
                console.error("Financial fetch error:", err);
            }


            return {
                success: true,
                data: {
                    connected: true,
                    dataLength: logData.length,
                    responseLength: response.data?.length || 0,
                    ledgersCount: ledgersCount,
                    vouchersCount: vouchersCount,
                    totalSales: totalSales,
                    totalReceivables: totalReceivables,
                    message: "Data fetched from Tally"
                }
            };
        } catch (error: any) {
            const fs = require('fs');
            fs.writeFileSync('tally_debug_error.txt', error.toString());
            return { success: false, message: "Failed to fetch stats from Tally", error: error.message };
        }
    }
};

