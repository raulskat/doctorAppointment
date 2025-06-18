import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInitialTables1750261873670 implements MigrationInterface {
    name = 'AddInitialTables1750261873670'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "hashedRefreshToken" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "hashedRefreshToken"`);
    }

}
