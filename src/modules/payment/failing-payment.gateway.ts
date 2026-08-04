import { randomUUID } from 'crypto';
import { PaymentGateway, PaymentInput, PaymentResult } from './payment-gateway';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FailingPaymentGateway extends PaymentGateway {
  async charge(input: PaymentInput): Promise<PaymentResult> {
    return { status: 'rejected', gatewayRef: `mock_${randomUUID()}` };
  }
}
