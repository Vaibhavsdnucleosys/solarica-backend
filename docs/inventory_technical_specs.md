Inventory Module - Technical Implementation & API Structure
This section details the specific technical implementation required to support the Tally Prime-like inventory features.
1. Database Schema Extensions (Prisma Models)
The following models must be added to schema.prisma to support the inventory hierarchy and advanced field structures.
1.1 StockGroup Model
Supports hierarchical structure (recursive relationship).
model StockGroup {
  id                  String      @id @default(uuid())
  name                String
  alias               String?
  underId             String?     // Self-relation: Parent Group ID
  parent              StockGroup? @relation("GroupToGroup", fields: [underId], references: [id])
  children            StockGroup[] @relation("GroupToGroup")
  shouldAddQuantities Boolean     @default(false)
  
  // Statutory Details (Inheritable)
  gstApplicable       String      @default("Applicable")
  hsnSac              String?
  hsnDescription      String?
  taxabilityType      String?     // Taxable, Exempt, Nil Rated
  gstRate             Float       @default(0) // Integrated Tax Rate
  
  companyId           String
  company             Company     @relation(fields: [companyId], references: [id])
  items               StockItem[]
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt
}
1.2 StockCategory Model
Supports hierarchical structure (recursive relationship).
model StockCategory {
  id          String         @id @default(uuid())
  name        String
  alias       String?
  underId     String?        // Self-relation: Parent Category ID
  parent      StockCategory? @relation("CategoryToCategory", fields: [underId], references: [id])
  children    StockCategory[] @relation("CategoryToCategory")
  
  companyId   String
  company     Company        @relation(fields: [companyId], references: [id])
  items       StockItem[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}
1.3 Unit Model
Supports simple units initially.
model Unit {
  id            String      @id @default(uuid())
  type          String      @default("Simple") // Simple or Compound
  symbol        String      // e.g., "Nos"
  formalName    String      // e.g., "Numbers"
  uqc           String?     // Unit Quantity Code (GST Standard)
  decimalPlaces Int         @default(0)
  
  companyId     String
  company       Company     @relation(fields: [companyId], references: [id])
  items         StockItem[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}
1.4 StockItem Model
The core entity with detailed statutory and opening balance fields.
model StockItem {
  id              String         @id @default(uuid())
  name            String
  alias           String?
  underId         String?        // Relates to StockGroup
  group           StockGroup?    @relation(fields: [underId], references: [id])
  categoryId      String?        // Relates to StockCategory
  category        StockCategory? @relation(fields: [categoryId], references: [id])
  unitId          String?        // Relates to Unit
  unit            Unit?          @relation(fields: [unitId], references: [id])
  
  // Statutory Details
  gstApplicable   String         @default("Applicable")
  hsnSource       String         @default("Specified Here") // "As per Group", "Specified Here"
  hsnSac          String?        // Only stored if source is "Specified Here"
  hsnDescription  String?
  
  gstRateSource   String         @default("Specified Here") // "As per Group", "Specified Here"
  taxabilityType  String?        // Taxable, Exempt, Nil Rated
  gstRate         Float          @default(0) // Integrated Tax Rate
  typeOfSupply    String         @default("Goods")
  rateOfDuty      Float          @default(0)
  
  // Opening Balance
  openingQty      Float          @default(0)
  openingRate     Float          @default(0)
  openingValue    Float          @default(0) // Usually Qty * Rate
  
  companyId       String
  company         Company        @relation(fields: [companyId], references: [id])
  
  // Real-time Stock Tracking (Optimized for Read)
  closingQty      Float          @default(0) // Updated by Triggers/Logic
  closingValue    Float          @default(0)
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}
2. Comprehensive API Endpoints (Tally-Like Architecture)
To replicate Tally's fluid experience, we need more than just CRUD. We need Search, Validation, Hierarchy, and Reporting APIs.
2.1 Master Data APIs (CRUD + Search)
Standard management for creating/editing masters.
Stock Groups
•	POST /groups - Create
•	PUT /groups/:id - Update
•	DELETE /groups/:id - Delete
•	GET /groups/:id - Get Details
•	GET /groups/search (Advanced): Query param q. Returns { id, name, alias, parentName }. Optimized for Typeahead sidebar.
•	GET /groups/hierarchy (Advanced): Returns a recursive tree { id, name, children: [...] } for Chart of Accounts view.
Stock Categories
•	POST /categories
•	PUT /categories/:id
•	DELETE /categories/:id
•	GET /categories/search: Optimized sidebar search.
•	GET /categories/hierarchy: Tree view for display.
Units
•	POST /units
•	PUT /units/:id
•	DELETE /units/:id
•	GET /units/search: Sidebar search.
•	GET /units/validate-symbol: Checks if symbol "Nos" exists before submitting.
Stock Items
•	POST /items
•	PUT /items/:id
•	DELETE /items/:id
•	GET /items/:id
•	GET /items/search: Fast search by Name OR Alias. Returns { id, name, currentStock, unit }.
•	GET /items/check-name: Validation API to prevent duplicates instantly.
2.2 Operational / Helper APIs (The "Tally Magic")
These APIs support specific Tally features like "Rate History" or "Auto-fill".
•	GET /inventory/last-rate:
–	Params: itemId, partyLedgerId, type (Purchase/Sale).
–	Returns: The last rate (price) used for this item with this party. Used to auto-fill rate in Voucher Entry.
•	GET /inventory/batch-list (Future):
–	Params: itemId.
–	Returns: List of available batches/godowns with stock > 0.
2.3 Reporting & Aggregation APIs
Tally provides reports instantly. We cannot compute these on the client side for large data.
•	GET /reports/stock-summary:
–	Params: groupId (optional, for drill down), date.
–	Returns: { groupName, closingQty, closingRate, closingValue }. Aggregated view.
•	GET /reports/stock-movement:
–	Params: itemId.
–	Returns: { inwards: { qty, value }, outwards: { qty, value } }.
•	GET /reports/negative-stock:
–	Returns: List of items where closingQty < 0.
3. Frontend Service Layer Structure
The frontend service inventoryService.ts will abstract these into usable functions:
// Masters
createItem(data)
updateItem(id, data)
deleteItem(id)

// Search & UI Helpers
searchItems(query: string) // Debounced search
getGroupTree() // For Chart of Accounts
validateSymbol(symbol: string) // Async validation

// Reports
getStockSummary(groupId?)
getLastTransactionRate(itemId, partyId)
4. Middleware & Logic
•	Validation Middleware:
–	Ensure Name is unique across Items (per company).
–	Ensure Alias is unique.
–	Ensure Symbol for Units is unique.
•	Transaction Logic:
–	When a Voucher is created/edited, it must update the closingQty and closingValue of the Stock Item (or insert into a StockLedger table for history).
