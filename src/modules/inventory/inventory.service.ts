import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { StockItem } from './entities/stock-item.entity';
import { InsufficientStockError } from './errors/insufficient-stock.error';
import {
  StockMovement,
  StockMovementReason,
} from './entities/stock-movement.entity';

@Injectable()
export class InventoryService {
  async deductStock(
    manager: EntityManager,
    stockItemId: number,
    quantity: number,
    orderId?: number,
  ) {
    const result = await manager
      .createQueryBuilder()
      .update(StockItem)
      .set({ quantityOnHand: () => 'quantityOnHand - :qty' })
      .where('id = :id AND quantityOnHand >= :qty', {
        id: stockItemId,
        qty: quantity,
      })
      .execute();

    if (result.affected === 0) {
      const current = await manager
        .getRepository(StockItem)
        .findOneBy({ id: stockItemId });
      throw new InsufficientStockError(
        stockItemId,
        quantity,
        current?.quantityOnHand ?? 0,
      );
    }

    await manager.getRepository(StockMovement).save({
      stockItem: { id: stockItemId },
      delta: -quantity,
      reason: StockMovementReason.ORDER_ALLOCATED,
      orderId: orderId ?? null,
    });
  }
}
