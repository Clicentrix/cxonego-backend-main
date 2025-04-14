import { Request, Response } from "express";
import { DocumentService } from "../services/document.service";
import { buildResponse } from "../common/utils";

// Extend the Request type to include user property
interface ExtendedRequest extends Request {
    user?: {
        userId: string;
        organizationId: string;
    };
}

export class DocumentController {
    private documentService = new DocumentService();

    async getGoogleAuthUrl(req: ExtendedRequest, res: Response) {
        try {
            // Get userId from either request.user or query parameter
            let userId = req.user?.userId;
            
            // If userId not in authentication, check query parameter
            if (!userId && req.query.userId) {
                userId = req.query.userId as string;
                console.log(`Using userId from query parameter for auth URL: ${userId}`);
            }
            
            // Generate auth URL with userId if available
            const authUrl = await this.documentService.getAuthUrl(userId);
            
            console.log(`Generated Google auth URL ${userId ? 'with' : 'without'} user ID`);
            return res.status(200).json(buildResponse(authUrl, "Google auth URL generated successfully"));
        } catch (error) {
            return res.status(500).json(buildResponse("", "Failed to get auth URL", error));
        }
    }

    async handleGoogleCallback(req: ExtendedRequest, res: Response) {
        try {
            const { code, state } = req.query;
            // Try to get userId from request, or use state parameter as fallback
            let userId = req.user?.userId;
            
            console.log("Google callback received with:", { 
                hasCode: !!code, 
                hasState: !!state,
                userAuthenticated: !!userId
            });
            
            if (!userId && state && typeof state === 'string') {
                userId = state;
                console.log("Using state as userId:", userId);
            }
            
            if (!code || typeof code !== 'string') {
                console.error("Missing or invalid code in Google callback");
                return res.status(400).json(buildResponse("", "Invalid code"));
            }

            if (!userId) {
                console.error("No userId available in callback - authentication will not be saved to a user");
            }

            // Store tokens in the database if user is authenticated
            const tokens = await this.documentService.handleGoogleCallback(code, userId);
            console.log("Google authentication successful, tokens retrieved");
            
            // If the frontend URL is configured, redirect there with a success parameter
            if (process.env.FRONTEND_URL) {
                const redirectUrl = `${process.env.FRONTEND_URL}/auth-success?provider=google${userId ? `&userId=${userId}` : ''}`;
                console.log("Redirecting to:", redirectUrl);
                return res.redirect(redirectUrl);
            }
            
            return res.status(200).json(buildResponse(tokens, "Google authentication successful"));
        } catch (error) {
            console.error("Error handling Google callback:", error);
            
            // If frontend URL is configured, redirect with error
            if (process.env.FRONTEND_URL) {
                return res.redirect(`${process.env.FRONTEND_URL}/auth-error?provider=google&error=${encodeURIComponent(error.message)}`);
            }
            
            return res.status(500).json(buildResponse("", "Failed to handle Google callback", error));
        }
    }

    async checkGoogleConnection(req: ExtendedRequest, res: Response) {
        try {
            console.log(`Google connection check requested from path: ${req.path}`);
            console.log(`Query parameters:`, req.query);
            console.log(`User from request:`, req.user ? { userId: req.user.userId } : 'No authenticated user');
            
            // Get userId from either request.user or query parameter
            let userId = req.user?.userId;
            
            // If userId not in authentication, check query parameter
            if (!userId && req.query.userId) {
                userId = req.query.userId as string;
                console.log(`Using userId from query parameter: ${userId}`);
            }
            
            if (!userId) {
                console.log('ERROR: No userId provided in request');
                return res.status(401).json(buildResponse("", "Unauthorized - No user ID provided"));
            }
            
            console.log(`Checking Google connection for user: ${userId}`);
            const isConnected = await this.documentService.isUserConnectedToGoogle(userId);
            console.log(`Connection check result for ${userId}: ${isConnected}`);
            
            // Return a simple and consistent response structure
            return res.status(200).json(buildResponse(
                { connected: isConnected }, 
                isConnected ? "User is connected to Google Drive" : "User is not connected to Google Drive"
            ));
        } catch (error) {
            console.error("Failed to check Google connection:", error);
            return res.status(500).json(buildResponse("", "Failed to check Google connection", error));
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
            if (error.message === 'User not connected to Google Drive. Please authenticate first.') {
                const userId = req.user?.userId;
                return res.status(403).json(buildResponse({ 
                    needsGoogleAuth: true,
                    authUrl: await this.documentService.getAuthUrl(userId)
                }, error.message));
            }
            
            return res.status(500).json(buildResponse("", "Failed to upload document", error));
        }
    }

