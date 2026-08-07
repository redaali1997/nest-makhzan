import { DynamicModule, Module } from '@nestjs/common';
import { MockPaymentGateway } from './mock-payment.gateway';
import { PaymentGateway } from './payment-gateway';
import { FailingPaymentGateway } from './failing-payment.gateway';
import { PaymentModuleOptions } from './payment.options';

@Module({})
export class PaymentModule {
  static forRoot(options: PaymentModuleOptions): DynamicModule {
    return {
      module: PaymentModule,
      providers: [
        {
          provide: PaymentGateway,
          useClass:
            options.mode === 'failing'
              ? FailingPaymentGateway
              : MockPaymentGateway,
        },
      ],
      exports: [PaymentGateway],
    };
  }
}
