/**
 * @swagger
 * tags:
 *   name: Workers
 *   description: On-field worker management
 */

/**
 * @swagger
 * /workers:
 *   get:
 *     summary: Get all workers
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workers
 *   post:
 *     summary: Create a new worker profile
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Worker created successfully
 */

/**
 * @swagger
 * /workers/{id}:
 *   get:
 *     summary: Get worker by ID
 *     tags: [Workers]
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
 *         description: Worker details
 *   put:
 *     summary: Update worker details
 *     tags: [Workers]
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
 *         description: Worker updated
 *   delete:
 *     summary: Delete worker profile
 *     tags: [Workers]
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
 *         description: Worker deleted
 */

/**
 * @swagger
 * /workers/company/{company}:
 *   get:
 *     summary: Get workers by company name
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of workers
 */

