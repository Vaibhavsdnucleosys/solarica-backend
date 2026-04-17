# Godown Module — Complete Implementation Plan

> **Goal:** Build an exact Tally Prime-like Godown (Warehouse/Location) system that tracks stock across multiple physical locations, supports inter-godown transfers, and provides godown-wise stock reports.
>
> **Date:** February 2026  
> **Depends On:** Unit ✅, Stock Group ✅, Stock Item ✅ (all completed)

---

## What Is a Godown in Tally Prime?

In Tally Prime, a **Godown** (also called Warehouse or Location) represents a **physical storage location** where stock is kept. Key behaviors:

1. **Hierarchical** — Godowns can have sub-godowns (e.g., "Mumbai Warehouse" → "Rack A", "Rack B")
2. **Default Godown** — Every company has a default godown called "Main Location"
3. **Stock is tracked per Godown** — When you buy 100 panels, they go into a specific godown
4. **Transfers** — Stock can be moved between godowns via Stock Journal / Transfer voucher
5. **Reports** — Stock Summary can be filtered by godown to see what's stored where

### How Tally Prime Users Interact With Godowns

```
Gateway of Tally → Create → Godown
┌──────────────────────────────────────┐
│  Godown Creation                     │
│                                      │
│  Name        : [Mumbai Warehouse   ] │
│  Alias       : [MW                 ] │
│  Under       : [Main Location    ▼ ] │  ← Sidebar selection (hierarchy)
│  Address     : [Plot 5, MIDC...    ] │
│  Contact     : [9876543210         ] │
│                                      │
│  Accept? Yes / No                    │
└──────────────────────────────────────┘
```

During **Stock Item creation**, user selects which godown holds the opening stock:
```
Opening Balance:
  Godown    : [Mumbai Warehouse ▼]
  Quantity  : 100
  Rate      : 4500
  Value     : 4,50,000
```

During **Purchase/Sales voucher entry**, user specifies godown per line item:
```
Item: Solar Panel 450W
  Godown  : [Mumbai Warehouse ▼]
  Qty     : 50
  Rate    : 4500
  Amount  : 2,25,000
```

---

## Phase 1: Database Schema

### 1.1 New Model: `Godown`

```prisma
model Godown {
  id          String    @id @default(dbgenerated("(gen_random_uuid())::text"))
  companyId   String
  name        String
  alias       String?
  underId     String?          // Self-relation: Parent Godown
  address     String?
  contactName String?
  contactPhone String?
  isDefault   Boolean   @default(false)  // "Main Location" flag
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @default(now())
  createdBy   String?
  updatedBy   String?

  // Relations
  Company         Company          @relation(fields: [companyId], references: [id], onDelete: Cascade)
  parent          Godown?          @relation("GodownToGodown", fields: [underId], references: [id])
  children        Godown[]         @relation("GodownToGodown")
  stockBalances   GodownStock[]

  @@unique([companyId, name])
  @@index([companyId])
  @@index([underId])
}
```

### 1.2 New Model: `GodownStock` (Stock Balance Per Godown Per Item)

This is the **core tracking table**. It answers: *"How much of Item X is in Godown Y?"*

```prisma
model GodownStock {
  id          String    @id @default(dbgenerated("(gen_random_uuid())::text"))
  companyId   String
  stockItemId String
  godownId    String
  quantity    Float     @default(0)    // Current quantity in this godown
  rate        Float     @default(0)    // Weighted average rate
  value       Float     @default(0)    // quantity * rate
  updatedAt   DateTime  @default(now())

  // Relations
  Company     Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  StockItem   StockItem @relation(fields: [stockItemId], references: [id])
  Godown      Godown    @relation(fields: [godownId], references: [id])

  @@unique([stockItemId, godownId])   // One record per item per godown
  @@index([companyId])
  @@index([stockItemId])
  @@index([godownId])
}
```

### 1.3 Schema Changes to Existing Models

#### Company Model — Add relation
```prisma
// Add to Company model:
Godown          Godown[]
GodownStock     GodownStock[]
```

#### StockItem Model — Add relation
```prisma
// Add to StockItem model:
godownStocks    GodownStock[]
```

### 1.4 Migration Plan
```bash
npx prisma migrate dev --name add_godown_module
npx prisma generate
```

### 1.5 Default Data Seeding

When a company is created (or when inventory is enabled), auto-create the default godown:

