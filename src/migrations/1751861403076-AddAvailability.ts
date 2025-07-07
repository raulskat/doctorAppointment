import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvailability1751861403076 implements MigrationInterface {
    name = 'AddAvailability1751861403076'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" ADD "reporting_time" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "scheduled_on" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "scheduled_on"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "reporting_time"`);
    }

}
