import { Router } from "express";
import leadAssignmentController from "../controllers/leadAssignment.controller";
import { bodySchemaValidator } from "../middlewares/schema.validator";
import hasPermission from "../middlewares/permission.middleware";
import { roleNames } from "../common/utils";
import { CustomRequest } from "../interfaces/types";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LeadAssignment:
 *       type: object
 *       properties:
 *         leadAssignmentId:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the lead assignment
 *         leadType:
 *           type: string
 *           description: Product name from IndiaMart
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the assigned user
 *         organisationId:
 *           type: string
 *           format: uuid
 *           description: ID of the organisation
 *         createdBy:
 *           type: string
 *           description: User who created the assignment
 *         modifiedBy:
 *           type: string
 *           description: User who last modified the assignment
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     LeadAssignmentCreate:
 *       type: object
 *       required:
 *         - leadType
 *       properties:
 *         leadType:
 *           type: string
 *           description: Product name from IndiaMart
 *         description:
 *           type: string
 *           description: Optional description for the lead assignment
 */

/**
 * @swagger
 * /leadAssignment:
 *   get:
 *     summary: Get all lead assignments
 *     tags: [Lead Assignments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all lead assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LeadAssignment'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  "/",
  hasPermission([roleNames.ADMIN, roleNames.SALESMANAGER]),
  leadAssignmentController.getAllLeadAssignments
);

/**
 * @swagger
 * /leadAssignment/{leadType}:
 *   get:
 *     summary: Get a specific lead assignment by lead type
 *     tags: [Lead Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leadType
 *         required: true
 *         schema:
 *           type: string
 *         description: Lead type to fetch
 *     responses:
 *       200:
 *         description: Lead assignment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeadAssignment'
 *       404:
 *         description: Lead assignment not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  "/:leadType",
  hasPermission([roleNames.ADMIN, roleNames.SALESMANAGER]),
  leadAssignmentController.getLeadAssignment
);

/**
 * @swagger
 * /leadAssignment/create-lead-assignment:
 *   post:
 *     summary: Create a new lead assignment
 *     description: Creates a lead assignment using the authenticated user's information. The user ID and organisation ID will be automatically set from the authenticated user's context.
 *     tags: [Lead Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LeadAssignmentCreate'
 *     responses:
 *       201:
 *         description: Lead assignment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeadAssignment'
 *       400:
 *         description: Invalid request body or lead type
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       409:
 *         description: Lead type already exists
 */
router.post(
  "/create-lead-assignment",
  hasPermission([roleNames.ADMIN]),
  leadAssignmentController.createLeadAssignment
);

/**
 * @swagger
 * /leadAssignment/{leadType}:
 *   put:
 *     summary: Update an existing lead assignment
 *     tags: [Lead Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leadType
 *         required: true
 *         schema:
 *           type: string
 *         description: Lead type to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               organisationId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Lead assignment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeadAssignment'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Lead assignment not found
 */
router.put(
  "/:leadType",
  hasPermission([roleNames.ADMIN]),
  leadAssignmentController.updateLeadAssignment
);

/**
 * @swagger
 * /leadAssignment/{leadType}:
 *   delete:
 *     summary: Delete a lead assignment
 *     tags: [Lead Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leadType
 *         required: true
 *         schema:
 *           type: string
 *         description: Lead type to delete
 *     responses:
 *       200:
 *         description: Lead assignment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Lead assignment not found
 */
router.delete(
  "/:leadType",
  hasPermission([roleNames.ADMIN]),
  leadAssignmentController.deleteLeadAssignment
);



export default router; 