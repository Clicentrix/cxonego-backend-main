import { Router } from "express";
import { DocumentController } from "../controllers/document.controller";
import * as multer from "multer";

const router = Router();
const documentController = new DocumentController();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

/**
 * @swagger
 * /api/v1/document/auth/google:
 *   get:
 *     tags:
 *       - Documents
 *     summary: Get Google Drive authentication URL
 *     description: Returns a URL for Google Drive authentication
 *     responses:
 *       200:
 *         description: Authentication URL generated successfully
 *       500:
 *         description: Failed to generate auth URL
 */
router.get("/auth/google", documentController.getGoogleAuthUrl.bind(documentController));

/**
 * @swagger
 * /api/v1/document/auth/google/callback:
 *   get:
 *     tags:
 *       - Documents
 *     summary: Handle Google Drive authentication callback
 *     description: Process the callback from Google Drive authentication
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Authorization code from Google
 *     responses:
 *       200:
 *         description: Authentication successful
 *       400:
 *         description: Invalid code
 *       500:
 *         description: Failed to authenticate
 */
router.get("/auth/google/callback", documentController.handleGoogleCallback.bind(documentController));

/**
 * @swagger
 * /api/v1/document/upload/{contactId}:
 *   post:
 *     tags:
 *       - Documents
 *     summary: Upload a document for a contact
 *     description: Upload a file to Google Drive and associate with a contact
 *     parameters:
 *       - in: path
 *         name: contactId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the contact
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *               description:
 *                 type: string
 *                 description: Description of the document
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to upload document
 */
router.post(
    "/upload/:contactId",
    upload.single('file'),
    documentController.uploadDocument.bind(documentController)
);

/**
 * @swagger
 * /api/v1/document/contact/{contactId}:
 *   get:
 *     tags:
 *       - Documents
 *     summary: Get all documents for a contact
 *     description: Retrieves all documents associated with a contact. If user is admin, gets all documents. Otherwise, gets only documents uploaded by the user.
 *     parameters:
 *       - in: path
 *         name: contactId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the contact
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to get documents
 */
router.get(
    "/contact/:contactId",
    documentController.getDocumentsByContact.bind(documentController)
);

/**
 * @swagger
 * /api/v1/document/organization:
 *   get:
 *     tags:
 *       - Documents
 *     summary: Get all documents for the organization
 *     description: Retrieves all documents in the organization. Only accessible by organization admins.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organization documents retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to get organization documents
 */
router.get(
    "/organization",
    documentController.getAllOrganizationDocuments.bind(documentController)
);

/**
 * @swagger
 * /api/v1/document/user:
 *   get:
 *     tags:
 *       - Documents
 *     summary: Get all documents uploaded by the user
 *     description: Retrieves all documents uploaded by the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User documents retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to get user documents
 */
router.get(
    "/user",
    documentController.getUserDocuments.bind(documentController)
);

/**
 * @swagger
 * /api/v1/document/{documentId}:
 *   delete:
 *     tags:
 *       - Documents
 *     summary: Delete a document
 *     description: Soft delete a document (mark as deleted). Organization admins can delete any document, while regular users can only delete documents they uploaded.
 *     parameters:
 *       - in: path
 *         name: documentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the document to delete
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to delete document
 */
router.delete(
    "/:documentId",
    documentController.deleteDocument.bind(documentController)
);

export default router; 