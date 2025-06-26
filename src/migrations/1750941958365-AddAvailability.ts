import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvailability1750941958365 implements MigrationInterface {
    name = 'AddAvailability1750941958365'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_availability" DROP CONSTRAINT "FK_2cc8d37cdcb4ecd1e726d6ed304"`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" RENAME COLUMN "doctor_id" TO "user_id"`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" ADD CONSTRAINT "FK_98e72d0e8e02c8bf9126f71ff11" FOREIGN KEY ("user_id") REFERENCES "doctor"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_availability" DROP CONSTRAINT "FK_98e72d0e8e02c8bf9126f71ff11"`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" RENAME COLUMN "user_id" TO "doctor_id"`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" ADD CONSTRAINT "FK_2cc8d37cdcb4ecd1e726d6ed304" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
