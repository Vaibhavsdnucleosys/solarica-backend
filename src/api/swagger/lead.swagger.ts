/**
 * @swagger
 * tags:
 *   name: Leads
 *   description: Sales lead prospecting and management
 */

/**
 * @swagger
 * /leads:
 *   get:
 *     summary: Get all leads
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of leads
 *   post:
 *     summary: Create a new prospecting lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Lead created
 */

/**
 * @swagger
 * /leads/stats:
 *   get:
 *     summary: Get lead conversion statistics
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics data
 */

/**
 * @swagger
 * /leads/emails:
 *   get:
 *     summary: Get list of all lead emails
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of strings
 */

/**
 * @swagger
 * /leads/phones:
 *   get:
 *     summary: Get list of all lead phone numbers
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of strings
 */

/**
 * @swagger
 * /leads/search:
 *   get:
 *     summary: Search for a lead by name or company
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */

/**
 * @swagger
 * /leads/{id}:
 *   get:
 *     summary: Get specific lead by ID
 *     tags: [Leads]
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
 *         description: Lead details
 *   put:
 *     summary: Update lead details
 *     tags: [Leads]
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
 *         description: Lead updated
 *   delete:
 *     summary: Remove a lead
 *     tags: [Leads]
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
 *         description: Lead deleted
 */

