/**
 * @swagger
 * tags:
 *   name: Payment Proofs
 *   description: Managing transaction proofs for quotations
 */

/**
 * @swagger
 * /quotations/{id}/proofs:
 *   get:
 *     summary: Get all payment proofs for a specific quotation
 *     tags: [Payment Proofs]
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
 *         description: List of proofs
 *   post:
 *     summary: Upload a new payment proof image
 *     tags: [Payment Proofs]
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
 *               file:
 *                 type: string
 *                 format: binary
 *               type:
 *                 type: string
 *                 enum: [ADVANCE, FULL]
 *     responses:
 *       201:
 *         description: Proof uploaded
 */

/**
 * @swagger
 * /quotations/proofs/{proofId}:
 *   get:
 *     summary: Get specific proof details (Signed URL)
 *     tags: [Payment Proofs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: proofId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proof data
 *   delete:
 *     summary: Remove a payment proof
 *     tags: [Payment Proofs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: proofId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proof deleted
 */

