/**
 * Inventory Module Constants
 * Contains all constant values used across the inventory module
 */

// ============================================
// ERROR MESSAGES
// ============================================

export const INVENTORY_ERRORS = {
    // Unit Errors
    UNIT_NOT_FOUND: 'Unit not found.',
    UNIT_SYMBOL_REQUIRED: 'Unit symbol is required.',
    UNIT_FORMAL_NAME_REQUIRED: 'Unit formal name is required.',
    UNIT_SYMBOL_DUPLICATE: 'A unit with this symbol already exists in this company.',
    UNIT_HAS_ITEMS: 'Cannot delete unit. It is currently used by stock items.',
    UNIT_INVALID_DECIMAL_PLACES: 'Decimal places must be between 0 and 4.',

    // Stock Group Errors
    GROUP_NOT_FOUND: 'Stock group not found.',
    GROUP_NAME_REQUIRED: 'Stock group name is required.',
    GROUP_NAME_DUPLICATE: 'A stock group with this name already exists in this company.',
    GROUP_HAS_CHILDREN: 'Cannot delete stock group with sub-groups.',
    GROUP_HAS_ITEMS: 'Cannot delete stock group. It has stock items.',
    GROUP_CIRCULAR_REFERENCE: 'Cannot set parent: circular reference detected.',

    // Stock Category Errors
    CATEGORY_NOT_FOUND: 'Stock category not found.',
    CATEGORY_NAME_REQUIRED: 'Stock category name is required.',
    CATEGORY_NAME_DUPLICATE: 'A stock category with this name already exists in this company.',
    CATEGORY_HAS_CHILDREN: 'Cannot delete stock category with sub-categories.',
    CATEGORY_HAS_ITEMS: 'Cannot delete stock category. It has stock items.',

    // Stock Item Errors
    ITEM_NOT_FOUND: 'Stock item not found.',
    ITEM_NAME_REQUIRED: 'Stock item name is required.',
    ITEM_NAME_DUPLICATE: 'A stock item with this name already exists in this company.',
    ITEM_HAS_TRANSACTIONS: 'Cannot delete stock item with existing transactions.',

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

    // Compound Unit Errors
    COMPOUND_UNITS_REQUIRED: 'Compound unit requires both first unit and second unit.',
    COMPOUND_UNITS_SAME: 'First unit and second unit cannot be the same.',
    COMPOUND_CONVERSION_INVALID: 'Conversion factor must be greater than zero.',
    COMPOUND_FIRST_UNIT_INVALID: 'First unit must be a valid Simple unit in the same company.',
    COMPOUND_SECOND_UNIT_INVALID: 'Second unit must be a valid Simple unit in the same company.',

    // General Errors
    UNAUTHORIZED_ACCESS: 'You do not have access to this company.',
} as const;

// ============================================
// SUCCESS MESSAGES
// ============================================

export const INVENTORY_SUCCESS = {
    UNIT_CREATED: 'Unit created successfully.',
    UNIT_UPDATED: 'Unit updated successfully.',
    UNIT_DELETED: 'Unit deleted successfully.',
    GROUP_CREATED: 'Stock group created successfully.',
    GROUP_UPDATED: 'Stock group updated successfully.',
    GROUP_DELETED: 'Stock group deleted successfully.',
    CATEGORY_CREATED: 'Stock category created successfully.',
    CATEGORY_UPDATED: 'Stock category updated successfully.',
    CATEGORY_DELETED: 'Stock category deleted successfully.',
    ITEM_CREATED: 'Stock item created successfully.',
    ITEM_UPDATED: 'Stock item updated successfully.',
    ITEM_DELETED: 'Stock item deleted successfully.',
    GODOWN_CREATED: 'Godown created successfully.',
    GODOWN_UPDATED: 'Godown updated successfully.',
    GODOWN_DELETED: 'Godown deleted successfully.',
    GODOWN_TRANSFER_SUCCESS: 'Stock transferred successfully.',
} as const;

// ============================================
// STANDARD UQC CODES (GST)
// ============================================

export const STANDARD_UQC_CODES = [
    { code: 'BAG', description: 'Bags' },
    { code: 'BAL', description: 'Bale' },
    { code: 'BDL', description: 'Bundles' },
    { code: 'BKL', description: 'Buckles' },
    { code: 'BOU', description: 'Billion of Units' },
    { code: 'BOX', description: 'Box' },
    { code: 'BTL', description: 'Bottles' },
    { code: 'BUN', description: 'Bunches' },
    { code: 'CAN', description: 'Cans' },
    { code: 'CBM', description: 'Cubic Meters' },
    { code: 'CCM', description: 'Cubic Centimeters' },
    { code: 'CMS', description: 'Centimeters' },
    { code: 'CTN', description: 'Cartons' },
    { code: 'DOZ', description: 'Dozens' },
    { code: 'DRM', description: 'Drums' },
    { code: 'GGK', description: 'Great Gross' },
    { code: 'GMS', description: 'Grams' },
    { code: 'GRS', description: 'Gross' },
    { code: 'GYD', description: 'Gross Yards' },
    { code: 'KGS', description: 'Kilograms' },
    { code: 'KLR', description: 'Kilolitres' },
    { code: 'KME', description: 'Kilometres' },
    { code: 'LTR', description: 'Litres' },
    { code: 'MLT', description: 'Millilitres' },
    { code: 'MTR', description: 'Meters' },
    { code: 'MTS', description: 'Metric Tons' },
    { code: 'NOS', description: 'Numbers' },
    { code: 'OTH', description: 'Others' },
    { code: 'PAC', description: 'Packs' },
    { code: 'PCS', description: 'Pieces' },
    { code: 'PRS', description: 'Pairs' },
    { code: 'QTL', description: 'Quintals' },
    { code: 'ROL', description: 'Rolls' },
    { code: 'SET', description: 'Sets' },
    { code: 'SQF', description: 'Square Feet' },
    { code: 'SQM', description: 'Square Meters' },
    { code: 'SQY', description: 'Square Yards' },
    { code: 'TBS', description: 'Tablets' },
    { code: 'TGM', description: 'Ten Gross' },
    { code: 'THD', description: 'Thousands' },
    { code: 'TON', description: 'Tonnes' },
    { code: 'TUB', description: 'Tubes' },
    { code: 'UGS', description: 'US Gallons' },
    { code: 'UNT', description: 'Units' },
    { code: 'YDS', description: 'Yards' },
] as const;

