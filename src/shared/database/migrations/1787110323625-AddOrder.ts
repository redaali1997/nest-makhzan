import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrder1787110323625 implements MigrationInterface {
  name = 'AddOrder1787110323625';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`idempotency_keys\` (\`id\` int NOT NULL AUTO_INCREMENT, \`idempotency_key\` varchar(128) NOT NULL, \`endpoint\` varchar(64) NOT NULL, \`responseBody\` json NULL, \`responseStatus\` int NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_ed54d24d0a06a229a5a4934ea7\` (\`endpoint\`, \`idempotency_key\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`orders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`customerId\` int NOT NULL, \`status\` enum ('pending_payment', 'paid', 'payment_failed', 'shipped', 'cancelled') NOT NULL DEFAULT 'pending_payment', \`totalAmount\` decimal(10,2) UNSIGNED NOT NULL, \`version\` int NOT NULL DEFAULT '1', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_775c9f06fc27ae3ff8fb26f2c4\` (\`status\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`order_items\` (\`id\` int NOT NULL AUTO_INCREMENT, \`productId\` int UNSIGNED NOT NULL, \`productName\` varchar(255) NOT NULL, \`productSku\` varchar(255) NOT NULL, \`unitPrice\` decimal(10,2) UNSIGNED NOT NULL, \`quantity\` int UNSIGNED NOT NULL, \`orderId\` int NOT NULL, INDEX \`IDX_f1d359a55923bb45b057fbdab0\` (\`orderId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_f1d359a55923bb45b057fbdab0d\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_f1d359a55923bb45b057fbdab0d\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_f1d359a55923bb45b057fbdab0\` ON \`order_items\``,
    );
    await queryRunner.query(`DROP TABLE \`order_items\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_775c9f06fc27ae3ff8fb26f2c4\` ON \`orders\``,
    );
    await queryRunner.query(`DROP TABLE \`orders\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_ed54d24d0a06a229a5a4934ea7\` ON \`idempotency_keys\``,
    );
    await queryRunner.query(`DROP TABLE \`idempotency_keys\``);
  }
}
