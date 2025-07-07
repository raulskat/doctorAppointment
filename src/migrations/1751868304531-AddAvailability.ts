import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvailability1751868304531 implements MigrationInterface {
    name = 'AddAvailability1751868304531'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_time_slot" DROP COLUMN "max_bookings"`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slot" ADD "patients_per_slot" integer DEFAULT 3`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slot" ADD "slot_duration" integer NOT NULL DEFAULT 30`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_time_slot" DROP COLUMN "slot_duration"`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slot" DROP COLUMN "patients_per_slot"`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slot" ADD "max_bookings" integer NOT NULL DEFAULT '3'`);
    }
}
