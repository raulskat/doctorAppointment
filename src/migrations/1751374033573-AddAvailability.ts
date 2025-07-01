import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvailability1751374033573 implements MigrationInterface {
    name = 'AddAvailability1751374033573'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "doctor_time_slot" ("id" SERIAL NOT NULL, "availability_id" integer NOT NULL, "user_id" integer NOT NULL, "date" date NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "is_available" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ade5a566b70f84fa28dc289c12a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "doctor_availability" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "date" date NOT NULL, "session" character varying NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3d2b4ffe9085f8c7f9f269aed89" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "doctor" ("user_id" integer NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "phone_number" character varying NOT NULL, "specialization" character varying NOT NULL, "experience_years" integer NOT NULL, "education" text NOT NULL, "clinic_name" character varying NOT NULL, "clinic_address" text NOT NULL, "available_days" character varying NOT NULL, "available_time_slots" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a685e79dc974f768c39e5d12281" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."patient_gender_enum" AS ENUM('male', 'female', 'other')`);
        await queryRunner.query(`CREATE TABLE "patient" ("user_id" integer NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "phone_number" character varying NOT NULL, "gender" "public"."patient_gender_enum" NOT NULL, "dob" date NOT NULL, "address" text NOT NULL, "emergency_contact" character varying NOT NULL, "medical_history" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f20f0bf6b734938c710e12c2782" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_provider_enum" AS ENUM('local', 'google')`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('doctor', 'patient', 'admin')`);
        await queryRunner.query(`CREATE TABLE "user" ("provider" "public"."user_provider_enum" NOT NULL DEFAULT 'local', "user_id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying, "role" "public"."user_role_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "last_login" TIMESTAMP NOT NULL DEFAULT NOW(), "hashedRefreshToken" text, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_758b8ce7c18b9d347461b30228d" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slot" ADD CONSTRAINT "FK_53d14be294f740ffde89940fafc" FOREIGN KEY ("availability_id") REFERENCES "doctor_availability"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" ADD CONSTRAINT "FK_98e72d0e8e02c8bf9126f71ff11" FOREIGN KEY ("user_id") REFERENCES "doctor"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD CONSTRAINT "FK_a685e79dc974f768c39e5d12281" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient" ADD CONSTRAINT "FK_f20f0bf6b734938c710e12c2782" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

await queryRunner.query(`
  CREATE INDEX IF NOT EXISTS doctor_first_name_trgm_idx
  ON doctor USING gin (first_name gin_trgm_ops)
`);

await queryRunner.query(`
  CREATE INDEX IF NOT EXISTS doctor_last_name_trgm_idx
  ON doctor USING gin (last_name gin_trgm_ops)
`);

await queryRunner.query(`
  CREATE INDEX IF NOT EXISTS doctor_specialization_trgm_idx
  ON doctor USING gin (specialization gin_trgm_ops)
`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS doctor_specialization_trgm_idx`);
await queryRunner.query(`DROP INDEX IF EXISTS doctor_last_name_trgm_idx`);
await queryRunner.query(`DROP INDEX IF EXISTS doctor_first_name_trgm_idx`);
await queryRunner.query(`DROP EXTENSION IF EXISTS pg_trgm`);

        await queryRunner.query(`ALTER TABLE "patient" DROP CONSTRAINT "FK_f20f0bf6b734938c710e12c2782"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP CONSTRAINT "FK_a685e79dc974f768c39e5d12281"`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" DROP CONSTRAINT "FK_98e72d0e8e02c8bf9126f71ff11"`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slot" DROP CONSTRAINT "FK_53d14be294f740ffde89940fafc"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_provider_enum"`);
        await queryRunner.query(`DROP TABLE "patient"`);
        await queryRunner.query(`DROP TYPE "public"."patient_gender_enum"`);
        await queryRunner.query(`DROP TABLE "doctor"`);
        await queryRunner.query(`DROP TABLE "doctor_availability"`);
        await queryRunner.query(`DROP TABLE "doctor_time_slot"`);
    }

}
