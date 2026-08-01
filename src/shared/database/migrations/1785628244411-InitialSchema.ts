import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1785628244411 implements MigrationInterface {
  name = 'InitialSchema1785628244411';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`warehouses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`priority\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_d8b96d60ff9a288f5ed862280d\` (\`code\`), UNIQUE INDEX \`IDX_69069e520f8aa3f117ac3226bc\` (\`priority\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`stock_movements\` (\`id\` int NOT NULL AUTO_INCREMENT, \`delta\` int NOT NULL, \`reason\` enum ('received', 'order_allocated', 'order_compensated', 'manual_adjustment') NOT NULL, \`orderId\` int NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`stockItemId\` int NOT NULL, INDEX \`IDX_db9fcb4c901068853d81ef374e\` (\`orderId\`), INDEX \`IDX_f915ad848e5b6e114bdcfe2182\` (\`stockItemId\`, \`createdAt\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`stock_items\` (\`id\` int NOT NULL AUTO_INCREMENT, \`quantityOnHand\` int UNSIGNED NOT NULL, \`version\` int NOT NULL DEFAULT '1', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`productId\` int NOT NULL, \`warehouseId\` int NOT NULL, UNIQUE INDEX \`IDX_4d037ebc35ca4cd4a394c9df54\` (\`productId\`, \`warehouseId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`products\` (\`id\` int NOT NULL AUTO_INCREMENT, \`sku\` varchar(64) NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` text NULL, \`currentPrice\` decimal(10,2) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_c44ac33a05b144dd0d9ddcf932\` (\`sku\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_movements\` ADD CONSTRAINT \`FK_f319e5ed7a01592d5f70e2386f5\` FOREIGN KEY (\`stockItemId\`) REFERENCES \`stock_items\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_items\` ADD CONSTRAINT \`FK_bbfb82762aee45829f290ef3381\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_items\` ADD CONSTRAINT \`FK_8ec4e307da0a3f7fb3ad3c24f1e\` FOREIGN KEY (\`warehouseId\`) REFERENCES \`warehouses\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`stock_items\` DROP FOREIGN KEY \`FK_8ec4e307da0a3f7fb3ad3c24f1e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_items\` DROP FOREIGN KEY \`FK_bbfb82762aee45829f290ef3381\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_movements\` DROP FOREIGN KEY \`FK_f319e5ed7a01592d5f70e2386f5\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_c44ac33a05b144dd0d9ddcf932\` ON \`products\``,
    );
    await queryRunner.query(`DROP TABLE \`products\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_4d037ebc35ca4cd4a394c9df54\` ON \`stock_items\``,
    );
    await queryRunner.query(`DROP TABLE \`stock_items\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_f915ad848e5b6e114bdcfe2182\` ON \`stock_movements\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_db9fcb4c901068853d81ef374e\` ON \`stock_movements\``,
    );
    await queryRunner.query(`DROP TABLE \`stock_movements\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_69069e520f8aa3f117ac3226bc\` ON \`warehouses\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_d8b96d60ff9a288f5ed862280d\` ON \`warehouses\``,
    );
    await queryRunner.query(`DROP TABLE \`warehouses\``);
  }
}
