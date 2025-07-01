import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvailability1750941687728 implements MigrationInterface {
    name = 'AddAvailability1750941687728'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."doctor_first_name_trgm_idx"`);
        await queryRunner.query(`DROP INDEX "public"."doctor_last_name_trgm_idx"`);
        await queryRunner.query(`DROP INDEX "public"."doctor_specialization_trgm_idx"`);
        await queryRunner.query(`CREATE TABLE "doctor_time_slot" ("id" SERIAL NOT NULL, "availability_id" integer NOT NULL, "doctor_id" integer NOT NULL, "date" date NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "is_available" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ade5a566b70f84fa28dc289c12a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "doctor_availability" ("id" SERIAL NOT NULL, "doctor_id" integer NOT NULL, "date" date NOT NULL, "session" character varying NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3d2b4ffe9085f8c7f9f269aed89" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slot" ADD CONSTRAINT "FK_53d14be294f740ffde89940fafc" FOREIGN KEY ("availability_id") REFERENCES "doctor_availability"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" ADD CONSTRAINT "FK_2cc8d37cdcb4ecd1e726d6ed304" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_availability" DROP CONSTRAINT "FK_2cc8d37cdcb4ecd1e726d6ed304"`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slot" DROP CONSTRAINT "FK_53d14be294f740ffde89940fafc"`);
        await queryRunner.query(`DROP TABLE "doctor_availability"`);
        await queryRunner.query(`DROP TABLE "doctor_time_slot"`);
        await queryRunner.query(`CREATE INDEX "doctor_specialization_trgm_idx" ON "doctor" ("specialization") `);
        await queryRunner.query(`CREATE INDEX "doctor_last_name_trgm_idx" ON "doctor" ("last_name") `);
        await queryRunner.query(`CREATE INDEX "doctor_first_name_trgm_idx" ON "doctor" ("first_name") `);
    }

}
