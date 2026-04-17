/**
 * @swagger
 * tags:
 *   name: Accounting
 *   description: Accounting module for company, ledger, and voucher management
 */

/**
 * @swagger
 * /accounting/companies:
 *   post:
 *     summary: Create a new company
 *     tags: [Accounting]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, booksBeginningFrom]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "ABC Pvt Ltd"
 *               legalName:
 *                 type: string
 *               displayName:
 *                 type: string
 *               businessType:
 *                 type: string
 *                 enum: [SOLE_PROPRIETORSHIP, PARTNERSHIP, LLP, PRIVATE_LIMITED, PUBLIC_LIMITED, OPC, NGO, TRUST, SOCIETY, HUF, OTHER]
 *               industry:
 *                 type: string
 *               gstin:
 *                 type: string
 *               pan:
 *                 type: string
 *               tan:
 *                 type: string
 *               cin:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               website:
 *                 type: string
 *               addressLine1:
 *                 type: string
 *               addressLine2:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *                 default: "India"
 *               pincode:
 *                 type: string
 *               baseCurrency:
 *                 type: string
 *                 default: "INR"
 *               booksBeginningFrom:
 *                 type: string
 *                 format: date
 *                 example: "2024-04-01"
 *               enableGST:
 *                 type: boolean
 *                 default: true
 *               enableTDS:
 *                 type: boolean
 *                 default: false
 *               enableInventory:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Company created successfully
 *       400:
 *         description: Invalid input or company already exists
 *       401:
 *         description: Unauthorized
 * 
 *   get:
 *     summary: Get all companies for the current user
 *     tags: [Accounting]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of companies
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /accounting/companies/{id}:
 *   get:
 *     summary: Get company details by ID
 *     tags: [Accounting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company details
 *       403:
 *         description: Access denied
 *       404:
 *         description: Company not found
 * 
 *   put:
 *     summary: Update company details
 *     tags: [Accounting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompanyUpdate'
 *     responses:
 *       200:
 *         description: Company updated successfully
 * 
 *   delete:
 *     summary: Delete a company (soft delete)
 *     tags: [Accounting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company deleted successfully
 */

