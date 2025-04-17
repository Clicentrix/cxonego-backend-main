import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDocumentMetadataFields1744200000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create the enum type for document types
        await queryRunner.query(`
            CREATE TYPE "document_type_enum" AS ENUM (
                'NDA', 'MSA', 'SOW', 'SLA', 'AMC', 'MOU', 'OTHER'
            )
        `);

        // Add new columns to the document table
        await queryRunner.query(`
            ALTER TABLE "document" 
            ADD COLUMN "document_type" "document_type_enum",
            ADD COLUMN "custom_document_type" VARCHAR(255),
            ADD COLUMN "start_time" TIMESTAMP,
            ADD COLUMN "end_time" TIMESTAMP
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the new columns
        await queryRunner.query(`
            ALTER TABLE "document" 
            DROP COLUMN "document_type",
            DROP COLUMN "custom_document_type",
            DROP COLUMN "start_time",
            DROP COLUMN "end_time"
        `);

        // Drop the enum type
        await queryRunner.query(`DROP TYPE "document_type_enum"`);
    }
} 