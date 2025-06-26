import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPgTrgmAndDoctorIndexes1750923508545 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }
}
