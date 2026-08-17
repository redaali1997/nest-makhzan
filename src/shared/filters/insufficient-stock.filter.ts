import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { InsufficientStockError } from 'src/modules/inventory/errors/insufficient-stock.error';

@Catch(InsufficientStockError)
export class InsufficientStockFilter implements ExceptionFilter {
  catch(error: InsufficientStockError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    response.status(HttpStatus.CONFLICT).json({
      statusCode: HttpStatus.CONFLICT,
      error: 'InsufficientStock',
      message: error.message,
      stockItemId: error.stockItemId,
      requested: error.requested,
      availableApproximate: error.available,
    });
  }
}