```typescript
// In company creation service or a separate seed function:
await prisma.godown.create({
  data: {
    companyId: company.id,
    name: "Main Location",
    isDefault: true,
    createdBy: userId,
    updatedBy: userId,
  }
});
```

---

## Phase 2: Backend API Architecture

### 2.1 File Structure (follows existing pattern)

```
src/
├── api/
│   ├── model/inventory/
│   │   ├── godown.model.ts          ← NEW (Prisma operations)
│   │   └── godown-stock.model.ts    ← NEW (Stock balance per godown)
│   ├── controller/inventory/
│   │   └── godown.controller.ts     ← NEW (HTTP handlers)
│   └── router/inventory/
│       ├── godown.router.ts         ← NEW (Express routes)
│       └── index.ts                 ← UPDATE (register godown routes)
├── services/inventory/
│   └── godown.service.ts            ← NEW (Business logic)
└── utils/inventory/
    └── constants.ts                 ← UPDATE (add godown error messages)
```

### 2.2 API Endpoints

#### Godown Master CRUD
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/inventory/godowns/list/:companyId` | Get all godowns (flat list) |
| `GET` | `/api/v1/inventory/godowns/hierarchy/:companyId` | Get godown tree (nested) |
| `GET` | `/api/v1/inventory/godowns/search/:companyId?q=` | Typeahead search |
| `GET` | `/api/v1/inventory/godowns/:companyId/:godownId` | Get single godown details |
| `POST` | `/api/v1/inventory/godowns/:companyId` | Create godown |
| `PUT` | `/api/v1/inventory/godowns/:companyId/:godownId` | Update godown |
| `DELETE` | `/api/v1/inventory/godowns/:companyId/:godownId` | Soft delete godown |

#### Godown Stock (Balance Tracking)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/inventory/godowns/stock/:companyId/:godownId` | All items in a godown |
| `GET` | `/api/v1/inventory/godowns/stock-by-item/:companyId/:itemId` | All godowns holding an item |
| `GET` | `/api/v1/inventory/godowns/stock-summary/:companyId` | Summary: all godowns × all items |
| `POST` | `/api/v1/inventory/godowns/transfer/:companyId` | Transfer stock between godowns |

---

## Phase 3: Detailed Service Logic

### 3.1 Godown Service — `godown.service.ts`

```
Functions to implement:
├── getGodownsService(companyId, userId)
│     → Returns flat list with item counts per godown
│
├── getGodownHierarchyService(companyId, userId)
│     → Returns nested tree: { id, name, children: [...], stockCount }
│     → Uses the same 2-pass map/tree algorithm as AccountGroup hierarchy
│
├── searchGodownsService(companyId, userId, query)
│     → Search by name + alias, return top 20
│
├── createGodownService(companyId, userId, data)
│     ├── Validate company access
│     ├── Check duplicate name (case-insensitive)
│     ├── If underId provided → validate parent exists & belongs to company
│     ├── Prevent circular reference (same logic as StockGroup)
│     └── Create godown
│
├── updateGodownService(godownId, companyId, userId, data)
│     ├── Validate ownership
│     ├── Prevent renaming "Main Location" (default godown protection)
│     ├── If underId changed → circular reference check
│     └── Update godown
│
├── deleteGodownService(godownId, companyId, userId)
│     ├── Cannot delete if isDefault = true
│     ├── Cannot delete if has child godowns
│     ├── Cannot delete if has stock balance (GodownStock.quantity > 0)
│     └── Soft delete (isActive = false)
│
├── getGodownStockService(companyId, godownId, userId)
│     → Returns all items in a godown: [{ item, qty, rate, value }]
│
├── getItemGodownsService(companyId, itemId, userId)
│     → Returns all godowns holding an item: [{ godown, qty, rate, value }]
│
└── transferStockService(companyId, userId, transferData)
      ├── Validate: sourceGodown has enough quantity
      ├── Deduct from source GodownStock
      ├── Add to destination GodownStock (upsert)
      ├── StockItem.closingQty remains unchanged (total stock doesn't change)
      └── Return transfer summary
```

### 3.2 Stock Transfer Logic (Critical Business Logic)

The transfer endpoint is the most complex. Here's the exact logic:

