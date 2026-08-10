import { DynamicModule, Module } from '@nestjs/common';
import { MockPaymentGateway } from './mock-payment.gateway';
import { PaymentGateway } from './payment-gateway';
import { FailingPaymentGateway } from './failing-payment.gateway';
import {
  PAYMENT_OPTIONS,
  PaymentModuleAsyncOptions,
  PaymentModuleOptions,
} from './payment.options';

@Module({})
export class PaymentModule {
  static forRoot(options: PaymentModuleOptions): DynamicModule {
    return this.forRootAsync({ useFactory: () => options });
  }

  static forRootAsync(options: PaymentModuleAsyncOptions): DynamicModule {
    return {
      module: PaymentModule,
      imports: options.imports ?? [],
      global: true,
      providers: [
        FailingPaymentGateway,
        MockPaymentGateway,
        {
          provide: PAYMENT_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
        {
          provide: PaymentGateway,
          useFactory: (
            opts: PaymentModuleOptions,
            failing: FailingPaymentGateway,
            mock: MockPaymentGateway,
          ) => {
            console.log('>>> gateway factory ran with:', opts);
            return opts.mode === 'failing' ? failing : mock;
          },
          inject: [PAYMENT_OPTIONS, FailingPaymentGateway, MockPaymentGateway],
        },
      ],
      exports: [PaymentGateway],
    };
  }
}
