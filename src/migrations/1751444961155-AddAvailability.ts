import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvailability1751444961155 implements MigrationInterface {
    name = 'AddAvailability1751444961155'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "appointment" ("id" SERIAL NOT NULL, "doctor_user_id" integer NOT NULL, "patient_user_id" integer NOT NULL, "slot_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e8be1a53027415e709ce8a2db74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slot" ADD "booked_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slot" ADD "max_bookings" integer NOT NULL DEFAULT '3'`);
        await queryRunner.query(`CREATE TYPE "public"."doctor_schedule_type_enum" AS ENUM('stream', 'wave')`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD "schedule_Type" "public"."doctor_schedule_type_enum" NOT NULL DEFAULT 'stream'`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_9f9596ccb3fe8e63358d9bfcbdb" FOREIGN KEY ("slot_id") REFERENCES "doctor_time_slot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_9f9596ccb3fe8e63358d9bfcbdb"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "schedule_Type"`);
        await queryRunner.query(`DROP TYPE "public"."doctor_schedule_type_enum"`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slot" DROP COLUMN "max_bookings"`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slot" DROP COLUMN "booked_count"`);
        await queryRunner.query(`DROP TABLE "appointment"`);
    }

}