```typescript
// POST /api/v1/inventory/godowns/transfer/:companyId
// Body:
{
  "stockItemId": "item_abc",
  "sourceGodownId": "godown_mumbai",
  "destinationGodownId": "godown_delhi",
  "quantity": 25,
  "rate": 4500,           // Optional: defaults to source godown's rate
  "narration": "Transfer to Delhi warehouse for project XYZ"
}

// Business Logic:
// 1. Validate sourceGodownId belongs to companyId
// 2. Validate destinationGodownId belongs to companyId
// 3. Validate sourceGodownId ≠ destinationGodownId
// 4. Validate stockItemId belongs to companyId
// 5. Get source GodownStock record
// 6. Validate source.quantity >= transfer quantity
// 7. Transaction:
//    a. source.quantity -= transferQty
//    b. source.value = source.quantity * source.rate
//    c. destination.quantity += transferQty (upsert)
//    d. destination.rate = rate || source.rate
//    e. destination.value = destination.quantity * destination.rate
// 8. StockItem.closingQty stays the same (stock didn't leave the company)
// 9. Return { source: updated, destination: updated }
```

### 3.3 Opening Balance Integration

When a StockItem is created with an opening balance, it should also create a GodownStock record:

```typescript
// In createStockItemService (update existing logic):
// After creating the item:
if (data.openingQty > 0) {
  const defaultGodown = await getDefaultGodown(companyId);
  await prisma.godownStock.create({
    data: {
      companyId,
      stockItemId: newItem.id,
      godownId: data.godownId || defaultGodown.id,  // User can specify, or default
      quantity: data.openingQty,
      rate: data.openingRate || 0,
      value: data.openingValue || 0,
    }
  });
}
```

---

## Phase 4: Godown Model — Database Operations Detail

### 4.1 `godown.model.ts` — Functions

```
CREATE:
  createGodownModel(data)                    → prisma.godown.create()

READ:
  getGodownByIdModel(godownId)               → findUnique + include children + _count
  getGodownsByCompanyIdModel(companyId)       → findMany + include parent + _count
  getGodownHierarchyModel(companyId)          → findMany → build tree (2-pass algorithm)
  searchGodownsModel(companyId, query)        → findMany + OR(name, alias) + take(20)
  findGodownByNameModel(companyId, name)      → findFirst (case-insensitive)
  getDefaultGodownModel(companyId)            → findFirst where isDefault = true

UPDATE:
  updateGodownModel(godownId, data)           → prisma.godown.update()

DELETE:
  deleteGodownModel(godownId)                → soft delete (isActive = false)
  canDeleteGodownModel(godownId)             → check children + stock balances

VALIDATION:
  checkGodownCircularRef(godownId, parentId)  → traverse parent chain
```

### 4.2 `godown-stock.model.ts` — Functions

```
READ:
  getStockByGodownModel(godownId)
    → All items in a godown, include StockItem name + Unit symbol

  getItemDistributionModel(stockItemId)
    → All godowns holding this item, include Godown name

  getGodownStockSummaryModel(companyId)
    → Full matrix: every item × every godown with qty/value

  getGodownStockRecordModel(stockItemId, godownId)
    → Single record: how much of this item is in this godown

WRITE:
  upsertGodownStockModel(data)
    → Create or update stock balance (used by transfers & purchases)

  deductGodownStockModel(stockItemId, godownId, quantity)
    → Reduce stock (used by transfers & sales)

  transferStockModel(sourceId, destId, itemId, qty, rate)
    → Atomic transaction: deduct source + add destination
```

---

## Phase 5: Constants & Error Messages

Add to `src/utils/inventory/constants.ts`:

```typescript
// Godown Errors
GODOWN_NOT_FOUND: 'Godown not found.',
GODOWN_NAME_REQUIRED: 'Godown name is required.',
GODOWN_NAME_DUPLICATE: 'A godown with this name already exists in this company.',
GODOWN_HAS_CHILDREN: 'Cannot delete godown with sub-godowns.',
GODOWN_HAS_STOCK: 'Cannot delete godown. It currently holds stock items.',
GODOWN_IS_DEFAULT: 'Cannot delete or rename the default godown "Main Location".',
GODOWN_CIRCULAR_REFERENCE: 'Cannot set parent: circular reference detected.',
GODOWN_TRANSFER_SAME: 'Source and destination godowns cannot be the same.',
GODOWN_TRANSFER_INSUFFICIENT: 'Insufficient stock in source godown for this transfer.',
GODOWN_TRANSFER_INVALID_QTY: 'Transfer quantity must be greater than zero.',

// Godown Success
GODOWN_CREATED: 'Godown created successfully.',
GODOWN_UPDATED: 'Godown updated successfully.',
GODOWN_DELETED: 'Godown deleted successfully.',
GODOWN_TRANSFER_SUCCESS: 'Stock transferred successfully.',
```

