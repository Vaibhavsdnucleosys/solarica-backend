
export const TallyXML = {
    // 1. Build Ledger XML
    buildLedger: (data: { name: string; group?: string; gstin?: string, openingBalance?: number }) => {
        return `
<ENVELOPE>
    <HEADER>
        <TALLYREQUEST>Import Data</TALLYREQUEST>
    </HEADER>
    <BODY>
        <IMPORTDATA>
            <REQUESTDESC>
                <REPORTNAME>All Masters</REPORTNAME>
            </REQUESTDESC>
            <REQUESTDATA>
                <TALLYMESSAGE xmlns:UDF="TallyUDF">
                    <LEDGER NAME="${data.name}" ACTION="Create">
                        <NAME.LIST>
                            <NAME>${data.name}</NAME>
                        </NAME.LIST>
                        <PARENT>${data.group || "Sundry Debtors"}</PARENT>
                        <OPENINGBALANCE>${data.openingBalance || 0}</OPENINGBALANCE>
                        <ISBILLWISEON>Yes</ISBILLWISEON>
                        ${data.gstin ? `<PARTYGSTIN>${data.gstin}</PARTYGSTIN>` : ''}
                    </LEDGER>
                </TALLYMESSAGE>
            </REQUESTDATA>
        </IMPORTDATA>
    </BODY>
</ENVELOPE>`;
    },

    // 2. Build Sales Voucher XML
    buildSalesVoucher: (data: { invoiceNo: string; date: string; partyName: string; amount: number; salesLedger?: string }) => {
        // Simple Sales Voucher with no inventory items, just ledger posting
        return `
<ENVELOPE>
    <HEADER>
        <TALLYREQUEST>Import Data</TALLYREQUEST>
    </HEADER>
    <BODY>
        <IMPORTDATA>
            <REQUESTDESC>
                <REPORTNAME>Vouchers</REPORTNAME>
            </REQUESTDESC>
            <REQUESTDATA>
                <TALLYMESSAGE xmlns:UDF="TallyUDF">
                    <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Accounting Voucher View">
                        <DATE>${data.date.replace(/-/g, '')}</DATE>
                        <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
                        <VOUCHERNUMBER>${data.invoiceNo}</VOUCHERNUMBER>
                        <PARTYLEDGERNAME>${data.partyName}</PARTYLEDGERNAME>
                        <Reference>${data.invoiceNo}</Reference>
                        <FBTPAYMENTTYPE>Default</FBTPAYMENTTYPE>
                        <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
                        
                        <!-- Party Debit -->
                        <ALLLEDGERENTRIES.LIST>
                            <LEDGERNAME>${data.partyName}</LEDGERNAME>
                            <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
                            <AMOUNT>-${data.amount}</AMOUNT> <!-- Debit is Negative in Tally XML -->
                        </ALLLEDGERENTRIES.LIST>

                        <!-- Sales Credit -->
                        <ALLLEDGERENTRIES.LIST>
                            <LEDGERNAME>${data.salesLedger || "Sales Account"}</LEDGERNAME>
                            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                            <AMOUNT>${data.amount}</AMOUNT> <!-- Credit is Positive -->
                        </ALLLEDGERENTRIES.LIST>
                    </VOUCHER>
                </TALLYMESSAGE>
            </REQUESTDATA>
        </IMPORTDATA>
    </BODY>
</ENVELOPE>`;
    },

    // 3. Request Trial Balance Data (for simple stats)
    buildGetStats: () => {
        return `
<ENVELOPE>
    <HEADER>
        <TALLYREQUEST>Export Data</TALLYREQUEST>
    </HEADER>
    <BODY>
        <EXPORTDATA>
            <REQUESTDESC>
                <REPORTNAME>Statistics</REPORTNAME>
                <STATICVARIABLES>
                    <SVEXPORTFORMAT>SysName:XML</SVEXPORTFORMAT>
                </STATICVARIABLES>
            </REQUESTDESC>
        </EXPORTDATA>
    </BODY>
</ENVELOPE>`;
    },

    // 4. Request Financial Summaries (Trial Balance)
    buildFinancials: () => {
        return `
<ENVELOPE>
    <HEADER>
        <TALLYREQUEST>Export Data</TALLYREQUEST>
    </HEADER>
    <BODY>
        <EXPORTDATA>
            <REQUESTDESC>
                <REPORTNAME>Trial Balance</REPORTNAME>
                <STATICVARIABLES>
                    <SVEXPORTFORMAT>SysName:XML</SVEXPORTFORMAT>
                </STATICVARIABLES>
            </REQUESTDESC>
        </EXPORTDATA>
    </BODY>
</ENVELOPE>`;
    }
};

