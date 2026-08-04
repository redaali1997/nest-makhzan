import { Module } from '@nestjs/common';
import { MockPaymentGateway } from './mock-payment.gateway';
import { PaymentGateway } from './payment-gateway';
import appConfig from '../../shared/config/app.config';
import { ConfigType } from '@nestjs/config';
import { FailingPaymentGateway } from './failing-payment.gateway';

@Module({
  providers: [
    MockPaymentGateway,
    FailingPaymentGateway,
    {
      provide: PaymentGateway,
      useFactory: (
        config: ConfigType<typeof appConfig>,
        mock: MockPaymentGateway,
        failing: FailingPaymentGateway,
      ) => {
        return config.env === 'test' ? failing : mock;
      },
      inject: [appConfig.KEY, MockPaymentGateway, FailingPaymentGateway],
    },
  ],
  exports: [PaymentGateway],
})
export class PaymentModule {}
