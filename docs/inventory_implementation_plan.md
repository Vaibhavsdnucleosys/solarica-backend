Inventory Module Implementation Plan - Tally Prime Enterprise Grade
This document outlines the phased implementation plan for the Inventory Masters module, specifically designed to replicate the enterprise-grade capabilities, real-time performance, and keyboard-centric workflows of Tally Prime.
Phase 1: Enterprise Data Foundation (Database & Schema)
The goal of this phase is to build a high-performance relational structure capable of handling hierarchical inventory data.
1.1 schema.prisma Enhancements
1.	Strict Typing & Relations:
–	Implement StockGroup with self-referencing relation (parent -> children) to support infinite nesting.
–	Implement StockCategory with similar recursive structure.
–	Implement Unit model with rigorous constraints (precision decimal support).
–	Implement StockItem with comprehensive fields for statutory compliance (HSN/SAC, GST Rates), opening balances, and real-time stock tracking fields (closingQty, closingValue).
2.	Indexing Strategy:
–	Add crucial indexes on name, alias, and parentId to ensure instant lookup performance for large datasets.
3.	Migration:
–	Generate and run migration init_enterprise_inventory_masters to apply changes safely.
Phase 2: High-Performance Backend Architecture
This phase moves beyond simple CRUD to implement the logic engine required for a Tally-like experience.
2.1 Advanced Service Layer (src/services/inventory)
1.	Hierarchy Service:
–	Build recursive algorithms to fetch and structure StockGroup trees efficiently (avoiding N+1 queries).
–	Implement "Parent Validation" logic to prevent circular references in groups.
2.	Validation Engine:
–	Implement fast, database-level checks for unique constraints (Name/Alias/Symbol) within a specific Company scope.
–	Build validateSymbol logic for Units to prevent duplicates like "Nos" and "nos".
3.	Real-Time Computation:
–	Implement logic to calculate closingStock dynamically based on transactions (future-proofing).
2.2 Specialized API Endpoints (The "Tally Experience")
1.	Fast Search APIs (/search):
–	Implement optimized endpoints for StockGroup, StockCategory, Unit, and StockItem search.
–	Performance Goal: Return top 20 matches in <50ms for instant sidebar filtering.
2.	Validation APIs (/check-name):
–	Create lightweight endpoints that check availability of a Name/Alias as the user types, providing instant feedback.
3.	Hierarchy APIs (/tree):
–	Return full nested JSON structures for the "Chart of Inventory" views.
4.	Operational APIs:
–	getLastRate: Fetch the last transaction rate for an item/party combination to auto-fill vouchers.
–	getStockSummary: aggregated view for reporting.
Phase 3: Frontend "Tally Core" UI Framework
Building the reusable UI components that give the application its distinct "Tally Feel".
3.1 Sidebar Selection Engine
1.	Component: TallySmartSidebar.
2.	Functionality:
–	Dynamic Filtering: Filters list instantly as user types in the main field.
–	Keyboard Navigation: Up/Down arrows to navigate, Enter to select.
–	"Create New" Hook: Always include a "Create" option (or Alt+C listener) to spawn a creation modal.
3.2 Keyboard Navigation Manager
1.	Global Listeners:
–	Enter: Acts as Tab (Move Next).
–	Backspace: Move Previous (if field empty).
–	Esc: Intelligence Exit (Check for changes -> Prompt Save/Quit).
–	Ctrl+A: Instant Save.
–	Alt+C: Secondary Action (Create Master).
Phase 4: Master Creation Modules (Production Ready)
4.1 Unit Master (TallyUnitCreation.tsx)
•	Features:
–	Simple Unit creation.
–	Formal Name & UQC selection from standard list.
–	Precision control (Decimal Places).
•	Validation:
–	Prevent duplicate Symbols.
–	Warn on changing decimal places if transactions exist.
4.2 Stock Group & Category Masters
•	UI: Vertical Tally Layout.
•	Logic:
–	"Under" field uses TallySmartSidebar to select parent.
–	Statutory Details (GST) inheritance toggle.
4.3 Stock Item Master (The Complex One)
•	Layout: Split View (General Info | Statutory & Opening Balance).
•	Fields & Logic:
–	Under/Category/Unit: All use TallySmartSidebar for selection.
–	Statutory: "Set/Alter GST Details" toggle opens a sub-form for HSN/Tax details.
–	Opening Balance:
•	Qty: Numeric input.
•	Rate: Numeric input.
•	Value: Auto-calc (Qty * Rate). Editable override.
•	Integration:
–	Alt+C on "Under" opens Group Creation modal.
–	Alt+C on "Units" opens Unit Creation modal.
Phase 5: Testing & Optimization
5.1 Functional Testing
•	Verify hierarchy depths (Group -> SubGroup -> Item).
•	Verify "Create on Fly" flows (Item -> New Group -> Back to Item).
•	Verify comprehensive persistence of all Statutory fields.
5.2 Performance Tuning
•	Test Search APIs with large datasets (1000+ items) to ensure latency <100ms.
•	Optimize React re-renders on the main form during typing.
