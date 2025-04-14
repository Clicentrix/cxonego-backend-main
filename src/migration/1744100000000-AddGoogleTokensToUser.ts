import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGoogleTokensToUser1744100000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" 
            ADD COLUMN "googleTokens" JSON NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" 
            DROP COLUMN "googleTokens"
        `);
    }
} 