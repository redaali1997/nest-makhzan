import { Controller, Post } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Post('deduct')
  deductStock() {
    return this.inventoryService.deductStock(2, 1);
  }
}
