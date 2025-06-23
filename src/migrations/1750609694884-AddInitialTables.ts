import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInitialTables1750609694884 implements MigrationInterface {
    name = 'AddInitialTables1750609694884'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "provider"`);
        await queryRunner.query(`CREATE TYPE "public"."user_provider_enum" AS ENUM('local', 'google')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "provider" "public"."user_provider_enum" NOT NULL DEFAULT 'local'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "provider"`);
        await queryRunner.query(`DROP TYPE "public"."user_provider_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "provider" character varying DEFAULT 'local'`);
    }

}
