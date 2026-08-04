import { randomUUID } from 'node:crypto';
import { PaymentGateway, PaymentInput, PaymentResult } from './payment-gateway';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MockPaymentGateway extends PaymentGateway {
  async charge(input: PaymentInput): Promise<PaymentResult> {
    return { status: 'accepted', gatewayRef: `mock_${randomUUID()}` };
  }
}
