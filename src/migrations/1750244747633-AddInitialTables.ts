import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInitialTables1750244747633 implements MigrationInterface {
    name = 'AddInitialTables1750244747633'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "last_login" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "last_login" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "last_login" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "last_login" SET NOT NULL`);
    }

}
