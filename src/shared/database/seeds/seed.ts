import { Product } from 'src/modules/catalog/entities/product.entity';
import dataSource from '../data-source';
import { Warehouse } from 'src/modules/inventory/entities/warehouse.entity';
import { StockItem } from 'src/modules/inventory/entities/stock-item.entity';

async function seed() {
  await dataSource.initialize();

  await dataSource.transaction(async (manager) => {
    await manager.createQueryBuilder().delete().from(StockItem).execute();
    await manager.createQueryBuilder().delete().from(Product).execute();
    await manager.createQueryBuilder().delete().from(Warehouse).execute();

    const product = await manager.getRepository(Product).save({
      sku: 'RACE-TEST-001',
      name: 'Concurrency test item',
      currentPrice: '100.00',
    });
    const warehouse = await manager.getRepository(Warehouse).save({
      code: 'CAI-01',
      name: 'Cairo Main',
      priority: 1,
    });
    await manager.getRepository(StockItem).save({
      product,
      warehouse,
      quantityOnHand: 1,
    });
  });

  await dataSource.destroy();
  console.log('✅ Seed complete');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
