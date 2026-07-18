import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookings1784304689936 implements MigrationInterface {
  name = 'CreateBookings1784304689936';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "date" TIMESTAMP WITH TIME ZONE NOT NULL, "totalSeats" integer NOT NULL, "availableSeats" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "booking" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_49171efc69702ed84c812f33540" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "booking_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bookingId" uuid NOT NULL, "eventId" uuid NOT NULL, "quantity" integer NOT NULL, CONSTRAINT "UQ_c65699fc9cb3fe8e790a9cc14b5" UNIQUE ("bookingId", "eventId"), CONSTRAINT "PK_5f00cae6b1d793669a01d03df5d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking" ADD CONSTRAINT "FK_336b3f4a235460dc93645fbf222" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_item" ADD CONSTRAINT "FK_9faafa553fc2800ecd63392aedc" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_item" ADD CONSTRAINT "FK_03c99a1c233c4430da362fd5c1d" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "CHK_event_available_seats" CHECK ("availableSeats" >= 0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_item" ADD CONSTRAINT "CHK_booking_item_quantity" CHECK ("quantity" BETWEEN 1 AND 3)`,
    );
    await queryRunner.query(`INSERT INTO "event" ("name", "description", "date", "totalSeats", "availableSeats") VALUES
            ('Concerto Rock Arena', 'Live band internazionale', now() + interval '30 days', 100, 100),
            ('Festival Jazz in Piazza', 'Serata jazz all''aperto', now() + interval '45 days', 50, 50),
            ('Stand-up Comedy Night', 'Comici emergenti sul palco', now() + interval '15 days', 30, 30),
            ('Teatro: La Tempesta', 'Classico shakespeariano', now() + interval '60 days', 80, 80),
            ('Workshop Fotografia', 'Posti limitatissimi', now() + interval '7 days', 3, 3)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "booking_item" DROP CONSTRAINT "FK_03c99a1c233c4430da362fd5c1d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_item" DROP CONSTRAINT "FK_9faafa553fc2800ecd63392aedc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking" DROP CONSTRAINT "FK_336b3f4a235460dc93645fbf222"`,
    );
    await queryRunner.query(`DROP TABLE "booking_item"`);
    await queryRunner.query(`DROP TABLE "booking"`);
    await queryRunner.query(`DROP TABLE "event"`);
  }
}