---

## Phase 6: Future Integration Points

### 6.1 Purchase Voucher Integration (Future)
When a purchase voucher is posted:
```
1. StockItem.closingQty += purchasedQty
2. StockItem.closingValue += purchasedValue
3. GodownStock[item, godown].quantity += purchasedQty   ← Godown-specific
4. GodownStock[item, godown].value recalculated
```

### 6.2 Sales Voucher Integration (Future)
When a sales voucher is posted:
```
1. Validate GodownStock[item, godown].quantity >= soldQty
2. StockItem.closingQty -= soldQty
3. GodownStock[item, godown].quantity -= soldQty
4. GodownStock[item, godown].value recalculated
```

### 6.3 Stock Journal / Manufacturing Journal (Future)
For raw material → finished goods conversion:
```
1. Deduct raw materials from source godown
2. Add finished goods to destination godown
3. Update StockItem balances accordingly
```

---

## Phase 7: Testing Plan

### 7.1 API Test Bodies

**Create Godown:**
```json
POST /api/v1/inventory/godowns/:companyId
{
  "name": "Mumbai Warehouse",
  "alias": "MW",
  "address": "Plot 5, MIDC Andheri East, Mumbai 400093",
  "contactName": "Rajesh Kumar",
  "contactPhone": "9876543210"
}
```

**Create Sub-Godown:**
```json
{
  "name": "Rack A",
  "alias": "MW-A",
  "underId": "<mumbai_warehouse_godown_id>"
}
```

**Transfer Stock:**
```json
POST /api/v1/inventory/godowns/transfer/:companyId
{
  "stockItemId": "<solar_panel_item_id>",
  "sourceGodownId": "<mumbai_godown_id>",
  "destinationGodownId": "<delhi_godown_id>",
  "quantity": 25,
  "narration": "Transfer for Project Sunrise"
}
```

### 7.2 Test Flow
1. **Seed:** Auto-created "Main Location" exists on company creation
2. **Create:** Add "Mumbai Warehouse" and "Delhi Warehouse"
3. **Sub-godown:** Add "Rack A" under "Mumbai Warehouse"
4. **Hierarchy:** GET hierarchy → verify tree structure
5. **Create Item:** Create "Solar Panel 450W" with opening qty 100 → goes to "Main Location"
6. **Transfer:** Move 40 units from "Main Location" to "Mumbai Warehouse"
7. **Verify:** GET stock-by-item → should show 60 in Main, 40 in Mumbai
8. **Transfer:** Move 15 from "Mumbai" to "Delhi"
9. **Verify:** Main=60, Mumbai=25, Delhi=15. Total still 100.
10. **Delete Test:** Try deleting "Mumbai" → should fail (has stock + children)
11. **Delete Test:** Try deleting "Main Location" → should fail (isDefault)
12. **Search:** Search "mum" → returns "Mumbai Warehouse"

---

## Summary: Implementation Order

| Step | What | Files | Effort |
|------|------|-------|--------|
| **1** | Add Prisma models (`Godown`, `GodownStock`) + update `Company` & `StockItem` relations | `schema.prisma` | 30 min |
| **2** | Run migration + prisma generate | Terminal | 5 min |
| **3** | Create `godown.model.ts` (DB operations) | `src/api/model/inventory/` | 1 hr |
| **4** | Create `godown-stock.model.ts` (stock balance ops) | `src/api/model/inventory/` | 1 hr |
| **5** | Create `godown.service.ts` (business logic + transfer) | `src/services/inventory/` | 1.5 hr |
| **6** | Create `godown.controller.ts` (HTTP handlers) | `src/api/controller/inventory/` | 45 min |
| **7** | Create `godown.router.ts` + register in `index.ts` | `src/api/router/inventory/` | 15 min |
| **8** | Update `constants.ts` with godown errors/success | `src/utils/inventory/` | 10 min |
| **9** | Update barrel exports (`index.ts` in model) | `src/api/model/inventory/` | 5 min |
| **10** | Update `createStockItemService` for godown-aware opening balance | `src/services/inventory/` | 30 min |
| **11** | Default godown seeding in company creation | `src/services/accounting/` | 20 min |
| **12** | TypeScript compile check + test | Terminal | 15 min |
| | **Total** | | **~6-7 hours** |
