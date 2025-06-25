import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInitialTables1750851037037 implements MigrationInterface {
    name = 'AddInitialTables1750851037037'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_provider_enum" AS ENUM('local', 'google')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "provider" "public"."user_provider_enum" NOT NULL DEFAULT 'local'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "provider"`);
        await queryRunner.query(`DROP TYPE "public"."user_provider_enum"`);
    }

}
