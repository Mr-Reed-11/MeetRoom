import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1746489600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "users_role_enum" AS ENUM ('admin', 'user')`,
    );
    await queryRunner.query(
      `CREATE TYPE "bookings_status_enum" AS ENUM ('active', 'cancelled')`,
    );

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"            UUID          NOT NULL DEFAULT gen_random_uuid(),
        "name"          VARCHAR(100)  NOT NULL,
        "email"         VARCHAR(150)  NOT NULL,
        "password_hash" VARCHAR(255)  NOT NULL,
        "role"          "users_role_enum" NOT NULL DEFAULT 'user',
        "created_at"    TIMESTAMPTZ   NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMPTZ   NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "rooms" (
        "id"          UUID          NOT NULL DEFAULT gen_random_uuid(),
        "name"        VARCHAR(100)  NOT NULL,
        "capacity"    INTEGER       NOT NULL,
        "location"    VARCHAR(200)  NOT NULL,
        "description" TEXT,
        "is_active"   BOOLEAN       NOT NULL DEFAULT true,
        "created_at"  TIMESTAMPTZ   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_rooms" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id"         UUID          NOT NULL DEFAULT gen_random_uuid(),
        "user_id"    UUID          NOT NULL,
        "room_id"    UUID          NOT NULL,
        "title"      VARCHAR(200)  NOT NULL,
        "start_time" TIMESTAMPTZ   NOT NULL,
        "end_time"   TIMESTAMPTZ   NOT NULL,
        "status"     "bookings_status_enum" NOT NULL DEFAULT 'active',
        "notes"      TEXT,
        "created_at" TIMESTAMPTZ   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bookings" PRIMARY KEY ("id"),
        CONSTRAINT "FK_bookings_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_bookings_room" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(`DROP TABLE "rooms"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "bookings_status_enum"`);
    await queryRunner.query(`DROP TYPE "users_role_enum"`);
  }
}
