export interface PaymentInput {
  orderId: number;
  amount: string;
  idempotencyKey: string;
}

export interface PaymentResult {
  status: 'accepted' | 'rejected';
  gatewayRef: string;
}

export abstract class PaymentGateway {
  abstract charge(input: PaymentInput): Promise<PaymentResult>;
}
