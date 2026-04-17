# Feature Dependency Map — Tally Prime Parity (Brutally Honest)

> **Rating Scale:** Tally Prime Parity % = how close your implementation is to Tally Prime's **exact** behavior for that feature. 100% means a CA would see no difference between your software and Tally Prime for that feature.

---

## Tier 0 — Foundation

### 0.1 User Authentication — Tally Prime Parity: 30%

| What You Have | What Tally Prime Has | Gap |
|--------------|---------------------|-----|
| JWT login/register, role-based access | Multi-user concurrent access with session locking | No session locking |
| Basic roles (Owner, Accountant) | Granular permissions per voucher type, per report, per master (e.g., user X can create Payment vouchers but not Journal vouchers) | No granular permissions |
| — | Security levels (0-9) with hierarchical access | Not implemented |
| — | Tally.NET remote access with user authentication | Not applicable (web-first) |
| — | Activity log showing who is logged in and what they're doing | No real-time activity |
| — | Data access restriction by cost center, branch | Not implemented |

**What's missing to reach 100%:**
- Granular permissions engine (per voucher type, per report, per master CRUD)
- Maker-checker workflow (one user creates, another approves)
- Data-level access control (user can only see their branch's ledgers)
- Session management with concurrent access conflict resolution
- **Effort: 6-8 weeks**

---

### 0.2 Company Master — Tally Prime Parity: 25%

| What You Have | What Tally Prime Has | Gap |
|--------------|---------------------|-----|
| Create company with name, business type, GST/PAN/TAN | Same + much more configuration | Missing many fields |
| Basic address fields | Multiple addresses (registered, communication, factory) | Single address only |
| Enable GST / TDS / Inventory flags | Same + 20+ feature toggles (e.g., enable cost centers, bill-wise details, interest calculation, budgets, batch-wise, multi-godown, order processing) | Only 3 toggles vs 20+ |
| — | Company logo upload and management | Not implemented |
| — | Statutory compliance configuration (PF, ESI, PT registration numbers) | Not in Company master |
| — | Multi-currency base configuration | Only single base currency |
| — | Maintain field-based features (F11 - Company Features, F12 - Configuration) | No feature configuration screen |
| — | Security control settings | Not implemented |
| — | Alter/Shut company lifecycle | Only soft delete |

**What's missing to reach 100%:**
- Feature configuration system (Tally's F11/F12 equivalent — this controls which features are active)
- Multiple address management
- Company lifecycle management (create, alter, split, merge, shut)
- Logo and branding
- Complete statutory registration details in company
- **Effort: 4-5 weeks**

---

### 0.3 Financial Year — Tally Prime Parity: 15%

| What You Have | What Tally Prime Has | Gap |
|--------------|---------------------|-----|
| Create FY with start/end dates | Same | ✅ |
| Lock/unlock FY | Same but with OWNER-only restriction | ✅ Similar |
| Switch active FY | Same | ✅ |
| — | **Auto-create next FY** when books cross March 31 | Not implemented |
| — | **Carry-forward opening balances** from previous FY closing to new FY opening | ❌ NOT IMPLEMENTED — This is critical |
| — | **Year-end closing entries** (transfer P&L to Capital) | ❌ NOT IMPLEMENTED |
| — | **Split FY** (change financial year period mid-year) | Not implemented |
| — | Comparative reports across financial years | Not implemented |
| — | **Verify opening balances match previous year's closing** | Not implemented |
| — | Prevent voucher entry in locked FY (your lock doesn't actually enforce this in voucher.service.ts!) | ❌ BUG — Lock exists but isn't checked during voucher creation |

**What's missing to reach 100%:**
- Year-end closing process (the most critical missing piece)
- Auto carry-forward of closing balances to next year's opening
- Lock enforcement in voucher creation
- Comparative data across FYs
- **Effort: 4-6 weeks** (year-end closing alone is very complex)

---

## Tier 1A — Account Masters

### 1.1 Account Group Master — Tally Prime Parity: 35%

| What You Have | What Tally Prime Has | Gap |
|--------------|---------------------|-----|
| Create custom groups under parent | Same | ✅ |
| System groups seeded on company creation (28 groups) | Same 28 groups | ✅ |
| Hierarchical parent-child structure | Same | ✅ |
| Nature classification (Asset/Liability/Income/Expense/Equity) | Same | ✅ |
| `affectsGrossProfit` flag | Same | ✅ |
| Can't delete group with ledgers/children | Same | ✅ |
| — | **Group code auto-generation** | Not implemented |
| — | **Alter group nature** with cascade validation (can't change nature if ledgers have transactions) | No validation, you can break data |
| — | **Move group** from one parent to another with balance recalculation | Not implemented |
| — | **Group-level totals in reports** (Tally shows subtotals per group in every report) | Reports don't aggregate by group hierarchy |
| — | **Group display in ledger creation** showing full hierarchy path | Not implemented |
| — | **Group alias** (alternate name for display) | Not implemented |
| — | **Default behavior per group** (e.g., all ledgers under "Sundry Debtors" are auto-marked as party accounts, all under "Bank Accounts" auto-flagged as bank) | Not implemented — you manually flag each ledger |
| — | **Group configuration inheritance** (children inherit parent's nature, affectsGrossProfit, etc.) | Not enforced |

**What's missing to reach 100%:**
- Group-to-ledger behavior inheritance (this is huge — Tally auto-configures ledger behavior based on which group it's under)
- Group moving with validation
- Full hierarchy display in all screens
- **Effort: 3-4 weeks**

---

### 1.2 Ledger Master — Tally Prime Parity: 20%

| What You Have | What Tally Prime Has | Gap |
|--------------|---------------------|-----|
| CRUD operations | Same | ✅ |
| Opening balance with Debit/Credit type | Same | ✅ |
| Bank account fields (bank name, account number, IFSC) | Same | ✅ |
| Manual flags: isBankAccount, isCashAccount, isPartyAccount | Tally auto-derives this from the group hierarchy | Your approach is fragile — user can create a ledger under "Sundry Debtors" without marking isPartyAccount |
| GSTIN, PAN fields | Same | ✅ |
| TDS fields (tdsApplicable, tdsRate, tdsNatureOfPayment) | Same but Tally has much deeper TDS config | Basic |
| — | **Mailing details** (full address, PIN, state, country for party ledgers) | Partial (single address field) |
| — | **Maintain bill-by-bill** flag per ledger | ❌ Not implemented — this is essential for Receivables/Payables |
| — | **Maintain balances bill-by-bill** (track each invoice separately) | ❌ Not implemented |
| — | **Default credit period** (e.g., 30 days) | Not implemented |
| — | **Credit limit** per party | Not implemented |
| — | **Interest parameters** (rate, style, applicabilitiy) | Not implemented |
| — | **Cost center applicability** per ledger | Not implemented |
| — | **Multiple mailing details** per ledger | Not implemented |
| — | **Ledger alias** (alternate name) | Not implemented |
| — | **Currency for the ledger** (for multi-currency) | Not implemented |
| — | **Opening balance per FY** (you only store ONE opening balance, not year-wise in the Ledger model — you have a separate OpeningBalance table but it's unclear if reports use it) | Partially implemented, reports use `currentBalance` not `openingBalance` per FY |
| — | **Ledger closing balance** derived from Opening + Transactions in FY (not stored as `currentBalance`) | ❌ Your `currentBalance` is a running total across ALL years. Tally calculates per-FY |
| — | **Ledger display** shows running balance, group hierarchy, all configuration at a glance | Not implemented |

> [!CAUTION]
> **Critical Design Issue:** Your `currentBalance` on the Ledger model is a **running total updated on every voucher**. Tally doesn't store a running balance — it **calculates** the balance from transactions. Your approach has these problems:
> 1. If any voucher update/delete fails mid-transaction, `currentBalance` becomes permanently wrong
> 2. `currentBalance` doesn't respect financial year boundaries
> 3. You can't get "balance as on date X" — you only have the latest balance
> 4. Concurrent voucher creation can corrupt the balance (read-update-write race condition)
>
> **Tally's approach:** Opening Balance + sum(transactions in date range) = Closing Balance. Always calculated, never stored. This is slower but always correct.

**What's missing to reach 100%:**
- Bill-by-bill tracking (fundamental feature)
- Auto-derive ledger behavior from group
- Remove stored `currentBalance`, calculate from transactions
- Credit limit and credit period
- Interest parameters
- Per-FY opening balances properly used in reports
- **Effort: 8-10 weeks** (bill-by-bill alone is 6-8 weeks)

---

### 1.3 Opening Balances — Tally Prime Parity: 15%

| What You Have | What Tally Prime Has | Gap |
|--|--|--|
| Store opening balance per ledger per FY in separate table | Same structure | ✅ |
| — | **Opening balance screen** listing ALL ledgers with their opening balances, showing difference (must be zero) | Not implemented |
| — | **Verify opening balances tally** (total debit OB = total credit OB) | Not implemented |
| — | **Bill-wise opening balances** (for each party, list all pending bills with dates and amounts) | ❌ Not implemented |
| — | **Auto-create opening balances for new FY** from previous FY closing | ❌ Not implemented |
| — | **Stock opening balances** (quantity, rate, value per item per godown) | Not implemented |
| — | **Cost center opening balances** | Not implemented |

**What's missing to reach 100%:**
- This is closely tied to year-end closing
- Bill-wise opening balances
- Validation that OB tallies
- **Effort: 3-4 weeks**

---

## Tier 2 — Transaction Engine

### 2.1 Voucher Types — Tally Prime Parity: 30%

| What You Have | What Tally Prime Has | Gap |
|--|--|--|
| System types: Sales, Purchase, Payment, Receipt, Journal, Contra, Credit Note, Debit Note | Same default 8 types + more | ✅ |
| Auto-numbering with prefix/suffix | Same | ✅ |
| — | **Custom voucher types** created by user (e.g., "Petty Cash Payment" under Payment) | Not implemented |
| — | **Voucher classes** within each type (e.g., Sales type has "Sales-Local", "Sales-Interstate", "Sales-Export" classes) | ❌ Not implemented — **this is how Tally auto-fills tax ledgers** |
| — | **Numbering method configuration** (automatic, manual, semi-automatic) | Only automatic |
| — | **Restart numbering** per financial year, per month, per day | Not implemented |
| — | **Prevent duplicates** flag | Not implemented |
| — | **Use effective date** flag | Not implemented |
| — | **Print/email after save** flag | Not implemented |
| — | **Narration style** (per voucher type: required, optional, none) | Always optional |
| — | **Abbreviation/Alias** for voucher type | Not implemented |

**What's missing to reach 100%:**
- Voucher classes (critical for GST automation)
- Custom voucher types under parent types
- Numbering restart options
- **Effort: 4-5 weeks**

---

### 2.2 Voucher Entry (Core) — Tally Prime Parity: 20%

**This is your most important feature. Let me be brutal.**

| What You Have | What Tally Prime Has | Gap |
|--|--|--|
| Create voucher with multiple debit/credit entries in a transaction | Same | ✅ |
| Validates Total Debit = Total Credit (with 0.01 tolerance) | Same but **zero tolerance** (exact match) | ⚠️ Your 0.01 tolerance is a bug. In production, this means you accept vouchers that are off by 1 paisa. Over 10,000 vouchers that's ₹100 of unexplained difference |
| Auto-generate voucher number | Same | ✅ (but has race condition) |
| Resolves FY from voucher date | Same | ✅ |
| Updates `currentBalance` on ledger | Tally doesn't store running balance | ⚠️ Different design — yours is fragile |
| Audit log on create | Same | ✅ |
| — | **Voucher date validation** (must be within FY, must not be in locked period) | ❌ You don't check if FY is locked! |
| — | **Ledger group restriction** per voucher type (Payment: only debit from expense/party, only credit from cash/bank) | ❌ User can create nonsensical vouchers (e.g., Payment voucher crediting an expense ledger) |
| — | **Narration auto-suggest** from previous similar vouchers | Not implemented |
| — | **Reference number uniqueness** per party | Not implemented |
| — | **Bill-wise details** per entry (allocate against specific bills) | ❌ Not implemented |
| — | **Cost center allocation** per entry | ❌ Not implemented |
| — | **Inventory allocation** per entry (item, qty, rate, amount) | ❌ Not implemented |
| — | **GST details** auto-fill (HSN, tax rate, CGST/SGST/IGST ledger entries) | ❌ Not implemented |
| — | **Batch allocation** per item | Not implemented |
| — | **Godown allocation** per item | Not implemented |
| — | **Order reference** (link to purchase/sales order) | Not implemented |
| — | **Interest calculation trigger** on outstanding detection | Not implemented |
| — | **Multi-currency entry** with exchange rate | Not implemented |
| — | **Post-dated voucher handling** | Not implemented |
| — | **Optional/Memo voucher** (doesn't affect books) | Not implemented |

> [!WARNING]
> **Code-Level Issues Found:**
> 1. **Line 42:** `Math.abs(totalDebit - totalCredit) > 0.01` — This is floating-point comparison with tolerance. Should be exact comparison using `Decimal.js`. This means your system accepts vouchers that don't balance.
> 2. **Line 34-36:** `reduce((sum: number, e: any) => sum + Number(e.amount), 0)` — Pure JavaScript `number` addition. Will produce floating-point errors with amounts like `33.33 + 33.33 + 33.34 = 100.00000000000001`.
> 3. **Line 64:** `getNextVoucherSequenceModel` — Read-then-increment race condition. Two simultaneous requests can get the same number.
> 4. **No FY lock check** — Nowhere in `createVoucherService` do you check `financialYear.isLocked`.
> 5. **Line 93:** `Number(ledger.currentBalance)` — Converting `Decimal` to JavaScript `number` loses precision for amounts > 2^53.
> 6. **Line 207:** Duplicate `return voucher;` — dead code.

**What's missing to reach 100%:**
- Fix all code-level issues above
- Bill-wise allocation
- Cost center allocation
- Inventory item allocation
- GST auto-calculation
- Voucher type-specific ledger restrictions
- FY lock enforcement
- Multi-currency
- **Effort: 12-16 weeks** (this one feature is essentially the entire remaining engine)

---

### 2.3 Voucher Edit — Tally Prime Parity: 15%

| What You Have | What Tally Prime Has | Gap |
|--|--|--|
| Reverse old balance → delete old entries → create new entries → apply new balance | Tally maintains complete edit history | ✅ Basic approach works |
| — | **Edit history** (who changed what, when, with before/after values per field) | Only basic "Updated voucher X" log |
| — | **Restrict editing posted vouchers** (configurable — some companies don't allow) | You allow editing posted vouchers freely |
| — | **Re-numbering consideration** (what happens to voucher number on date change?) | Not handled — number stays same even if date changes |
| — | **Cascade update** (if bill-wise details change, outstanding reports update) | N/A — no bill-wise |
| — | **Confirmation prompt** showing impact of change | Not implemented |

**What's missing to reach 100%:**
- Field-level audit trail
- Edit restrictions based on company policy
- Voucher renumbering on date change
- **Effort: 3-4 weeks**

---

### 2.4 Voucher Delete — Tally Prime Parity: 20%

| What You Have | What Tally Prime Has | Gap |
|--|--|--|
| Reverses balances then cascade deletes | Same mechanism | ✅ |
| Audit log | Same | ✅ |
| — | **Soft delete option** (mark as cancelled, don't remove from numbering) | Hard delete only — this leaves a gap in voucher numbers which is suspicious for auditors |
| — | **Delete restriction** for locked FY | Not enforced |
| — | **Delete restriction** based on reconciliation status | Not implemented — you can delete a reconciled bank entry |
| — | **Impact analysis** before delete (show which reports/balances are affected) | Not implemented |

**What's missing to reach 100%:**
- Soft delete / cancellation instead of hard delete
- Delete restrictions (locked FY, reconciled, bill references)
- **Effort: 2-3 weeks**

---

## Tier 3 — Reports

### 3.1 Trial Balance — Tally Prime Parity: 15%

| What You Have | What Tally Prime Has | Gap |
|--|--|--|
| All ledgers grouped by nature, showing debit/credit totals | Same basic structure | ✅ |
| Grand totals with balanced check | Same | ✅ |
| — | **Opening, Transaction, Closing columns** (Tally shows: Opening Balance + Period Transactions = Closing Balance) | You only show current balance — no breakdown |
| — | **Group hierarchy display** (indented groups with subtotals) | Flat list, no hierarchy |
| — | **Date range filtering** (Trial Balance as on specific date) | No date range — shows all-time cumulative |
| — | **Multi-column** (compare 2+ periods side by side) | Not implemented |
| — | **Drill-down** from group total → ledger list → ledger details → voucher | Not implemented |
| — | **Zero-balance ledger hiding** | Not implemented |
| — | **Negative balance highlighting** | Not implemented |
| — | **Print/Export** in standard format | Not implemented |

> [!CAUTION]
> **Critical:** Your Trial Balance reads `ledger.currentBalance` which is a running total from day one — **not** the balance for a specific financial year. If a company has been running for 2 years, your Trial Balance shows the cumulative balance across both years, which is **wrong**. A Trial Balance must be for a specific financial year period.

**What's missing to reach 100%:**
- Date-range aware calculation from transactions
- Group hierarchy with subtotals
- Opening/Transaction/Closing columns
- Drill-down capability
- **Effort: 4-5 weeks**

---

### 3.2 Profit & Loss — Tally Prime Parity: 12%

| What You Have | What Tally Prime Has | Gap |
|--|--|--|
| Income vs Expense grouped by affectsGrossProfit | Same basic structure | ✅ |
| Gross Profit and Net Profit calculation | Same | ✅ |
| — | Your P&L reads `ledger.currentBalance`, **not** transactions within the FY | Tally sums voucher entries within the period | ❌ Your P&L includes balances from ALL years, not just current FY |
| — | **Manufacturing Account / Trading Account** section | Not implemented |
| — | **Schedule VI / Schedule III format** | Not implemented (Balance Sheet has it, P&L doesn't) |
| — | **Comparative period** (this year vs last year) | Not implemented |
| — | **Percentage analysis** (each line as % of revenue) | Not implemented |
| — | **Group-wise breakdown** with subtotals | Flat list |
| — | **Opening/Closing stock** integration | Not implemented |
| — | **Drill-down** from P&L line → ledger details → vouchers | Not implemented |

**What's missing to reach 100%:**
- Calculate from transactions in date range, NOT from stored balances
- Manufacturing/Trading account separation
- Comparative periods
- Percentage analysis
- **Effort: 4-5 weeks**

---

### 3.3 Balance Sheet — Tally Prime Parity: 20%

| What You Have | What Tally Prime Has | Gap |
|--|--|--|
| Schedule III format with proper sections | Same | ✅ Good structure |
| Categorization by group name patterns | Tally uses the group hierarchy deterministically | ⚠️ Your `.includes("sundry creditor")` approach breaks if user names group differently |
| Net Profit feeds into Reserves & Surplus | Same | ✅ |
| Total Assets = Total Equity + Liabilities check | Same | ✅ |
| — | Same problem: reads `currentBalance` not FY-specific | See Trial Balance issue | ❌ |
| — | **Previous year comparison** column | Structure exists but data is all zeros |
| — | **Notes to accounts** detail | Not implemented |
| — | **Fixed asset depreciation schedule** | Not implemented |
| — | **Drill-down** to notes → ledger details → vouchers | Not implemented |

**What's missing to reach 100%:**
- Fix the balance calculation approach
- Comparative previous year data
- Deterministic categorization from group hierarchy (not string matching)
- Notes to accounts
- **Effort: 4-5 weeks**

---

### 3.4 Ledger Statement — Tally Prime Parity: 30%

This is your best report.

| What You Have | What Tally Prime Has | Gap |
|--|--|--|
| Transactions with running balance | Same | ✅ |
| Shows opposing ledger as "Particulars" | Same | ✅ |
| Date range filter | Same | ✅ |
| Opening and closing balance | Same | ✅ |
| Bank reconciliation fields | Good addition | ✅ |
| — | **Bill-wise breakup** per transaction | Not implemented |
| — | **Cost center breakup** per transaction | Not implemented |
| — | **Cheque-wise view** for bank ledgers | Not implemented |
| — | **Monthly/Quarterly summary** view | Not implemented |
| — | **Drill-down** to voucher on click | Need frontend |
| — | **Columnar view** (separate column per voucher type) | Not implemented |
| — | **Interest calculation** display | Not implemented |

**What's missing to reach 100%:**
- Bill-wise and cost center breakups
- Monthly/quarterly summary
- Columnar view
- **Effort: 3-4 weeks**

---

### 3.5 Day Book — Tally Prime Parity: 25%

| What You Have | What Tally Prime Has | Gap |
|--|--|--|
| All vouchers for a date with entries | Same | ✅ |
| Daily total debit/credit | Same | ✅ |
| — | **Date range** (not just single date) | Single date only |
| — | **Filter by voucher type** | Not implemented |
| — | **Filter by amount range** | Not implemented |
| — | **Search in narration** | Not implemented |
| — | **Monthly summary** option | Not implemented |

**What's missing to reach 100%:**
- Date range support
- Filters
- **Effort: 1-2 weeks**

---

### 3.6 Bank Reconciliation — Tally Prime Parity: 25%

| What You Have | What Tally Prime Has | Gap |
|--|--|--|
| Mark entry as reconciled with bank date | Same | ✅ |
| Bulk reconciliation | Same | ✅ |
| Summary (book balance vs bank balance) | Same | ✅ |
| Adjustment entries | Same | ✅ |
| — | **Auto-reconciliation** from bank statement import (CSV/OFX) | Not implemented |
| — | **Reconciliation date range** filtering | Not implemented |
| — | **Reconciliation report** (list of unreconciled items with age) | Basic only |
| — | **BRS (Bank Reconciliation Statement)** in printable format | Not implemented |
| — | **Cheque printing** | Not implemented |
| — | **Post-dated cheque tracking** | Not implemented |

**What's missing to reach 100%:**
- Bank statement import and auto-matching
- Printable BRS
- **Effort: 4-5 weeks**

---

## The Grand Parity Summary

| Feature | Your Tally Prime Parity | What "Done" Actually Means |
|---------|------------------------|---------------------------|
| Authentication | **30%** | Login works, but no granular permissions |
| Company Master | **25%** | Create company works, but missing 20+ configuration options |
| Financial Year | **15%** | Create/switch works, but NO year-end closing, NO balance carry-forward |
| Account Groups | **35%** | CRUD works, good hierarchy, but no behavior inheritance to ledgers |
| Ledger Master | **20%** | CRUD works, but `currentBalance` approach is fundamentally different from Tally's and fragile |
| Opening Balances | **15%** | Table exists, but not used correctly in reports, no bill-wise OB |
| Voucher Types | **30%** | System types work, but no voucher classes (critical for GST) |
| Voucher Entry | **20%** | Double-entry works, but has race condition, floating-point bugs, no FY lock check, no bill-wise, no GST, no cost center |
| Voucher Edit | **15%** | Works but no field-level audit, no edit restrictions |
| Voucher Delete | **20%** | Works but hard delete (leaves number gaps), no restrictions |
| Trial Balance | **15%** | Shows balances but not FY-specific, no hierarchy, no date-range |
| Profit & Loss | **12%** | Basic but reads all-time balance, not FY-specific transactions |
| Balance Sheet | **20%** | Good Schedule III structure, but string-matching categorization, not FY-specific |
| Ledger Statement | **30%** | Best report — running balance works, but no bill-wise/cost center |
| Day Book | **25%** | Works for single date, needs range and filters |
| Bank Reconciliation | **25%** | Manual reconciliation works, no auto-matching |
| **Inventory Masters** | **5%** | Schema + basic CRUD in progress |
| **GST** | **0%** | Nothing implemented |
| **TDS** | **0%** | Schema fields exist, nothing functional |
| **Bill-wise Tracking** | **0%** | Not implemented |
| **Cost Centers** | **0%** | Not implemented |
| **Multi-Currency** | **0%** | Not implemented |
| **Year-End Closing** | **0%** | Not implemented |
| **Payroll** | **3%** | Schema exists, no service logic |
| **Order Processing** | **0%** | Not implemented |
| **Stock Valuation** | **0%** | Not implemented |
| **Advanced Reports** | **0%** | Not implemented |

### Weighted Overall Tally Prime Parity: **~8-10%**

(Previous estimate of 12-15% was generous because it was measuring "have you built this feature at all" — now measuring "is this feature at Tally Prime quality")

---

## Updated Dependency Map (All at Tally Prime Parity Level)

### Tier 0 — Foundation (Must be fixed/hardened first)

```
0.1 Auth & Permissions ──────────────────────── 30% → 100% (6-8 weeks)
0.2 Company Master + Feature Toggles ────────── 25% → 100% (4-5 weeks)
0.3 Financial Year + Year-End Closing ───────── 15% → 100% (4-6 weeks)
```

### Tier 1A — Account Masters

```
0.2 Company ──→ 1.1 Account Groups (35% → 100%: 3-4 weeks)
                     │
                     ├──→ 1.2 Ledger Master (20% → 100%: 8-10 weeks)
                     │         │
                     │         ├──→ 1.3 Opening Balances (15% → 100%: 3-4 weeks)
                     │         │
                     │         └──→ Bill-wise configuration (0% → 100%: 6-8 weeks)
                     │
                     └──→ Group behavior inheritance (NEW: 2-3 weeks)
```

### Tier 1B — Inventory Masters

```
0.2 Company ──→ 1.6 Units (5% → 100%: 2-3 weeks)
              ──→ 1.7 Stock Groups (5% → 100%: 2-3 weeks)
              ──→ 1.8 Stock Categories (0% → 100%: 1-2 weeks)
              ──→ 1.9 Godowns (0% → 100%: 2-3 weeks)
                     │
                     └──→ 1.10 Stock Items (5% → 100%: 3-4 weeks)
                               DEPENDS ON: Units, Stock Groups, Stock Categories
```

### Tier 2 — Transaction Engine

```
1.1 Groups + 1.2 Ledgers + 0.3 FY
              │
              ├──→ 2.1 Voucher Types (30% → 100%: 4-5 weeks)
              │         │
              │         └──→ 2.1a Voucher Classes (0% → 100%: 3-4 weeks)
              │                    DEPENDS ON: Voucher Types
              │
              └──→ 2.2 Voucher Entry Core (20% → 100%: 12-16 weeks)
                        │    DEPENDS ON: Ledgers, Voucher Types, FY, Numbering
                        │
                        ├──→ 2.2a Bill-wise Allocation (0% → 100%: 6-8 weeks)
                        │         DEPENDS ON: Ledger bill-wise config
                        │
                        ├──→ 2.2b Cost Center Allocation (0% → 100%: 4-5 weeks)
                        │         DEPENDS ON: Cost Center Master
                        │
                        ├──→ 2.2c Inventory Allocation (0% → 100%: 6-8 weeks)
                        │         DEPENDS ON: Stock Items, Godowns
                        │
                        ├──→ 2.2d GST Auto-calc (0% → 100%: 4-6 weeks)
                        │         DEPENDS ON: Voucher Classes, HSN Master, Tax Ledgers
                        │
                        ├──→ 2.2e Multi-currency (0% → 100%: 3-4 weeks)
                        │         DEPENDS ON: Currency Master, Exchange Rates
                        │
                        ├──→ 2.3 Voucher Edit (15% → 100%: 3-4 weeks)
                        │
                        └──→ 2.4 Voucher Delete (20% → 100%: 2-3 weeks)
```

### Tier 3 — Reports (All depend on correct Voucher data)

```
2.2 Voucher Entry
        │
        ├──→ 3.1 Day Book (25% → 100%: 1-2 weeks)
        │
        ├──→ 3.2 Ledger Statement (30% → 100%: 3-4 weeks)
        │         │
        │         └──→ Bill-wise view (0%: DEPENDS ON Bill-wise allocation)
        │
        ├──→ 3.3 Trial Balance (15% → 100%: 4-5 weeks)
        │         │
        │         ├──→ 3.4 Profit & Loss (12% → 100%: 4-5 weeks)
        │         │         │
        │         │         └──→ 3.5 Balance Sheet (20% → 100%: 4-5 weeks)
        │         │                   │
        │         │                   ├──→ Cash Flow Statement (0%: 3-4 weeks)
        │         │                   ├──→ Fund Flow Statement (0%: 2-3 weeks)
        │         │                   └──→ Ratio Analysis (0%: 2-3 weeks)
        │         │
        │         └──→ Comparative Statements (0%: 2-3 weeks)
        │
        ├──→ 3.6 Bank Reconciliation (25% → 100%: 4-5 weeks)
        │
        ├──→ Outstanding / Aging Reports (0%: 3-4 weeks)
        │         DEPENDS ON: Bill-wise tracking
        │
        └──→ Sales / Purchase Register (0%: 2-3 weeks)
```

### Tier 4+ — Compliance & Advanced

```
GST Engine (0% → 100%)
├──→ 7.1-7.5 GST Foundation (4-5 weeks)
│         DEPENDS ON: Company, Ledgers, HSN Master
├──→ 7.6-7.10 Auto-calc (4-6 weeks)
│         DEPENDS ON: GST Foundation, Voucher Classes
└──→ 7.11-7.18 Returns & Compliance (12-16 weeks)
          DEPENDS ON: Auto-calc, complete transaction data

TDS Engine (0% → 100%)
├──→ 10.1-10.2 TDS Setup (2-3 weeks)
│         DEPENDS ON: Ledgers, Company
├──→ 10.3-10.5 Auto-calc (4-5 weeks)
│         DEPENDS ON: TDS Setup, Voucher Entry
└──→ 10.6-10.8 Returns (8-10 weeks)
          DEPENDS ON: Auto-calc, Challan management

Payroll (3% → 100%)
├──→ Employee + Groups + Pay Heads (4-5 weeks)
│         DEPENDS ON: Company, Ledgers
├──→ Salary Structure + Attendance (3-4 weeks)
│         DEPENDS ON: Employees, Pay Heads
├──→ Salary Processing (4-5 weeks)
│         DEPENDS ON: Structure, Attendance, Voucher Engine
└──→ Statutory (PF/ESI/PT) (4-5 weeks)
          DEPENDS ON: Salary Processing
```

---

## What To Build First (Corrected Honest Priority)

### 🔴 IMMEDIATELY (Before adding any new features)

These are **bugs and design flaws** that will corrupt data:

| Issue | Risk | Fix |
|-------|------|-----|
| Race condition in voucher numbering | Duplicate voucher numbers | Use PostgreSQL `SEQUENCE` |
| `Math.abs(totalDebit - totalCredit) > 0.01` tolerance | Accepts unbalanced vouchers | Use `Decimal.js`, exact comparison |
| `Number(e.amount)` everywhere | Floating-point precision loss | Use `Decimal.js` for all calculations |
| No FY lock check in voucher creation | Users can book entries in locked years | Add check in `createVoucherService` |
| `currentBalance` design | Balance gets corrupted, not FY-specific | Either add repair mechanism OR redesign to calculate-on-read |
| Hard delete leaving number gaps | Audit red flag | Switch to soft delete / cancellation |

### 📊 PHASE 1: Make Existing Features Tally-Grade (2-3 months)

Fix the core before building more. Order:

1. **Data integrity fixes** (above) — 2 weeks
2. **Trial Balance** — make FY-aware, calculate from transactions — 2 weeks
3. **P&L** — calculate from transactions in date range — 1 week
4. **Balance Sheet** — use deterministic group hierarchy, not string matching — 1 week
5. **FY Lock enforcement** — 1 week
6. **Voucher type-specific ledger restrictions** — 2 weeks
7. **Field-level audit trail** — 2 weeks

### 📊 PHASE 2: Critical Missing Features (3-5 months)

1. **Bill-wise tracking** (Receivables/Payables) — 6-8 weeks
2. **Year-end closing + balance carry-forward** — 4-6 weeks
3. **GST Foundation + Auto-calc** — 8-10 weeks

### 📊 PHASE 3: Full Feature Parity (6-12+ months)

1. Voucher classes
2. Cost centers
3. Inventory transactions + valuation
4. GST returns
5. TDS
6. Advanced reports
7. Multi-currency
8. Order processing
9. Payroll

---

## Total Effort to Reach 100% Tally Prime Parity

| Component | Current Parity | Effort to 100% |
|-----------|---------------|-----------------|
| Foundation (Auth, Company, FY) | ~25% | 14-19 weeks |
| Account Masters | ~25% | 16-21 weeks |
| Transaction Engine | ~18% | 28-36 weeks |
| Basic Reports | ~20% | 18-24 weeks |
| Inventory | ~5% | 20-28 weeks |
| GST | 0% | 24-32 weeks |
| TDS | 0% | 14-18 weeks |
| Payroll | 3% | 15-19 weeks |
| Advanced Reports | 0% | 12-16 weeks |
| Cost Centers + Multi-Currency | 0% | 10-14 weeks |
| **Total** | **~8-10%** | **171-227 weeks (3.3-4.4 years) for 1 developer** |

> [!IMPORTANT]
> The previous estimate of 23-33 months was for a "functional subset." This 3.3-4.4 years is for **exact** Tally Prime feature parity — which is what you asked for. With a team of 3 developers, that's still 1.1-1.5 years assuming perfect coordination.
