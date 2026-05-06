import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAdmin1746489600001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "users" ("name", "email", "password_hash", "role")
      VALUES ('Admin', 'admin@meetroom.com', '$2b$10$alG5/TUJNyaP.j3mkZ0RZ.RjaXYdIijlZ5FJ/iEDqHogyj1A0yrju', 'admin')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "users" WHERE "email" = 'admin@meetroom.com'`);
  }
}
