import { Router } from "express";
import LeadController from "../controllers/lead.controller";
import {  LeadSchema ,bulkDeleteSchema} from "../schemas/lead.schemas";
import { bodySchemaValidator } from "../middlewares/schema.validator";
import { uploadFileUsingMulter } from "../middlewares/file.middleware";
import hasPermission from "../middlewares/permission.middleware";

import { roleNames } from "../common/utils";

const leadRouter = Router();
const leadController=new LeadController();

// /**
//  * @swagger
//  * tags:
//  *   name: Leads
//  *   description: Lead management endpoints
//  */

// /**
//  * @swagger
//  * /lead:
//  *   get: 
//  *     summary: Get all leads
//  *     tags: [Leads]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Success
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 message:
//  *                   type: string
//  *                   example: "All leads"
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     $ref: '#/components/schemas/Lead'
//  *                 code:
//  *                   type: integer
//  *
//  * /lead/create-lead:
//  *   post:
//  *     summary: Create a new lead
//  *     tags: [Leads]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/LeadSchema'
//  *     responses:
//  *       201:
//  *         description: Lead created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                 message:
//  *                   type: string
//  *                 data:
//  *                   $ref: '#/components/schemas/Lead'
//  *                 code:
//  *                   type: integer
//  *
//  * /lead/get-leads:
//  *   post:
//  *     summary: Get filtered leads
//  *     tags: [Leads]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Success
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                 message:
//  *                   type: string
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     $ref: '#/components/schemas/Lead'
//  *                 code:
//  *                   type: integer
//  *
//  * /lead/update-lead/{leadId}:
//  *   put:
//  *     summary: Update a lead
//  *     tags: [Leads]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: leadId
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: uuid
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/LeadSchema'
//  *     responses:
//  *       200:
//  *         description: Lead updated successfully
//  *
//  * /lead/get-lead/{leadId}:
//  *   get:
//  *     summary: Get lead by ID
//  *     tags: [Leads]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: leadId
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: uuid
//  *     responses:
//  *       200:
//  *         description: Success
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                 message:
//  *                   type: string
//  *                 data:
//  *                   $ref: '#/components/schemas/Lead'
//  *                 code:
//  *                   type: integer
//  *
//  * /lead/delete-lead/{leadId}:
//  *   delete:
//  *     summary: Delete a lead
//  *     tags: [Leads]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: leadId
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: uuid
//  *     responses:
//  *       200:
//  *         description: Lead deleted successfully
//  *
//  * /lead/upload-excel-leads:
//  *   post:
//  *     summary: Upload leads via Excel file
//  *     tags: [Leads]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               file:
//  *                 type: string
//  *                 format: binary
//  *     responses:
//  *       200:
//  *         description: Leads uploaded successfully
//  *
//  * /lead/bulk-delete:
//  *   post:
//  *     summary: Delete multiple leads
//  *     tags: [Leads]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/bulkDeleteSchema'
//  *     responses:
//  *       200:
//  *         description: Leads deleted successfully
//  *
//  * /lead/bycontact/{contactId}:
//  *   post:
//  *     summary: Get leads by contact ID
//  *     tags: [Leads]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: contactId
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: uuid
//  *     responses:
//  *       200:
//  *         description: Success
//  *
//  * /lead/byaccount/{accountId}:
//  *   post:
//  *     summary: Get leads by account ID
//  *     tags: [Leads]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: accountId
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: uuid
//  *     responses:
//  *       200:
//  *         description: Success
//  */

leadRouter.get("/", leadController.getAllLeads);

leadRouter.post(
    "/create-lead",    
    bodySchemaValidator(LeadSchema),
    leadController.createLead
);

leadRouter.post(
    "/get-leads",
    hasPermission([roleNames.ADMIN,roleNames.SALESMANAGER,roleNames.SALESPERSON]),
    leadController.getLeads
);

leadRouter.put(
    "/update-lead/:leadId",
    hasPermission([roleNames.ADMIN,roleNames.SALESPERSON,roleNames.SALESMANAGER]),
    bodySchemaValidator(LeadSchema),
    leadController.updateLead
);

leadRouter.get(
    "/get-lead/:leadId",
    hasPermission([roleNames.SALESPERSON,roleNames.ADMIN,roleNames.SALESMANAGER]),
    leadController.getLead
);

leadRouter.delete(
    "/delete-lead/:leadId",
    hasPermission([roleNames.ADMIN]),
    leadController.deleteLead
);

leadRouter.post(
    "/upload-excel-leads",
    hasPermission([roleNames.ADMIN]), 
    uploadFileUsingMulter,
    leadController.uploadLeadUsingExcel
)

leadRouter.post(
    "/bulk-delete",
    hasPermission([roleNames.ADMIN]),
    bodySchemaValidator(bulkDeleteSchema),
    leadController.bulkDeleteLead
)

//related view - get leads by contact Id
leadRouter.post(
    "/bycontact/:contactId",
    leadController.getLeadsByContactId
)

//related view - get leads by account Id
leadRouter.post(
    "/byaccount/:accountId",
    leadController.getLeadsByAccountId
)

leadRouter.put("/assign-by-type/:leadTitle",
    /**
     * @swagger
     * /lead/assign-by-type/{leadTitle}:
     *   put:
     *     summary: Assign all leads with the same title to a specific user
     *     tags: [Leads]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: leadTitle
     *         schema:
     *           type: string
     *         required: true
     *         description: Title of leads to be assigned
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - userId
     *             properties:
     *               userId:
     *                 type: string
     *                 description: ID of the user to assign as owner
     *     responses:
     *       200:
     *         description: Leads assigned successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *                 data:
     *                   type: object
     *                   properties:
     *                     affected:
     *                       type: number
     *                       description: Number of leads updated
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Server error
     */
    leadController.assignLeadsByTitle
)

export default leadRouter;