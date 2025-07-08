import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvailability1751953833099 implements MigrationInterface {
    name = 'AddAvailability1751953833099'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_time_slot" ADD "booking_start_time" TIME`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slot" ADD "booking_end_time" TIME`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_time_slot" DROP COLUMN "booking_end_time"`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slot" DROP COLUMN "booking_start_time"`);
    }

}
