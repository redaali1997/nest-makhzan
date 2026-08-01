import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
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
@Index(['stockItem', 'createdAt'])
export class StockMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => StockItem, (stockItem) => stockItem.movements, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  stockItem: StockItem;

  @Column({ type: 'int' })
  delta: number;

  @Column({ type: 'enum', enum: StockMovementReason })
  reason: StockMovementReason;

  @Column({ type: 'int', nullable: true })
  @Index()
  orderId: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
