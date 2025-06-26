import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvailability1750943808060 implements MigrationInterface {
    name = 'AddAvailability1750943808060'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_time_slot" RENAME COLUMN "doctor_id" TO "user_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_time_slot" RENAME COLUMN "user_id" TO "doctor_id"`);
    }

}
