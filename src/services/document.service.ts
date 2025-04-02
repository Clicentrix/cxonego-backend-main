import { AppDataSource } from "../data-source";
import { Document } from "../entity/Document";
import { Contact } from "../entity/Contact";
import { User } from "../entity/User";
import { GoogleDriveService } from "./googleDrive.service";
import { Not, IsNull } from "typeorm";
import { roleNames } from "../common/utils";

export class DocumentService {
    private documentRepository = AppDataSource.getRepository(Document);
    private contactRepository = AppDataSource.getRepository(Contact);
    private userRepository = AppDataSource.getRepository(User);
    private googleDriveService = new GoogleDriveService();

    async getAuthUrl() {
        return this.googleDriveService.getAuthUrl();
    }

    async handleGoogleCallback(code: string) {
        return await this.googleDriveService.setCredentials(code);
    }

    async uploadDocument(
        file: Express.Multer.File,
        contactId: string,
        userId: string,
        description?: string
    ) {
        const contact = await this.contactRepository.findOne({ where: { contactId } });
        if (!contact) {
            throw new Error('Contact not found');
        }

        const user = await this.userRepository.findOne({ where: { userId } });
        if (!user) {
            throw new Error('User not found');
        }

        // Check if user belongs to the same organization as the contact
        if (contact.organization?.organisationId !== user.organisation?.organisationId) {
            throw new Error('Unauthorized to upload document for this contact');
        }

        // Create file in Drive
        const { fileId, webViewLink } = await this.googleDriveService.uploadFile(
            file.buffer,
            file.mimetype,
            file.originalname
        );

        // Create document record with payload
        const documentData: any = {
            fileName: file.originalname,
            fileType: file.mimetype,
            googleDriveFileId: fileId,
            googleDriveLink: webViewLink,
            contact: contact,
            uploadedBy: user
        };

        // Add organization if available
        if (user.organisation) {
            documentData.organization = user.organisation;
        }

        // Only add description if provided
        if (description) {
            documentData.description = description;
        }

        const document = new Document(documentData);
        return await this.documentRepository.save(document);
    }

    async getDocumentsByContact(contactId: string, userId: string) {
        // Get the user with roles
        const user = await this.userRepository.findOne({
            where: { userId },
            relations: ['roles', 'organisation']
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Get the contact with organization
        const contact = await this.contactRepository.findOne({
            where: { contactId },
            relations: ['organization']
        });

        if (!contact) {
            throw new Error('Contact not found');
        }

        // Check if user and contact belong to the same organization
        if (contact.organization?.organisationId !== user.organisation?.organisationId) {
            throw new Error('Unauthorized to access documents for this contact');
        }

        // Check if user is an organization owner/admin
        const isAdmin = user.roles.some(role => role.roleName === roleNames.ADMIN);

        if (isAdmin) {
            // Organization owners can see all documents for the contact
            return await this.documentRepository.find({
                where: {
                    contact: { contactId },
                    deletedAt: IsNull()
                },
                relations: ['uploadedBy']
            });
        } else {
            // Regular users can only see documents they uploaded
            return await this.documentRepository.find({
                where: {
                    contact: { contactId },
                    uploadedBy: { userId },
                    deletedAt: IsNull()
                },
                relations: ['uploadedBy']
            });
        }
    }

    async getAllOrganizationDocuments(userId: string) {
        // Get the user with roles and organization
        const user = await this.userRepository.findOne({
            where: { userId },
            relations: ['roles', 'organisation']
        });

        if (!user) {
            throw new Error('User not found');
        }

        if (!user.organisation) {
            throw new Error('User does not belong to any organization');
        }

        // Check if user is an organization owner/admin
        const isAdmin = user.roles.some(role => role.roleName === roleNames.ADMIN);

        if (!isAdmin) {
            throw new Error('Only organization admins can access all documents');
        }

        // Get all documents for the organization
        return await this.documentRepository.find({
            where: {
                organization: { organisationId: user.organisation.organisationId },
                deletedAt: IsNull()
            },
            relations: ['uploadedBy', 'contact']
        });
    }

    async getUserDocuments(userId: string) {
        // Get documents uploaded by the user
        return await this.documentRepository.find({
            where: {
                uploadedBy: { userId },
                deletedAt: IsNull()
            },
            relations: ['contact']
        });
    }

    async deleteDocument(documentId: string, userId: string) {
        // Get the user with roles
        const user = await this.userRepository.findOne({
            where: { userId },
            relations: ['roles']
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Get the document with uploader
        const document = await this.documentRepository.findOne({
            where: { documentId },
            relations: ['uploadedBy', 'organization']
        });

        if (!document) {
            throw new Error('Document not found');
        }

        // Check if user is an admin or the uploader
        const isAdmin = user.roles.some(role => role.roleName === roleNames.ADMIN);
        const isUploader = document.uploadedBy.userId === userId;

        // Only allow deletion if user is admin or uploader
        if (!isAdmin && !isUploader) {
            throw new Error('Unauthorized to delete this document');
        }

        // Soft delete the document
        document.deletedAt = new Date();
        return await this.documentRepository.save(document);
    }
} 