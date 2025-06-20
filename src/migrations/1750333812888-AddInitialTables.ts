import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInitialTables1750333812888 implements MigrationInterface {
  name = 'AddInitialTables1750333812888';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "hashedRefreshToken" character varying`);
    await queryRunner.query(`UPDATE "user" SET "hashedRefreshToken" = '' WHERE "hashedRefreshToken" IS NULL`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "hashedRefreshToken" SET NOT NULL`);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "hashedRefreshToken"`);
  }
}
