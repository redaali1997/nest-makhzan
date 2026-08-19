import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PendingPayment = 'pending_payment',
  Paid = 'paid',
  PaymentFailed = 'payment_failed',
  Shipped = 'shipped',
  Cancelled = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  customerId: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PendingPayment,
  })
  @Index()
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, unsigned: true })
  totalAmount: string;

  @VersionColumn({ default: 1 })
  version: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items: OrderItem[];
}
