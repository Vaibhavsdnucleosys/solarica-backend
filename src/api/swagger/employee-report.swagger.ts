/**
 * @swagger
 * tags:
 *   name: Employee Reports
 *   description: Analytics and performance reports for employees and teams
 */

/**
 * @swagger
 * /employee-reports:
 *   get:
 *     summary: Get all employee performance reports
 *     tags: [Employee Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reports
 */

/**
 * @swagger
 * /employee-reports/summary:
 *   get:
 *     summary: Get overall team performance summary
 *     tags: [Employee Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance summary data
 */

/**
 * @swagger
 * /employee-reports/monthly-sales-report:
 *   get:
 *     summary: Get monthly sales aggregation report
 *     tags: [Employee Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Decoded monthly sales data
 */

/**
 * @swagger
 * /employee-reports/{id}:
 *   get:
 *     summary: Get a specific report by ID
 *     tags: [Employee Reports]
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
 *         description: Detailed report data
 */

