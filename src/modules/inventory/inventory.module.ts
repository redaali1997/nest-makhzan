import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockItem } from './entities/stock-item.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { Warehouse } from './entities/warehouse.entity';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StockItem, StockMovement, Warehouse])],
  providers: [InventoryService],
  controllers: [InventoryController],
})
export class InventoryModule {}
