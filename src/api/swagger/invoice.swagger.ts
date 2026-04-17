/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Invoice management and generation
 */

/**
 * @swagger
 * /invoices:
 *   get:
 *     summary: Get all invoices
 *     tags: [Invoices]
 *     responses:
 *       200:
 *         description: List of invoices retrieved successfully
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoices]
 *     responses:
 *       201:
 *         description: Invoice created and PDFs generated
 */

/**
 * @swagger
 * /invoices/{id}:
 *   get:
 *     summary: Get invoice details by ID
 *     tags: [Invoices]
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
 *         description: Invoice details
 *   put:
 *     summary: Update an invoice
 *     tags: [Invoices]
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
 *         description: Invoice updated successfully
 *   delete:
 *     summary: Delete an invoice
 *     tags: [Invoices]
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
 *         description: Invoice deleted successfully
 */

/**
 * @swagger
 * /invoices/{id}/download-invoice:
 *   get:
 *     summary: Download standard PDF invoice
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Redirects to signed PDF URL
 */

/**
 * @swagger
 * /invoices/{id}/download-sales-invoice:
 *   get:
 *     summary: Download modern sales PDF invoice
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Redirects to signed PDF URL
 */

/**
 * @swagger
 * /invoices/{id}/send-email:
 *   post:
 *     summary: Send invoice PDF to customer email
 *     tags: [Invoices]
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
 *         description: Email sent successfully
 */

/**
 * @swagger
 * /invoices/{id}/delivery-preview:
 *   get:
 *     summary: Generate a preview invoice with specific delivery date
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: deliveryDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Temporary PDF generated for preview
 */

