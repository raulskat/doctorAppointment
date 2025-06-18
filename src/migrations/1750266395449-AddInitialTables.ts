import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInitialTables1750266395449 implements MigrationInterface {
    name = 'AddInitialTables1750266395449'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "hashedRefreshToken"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "hashedRefreshToken" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "hashedRefreshToken"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "hashedRefreshToken" character varying`);
    }

}
