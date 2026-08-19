import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @Index()
  order: Order;

  @Column({ type: 'int', unsigned: true })
  productId: number;

  @Column()
  productName: string;

  @Column()
  productSku: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, unsigned: true })
  unitPrice: string;

  @Column({ type: 'int', unsigned: true })
  quantity: number;
}
