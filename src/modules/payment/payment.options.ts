export interface PaymentModuleOptions {
  mode: 'mock' | 'failing';
}

export interface PaymentModuleAsyncOptions {
  useFactory: (
    ...args: any[]
  ) => PaymentModuleOptions | Promise<PaymentModuleOptions>;
  inject?: any[];
  imports?: any[];
}

export const PAYMENT_OPTIONS = Symbol('PAYMENT_OPTIONS');
