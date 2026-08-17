import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { StockItem } from './entities/stock-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { InsufficientStockError } from './errors/insufficient-stock.error';
import {
  StockMovement,
  StockMovementReason,
} from './entities/stock-movement.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(StockItem) private stockItemRepo: Repository<StockItem>,
    private dataSource: DataSource,
  ) {}

  async deductStock(stockItemId: number, quantity: number) {
    await this.dataSource.transaction(async (manager) => {
      const result = await manager
        .createQueryBuilder()
        .update(StockItem)
        .set({ quantityOnHand: () => 'quantityOnHand - :qty' })
        .where('id = :id AND quantityOnHand >= :qty', {
          id: stockItemId,
          qty: quantity,
        })
        // .setParameter('qty', quantity)
        .execute();

      if (result.affected === 0) {
        const current = await this.stockItemRepo.findOneBy({ id: stockItemId });
        throw new InsufficientStockError(
          stockItemId,
          quantity,
          current?.quantityOnHand ?? 0,
        );
      }

      await manager.getRepository(StockMovement).save({
        stockItem: { id: stockItemId },
        delta: -quantity,
        reason: StockMovementReason.RECEIVED,
      });
    });
  }
}
