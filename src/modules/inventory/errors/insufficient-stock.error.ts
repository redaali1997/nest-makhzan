export class InsufficientStockError extends Error {
  constructor(
    readonly stockItemId: number,
    readonly requested: number,
    readonly available: number,
  ) {
    super(
      `Insufficient stock for item ${stockItemId}: requested ${requested}, available ${available}`,
    );
    this.name = 'InsufficientStockError';
  }
}
