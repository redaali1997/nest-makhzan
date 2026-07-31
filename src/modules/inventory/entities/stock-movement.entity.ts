import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StockItem } from './stock-item.entity';

export enum StockMovementReason {
  RECEIVED = 'received', // شحنة داخلة
  ORDER_ALLOCATED = 'order_allocated',
  ORDER_COMPENSATED = 'order_compensated',
  MANUAL_ADJUSTMENT = 'manual_adjustment',
}

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => StockItem, (stockItem) => stockItem.movements)
  stockItem: StockItem;

  @Column({ type: 'int' })
  delta: number;

  @Column({ type: 'enum', enum: StockMovementReason })
  reason: StockMovementReason;

  @Column({ nullable: true })
  orderId: number;

  @CreateDateColumn()
  createdAt: Date;
}
