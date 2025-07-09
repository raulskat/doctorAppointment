import { MigrationInterface, QueryRunner } from "typeorm";

export class SetAppointmentType1752039901109 implements MigrationInterface {
    name = 'SetAppointmentType1752039901109'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."appointment_status_enum" AS ENUM('booked', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "status" "public"."appointment_status_enum" NOT NULL DEFAULT 'booked'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."appointment_status_enum"`);
    }

}
