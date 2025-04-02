import { Request, Response } from "express";
import { DocumentService } from "../services/document.service";
import { buildResponse } from "../common/utils";

// Extend the Request type to include user property
interface ExtendedRequest extends Request {
    user?: {
        userId: string;
    };
}

export class DocumentController {
    private documentService = new DocumentService();

    async getGoogleAuthUrl(_req: Request, res: Response) {
        try {
            const authUrl = await this.documentService.getAuthUrl();
            return res.status(200).json(buildResponse(authUrl, "Google auth URL generated successfully"));
        } catch (error) {
            return res.status(500).json(buildResponse("", "Failed to get auth URL", error));
        }
    }

    async handleGoogleCallback(req: Request, res: Response) {
        try {
            const { code } = req.query;
            if (!code || typeof code !== 'string') {
                return res.status(400).json(buildResponse("", "Invalid code"));
            }

            const tokens = await this.documentService.handleGoogleCallback(code);
            return res.status(200).json(buildResponse(tokens, "Google authentication successful"));
        } catch (error) {
            return res.status(500).json(buildResponse("", "Failed to handle Google callback", error));
        }
    }

    async uploadDocument(req: ExtendedRequest, res: Response) {
        try {
            const { contactId } = req.params;
            const { description } = req.body;
            const userId = req.user?.userId;

            if (!req.file) {
                return res.status(400).json(buildResponse("", "No file uploaded"));
            }

            if (!userId) {
                return res.status(401).json(buildResponse("", "Unauthorized"));
            }

            const document = await this.documentService.uploadDocument(
                req.file,
                contactId,
                userId,
                description
            );

            return res.status(201).json(buildResponse(document, "Document uploaded successfully"));
        } catch (error) {
            return res.status(500).json(buildResponse("", "Failed to upload document", error));
        }
    }

    async getDocumentsByContact(req: ExtendedRequest, res: Response) {
        try {
            const { contactId } = req.params;
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json(buildResponse("", "Unauthorized"));
            }

            const documents = await this.documentService.getDocumentsByContact(contactId, userId);
            return res.status(200).json(buildResponse(documents, "Documents retrieved successfully"));
        } catch (error) {
            return res.status(500).json(buildResponse("", "Failed to get documents", error));
        }
    }

    async getAllOrganizationDocuments(req: ExtendedRequest, res: Response) {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json(buildResponse("", "Unauthorized"));
            }

            const documents = await this.documentService.getAllOrganizationDocuments(userId);
            return res.status(200).json(buildResponse(documents, "Organization documents retrieved successfully"));
        } catch (error) {
            return res.status(500).json(buildResponse("", "Failed to get organization documents", error));
        }
    }

    async getUserDocuments(req: ExtendedRequest, res: Response) {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json(buildResponse("", "Unauthorized"));
            }

            const documents = await this.documentService.getUserDocuments(userId);
            return res.status(200).json(buildResponse(documents, "User documents retrieved successfully"));
        } catch (error) {
            return res.status(500).json(buildResponse("", "Failed to get user documents", error));
        }
    }

    async deleteDocument(req: ExtendedRequest, res: Response) {
        try {
            const { documentId } = req.params;
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json(buildResponse("", "Unauthorized"));
            }

            const document = await this.documentService.deleteDocument(documentId, userId);
            return res.status(200).json(buildResponse(document, "Document deleted successfully"));
        } catch (error) {
            return res.status(500).json(buildResponse("", "Failed to delete document", error));
        }
    }
} 