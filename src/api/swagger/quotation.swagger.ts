/**
 * @swagger
 * tags:
 *   name: Quotations
 *   description: Quotation management endpoints
 */

/**
 * @swagger
 * /quotations:
 *   get:
 *     summary: Get all quotations
 *     tags: [Quotations]
 *     responses:
 *       200:
 *         description: List of quotations retrieved successfully
 *   post:
 *     summary: Create a new quotation
 *     tags: [Quotations]
 *     responses:
 *       201:
 *         description: Quotation created successfully
 */

/**
 * @swagger
 * /quotations/{id}:
 *   get:
 *     summary: Get quotation by ID
 *     tags: [Quotations]
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
 *         description: Quotation details
 *   delete:
 *     summary: Delete a quotation
 *     tags: [Quotations]
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
 *         description: Quotation deleted
 */

/**
 * @swagger
 * /quotations/{id}/send-email:
 *   post:
 *     summary: Send quotation PDF via email
 *     tags: [Quotations]
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
 * /quotations/{id}/generate-pdf:
 *   post:
 *     summary: Manually trigger PDF generation
 *     tags: [Quotations]
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
 *         description: PDF generated and uploaded
 */

/**
 * @swagger
 * /quotations/{id}/upload-docs:
 *   post:
 *     summary: Upload additional documents for a quotation
 *     tags: [Quotations]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               doc1:
 *                 type: string
 *                 format: binary
 *               doc2:
 *                 type: string
 *                 format: binary
 *               doc3:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Documents uploaded successfully
 */

/**
 * @swagger
 * /quotations/{id}/view-docs:
 *   get:
 *     summary: Get signed URLs for uploaded documents
 *     tags: [Quotations]
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
 *         description: List of signed URLs
 */

/**
 * @swagger
 * /quotations/service-types:
 *   get:
 *     summary: Get available quotation service types
 *     tags: [Quotations]
 *     responses:
 *       200:
 *         description: List of service types
 */

