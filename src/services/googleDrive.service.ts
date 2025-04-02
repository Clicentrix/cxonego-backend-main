import { google, drive_v3 } from 'googleapis';
import * as dotenv from 'dotenv';

dotenv.config();

export class GoogleDriveService {
    private oauth2Client;
    private drive: drive_v3.Drive;

    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        this.drive = google.drive({
            version: 'v3',
            auth: this.oauth2Client
        });
    }

    getAuthUrl(): string {
        const scopes = [
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/userinfo.profile'
        ];

        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });
    }

    async setCredentials(code: string) {
        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);
        return tokens;
    }

    async uploadFile(fileBuffer: Buffer, mimeType: string, fileName: string) {
        try {
            // Create file in Drive
            const createResponse = await this.drive.files.create({
                requestBody: {
                    name: fileName,
                    mimeType: mimeType
                },
                media: {
                    mimeType: mimeType,
                    body: fileBuffer
                }
            });

            const fileId = createResponse.data.id;
            
            if (!fileId) {
                throw new Error('Failed to create file in Google Drive');
            }

            // Set file permissions
            await this.drive.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone'
                }
            });

            // Get the web view link
            const getResponse = await this.drive.files.get({
                fileId: fileId,
                fields: 'webViewLink'
            });

            return {
                fileId: fileId,
                webViewLink: getResponse.data.webViewLink
            };
        } catch (error) {
            console.error('Error uploading file to Google Drive:', error);
            throw error;
        }
    }
} 