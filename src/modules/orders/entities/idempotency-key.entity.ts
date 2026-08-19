import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('idempotency_keys')
@Unique(['endpoint', 'key'])
export class IdempotencyKey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'idempotency_key',
    type: 'varchar',
    length: 128,
  })
  key: string;

  @Column({ type: 'varchar', length: 64 })
  endpoint: string;

  @Column({ type: 'json', nullable: true })
  responseBody: Record<string, unknown> | null;

  @Column({ type: 'int', nullable: true })
  responseStatus: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
