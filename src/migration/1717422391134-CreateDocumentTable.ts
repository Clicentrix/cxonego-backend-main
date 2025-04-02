import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDocumentTable1717422391134 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "document" (
                "id" varchar(36) NOT NULL,
                "createdAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                "deletedAt" datetime NULL,
                "documentId" varchar(36) PRIMARY KEY NOT NULL,
                "fileName" varchar(255) NOT NULL,
                "fileType" varchar(100) NOT NULL,
                "googleDriveFileId" varchar(255) NOT NULL,
                "googleDriveLink" varchar(1000) NOT NULL,
                "description" text NULL,
                "contactId" varchar(36) NOT NULL,
                "uploadedById" varchar(36) NOT NULL,
                "organizationId" varchar(36) NULL,
                CONSTRAINT "FK_document_contact" FOREIGN KEY ("contactId") REFERENCES "contact" ("contactId") ON UPDATE CASCADE,
                CONSTRAINT "FK_document_user" FOREIGN KEY ("uploadedById") REFERENCES "user" ("userId") ON UPDATE CASCADE,
                CONSTRAINT "FK_document_organization" FOREIGN KEY ("organizationId") REFERENCES "organisation" ("organisationId") ON UPDATE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "document"`);
    }
} 