    async getDocumentsByContact(req: ExtendedRequest, res: Response) {
        try {
            const contactId = req.params.contactId;
            if (!contactId) {
                return res.status(400).json(buildResponse("", "Contact id is required"));
            }

            // Extract pagination and search parameters
            let page = Number(req.query.page) || 1;
            let limit = Number(req.query.limit) || 10;
            const search = req.query.search as string;
            let createdAt = req.query.createdAt as string;
            let updatedAt = req.query.updatedAt as string;
            
            // Get user information for permissions
            const userId = req.user?.userId;
            const organizationId = req.user?.organizationId;
            
            if (!userId) {
                return res.status(401).json(buildResponse("", "Unauthorized"));
            }
            
            console.log("contactId is this:", contactId);
            console.log("userId is this:", userId);
            console.log("Pagination:", { page, limit });
            console.log("Search:", search);
            console.log("Date filters:", { createdAt, updatedAt });

            // Get documents with pagination
            const documents = await this.documentService.getDocumentsByContact(
                contactId, 
                userId, 
                page, 
                limit,
                search,
                createdAt,
                updatedAt
            );
            
            console.log("documents is this:", documents);

            // Return appropriate response based on results
            if (!documents.data || documents.data.length === 0) {
                return res.status(200).json(buildResponse({ 
                    data: [],
                    pagination: documents.pagination
                }, "No documents found"));
            }
            
            return res.status(200).json(buildResponse(documents, "Documents retrieved successfully"));
        } catch (error) {
            console.error("Error getting documents by contact:", error);
            return res.status(500).json(buildResponse("", "Failed to get documents", error));
        }
    }

    async getAllOrganizationDocuments(req: ExtendedRequest, res: Response) {
        try {
            const userId = req.user?.userId;
            
            // Extract pagination parameters
            let page = Number(req.query.page) || 1;
            let limit = Number(req.query.limit) || 10;
            const search = req.query.search as string;
            let createdAt = req.query.createdAt as string;
            let updatedAt = req.query.updatedAt as string;

            if (!userId) {
                return res.status(401).json(buildResponse("", "Unauthorized"));
            }

            const documents = await this.documentService.getAllOrganizationDocuments(
                userId, 
                page, 
                limit,
                search,
                createdAt,
                updatedAt
            );
            
            console.log("documents is this:", documents);
            
            // Return appropriate response based on results
            if (!documents.data || documents.data.length === 0) {
                return res.status(200).json(buildResponse({ 
                    data: [],
                    pagination: documents.pagination
                }, "No organization documents found"));
            }
            
            return res.status(200).json(buildResponse(documents, "Organization documents retrieved successfully"));
        } catch (error) {
            return res.status(500).json(buildResponse("", "Failed to get organization documents", error));
        }
    }

    async getUserDocuments(req: ExtendedRequest, res: Response) {
        try {
            const userId = req.user?.userId;
            
            // Extract pagination parameters
            let page = Number(req.query.page) || 1;
            let limit = Number(req.query.limit) || 10;
            const search = req.query.search as string;
            let createdAt = req.query.createdAt as string;
            let updatedAt = req.query.updatedAt as string;

            if (!userId) {
                return res.status(401).json(buildResponse("", "Unauthorized"));
            }

            const documents = await this.documentService.getUserDocuments(
                userId, 
                page, 
                limit,
                search,
                createdAt,
                updatedAt
            );
            
            console.log("documents is this:", documents);
            
            // Return appropriate response based on results
            if (!documents.data || documents.data.length === 0) {
                return res.status(200).json(buildResponse({ 
                    data: [],
                    pagination: documents.pagination
                }, "No documents found"));
            }

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

    async forceGoogleReconnect(req: ExtendedRequest, res: Response) {
        try {
            // Get userId from either request.user or query parameter
            let userId = req.user?.userId;
            
            // If userId not in authentication, check query parameter
            if (!userId && req.query.userId) {
                userId = req.query.userId as string;
                console.log(`Using userId from query parameter for force reconnect: ${userId}`);
            }
            
            if (!userId) {
                return res.status(401).json(buildResponse("", "Unauthorized - No user ID provided"));
            }
            
            // We'll pass a special parameter to force consent screen
            const authUrl = await this.documentService.getForceReconnectUrl(userId);
            
            return res.status(200).json(buildResponse(authUrl, "Google reconnect URL generated successfully"));
        } catch (error) {
            return res.status(500).json(buildResponse("", "Failed to get reconnect URL", error));
        }
    }
} 