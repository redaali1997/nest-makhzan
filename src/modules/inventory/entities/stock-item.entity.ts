import { Product } from '../../catalog/entities/product.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { StockMovement } from './stock-movement.entity';

@Entity('stock_items')
@Index(['product', 'warehouse'], { unique: true })
export class StockItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.stockItems, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  product: Product;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.stockItems, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  warehouse: Warehouse;

  @Column({ type: 'int', unsigned: true })
  quantityOnHand: number;

  @VersionColumn({ default: 1 })
  version: number;

  @OneToMany(() => StockMovement, (movements) => movements.stockItem)
  movements: StockMovement[];
}
