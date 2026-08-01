import { Product } from '../../modules/catalog/entities/product.entity';
import { StockItem } from '../../modules/inventory/entities/stock-item.entity';
import { StockMovement } from '../../modules/inventory/entities/stock-movement.entity';
import { Warehouse } from '../../modules/inventory/entities/warehouse.entity';
import { DataSourceOptions } from 'typeorm';

export const buildDataSourceOptions = (opts: {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}): DataSourceOptions => ({
  type: 'mysql',
  ...opts,
  entities: [Product, StockItem, StockMovement, Warehouse],
  migrations: [__dirname + '/shared/database/migrations/*{.ts,.js}'],
  synchronize: false,
  migrationsRun: false,
});
