# 3. Atomic stock deduction

**Status:** Accepted
**Date:** 2026-09-12

## Context

Stock must never go negative under concurrent checkout. Normal load is around
500 orders a day, with promotional spikes to roughly 2,000 orders an hour —
which is exactly when the contention is highest.

The obvious implementation reads the current quantity, checks it in application
code, then writes the new value. That implementation is wrong, and it is wrong
for two independent reasons:

1. **A `SELECT` reads from the transaction's snapshot, not from the current
   row.** Under `REPEATABLE READ` — MySQL's default — the value returned can
   already be stale at the moment it is read, and it will not change for the
   life of the transaction even after another transaction commits.

2. **A `SELECT` takes no lock.** Even with a correct value, nothing prevents a
   concurrent transaction from deducting in the window between the read and the
   write.

Measured: 20 concurrent requests against 5 units of stock.

## Decision

The check and the write are a single conditional `UPDATE`:

```sql
UPDATE stock_items
SET quantityOnHand = quantityOnHand - :qty
WHERE id = :id AND quantityOnHand >= :qty
```

`affected === 0` means there was not enough stock, and the transaction rolls
back. Unlike a `SELECT`, an `UPDATE` reads the current row rather than the
snapshot, and it takes an exclusive row lock before evaluating the condition —
so concurrent writers are serialised rather than racing.

All work inside the transaction uses the transaction's `EntityManager`. A
repository bound to the `DataSource` would check out a **second pooled
connection** while the transaction still holds one. Once concurrency exceeds the
pool size, every connection is held by an open transaction, the failing
transaction blocks forever waiting for a connection it can never get, and it
holds its row lock while doing so.

Measured, pool size 10, 20 concurrent requests:

| | succeeded | lock wait timeouts | elapsed |
|---|---|---|---|
| Repository bound to `DataSource` | 5 | **9** | **50,080 ms** |
| Transaction's `EntityManager` | 5 | 0 | **78 ms** |

Changing the isolation level to `READ COMMITTED` did not help — the failure is
in connection handling, not isolation.

## Consequences

- No overselling under concurrent load. Verified: 20 concurrent requests against
  5 units yields exactly 5 successes, 15 clean `InsufficientStockError`
  rejections, and a final quantity of 0.
- Contention is concentrated at confirmation time. This is deliberate; see the
  hard-allocation decision in `SCOPE.md`.
- Every code path inside a transaction must use the transaction's manager. A
  repository injected into the service is a latent pool deadlock, so the
  injected repository was removed from the constructor entirely rather than left
  available to be misused.
- `stock_movements` rows now record `ORDER_ALLOCATED` with the originating
  `orderId`, so the audit trail can be traced back to the order. This is a
  prerequisite for compensation on payment failure.

## Still open

Multi-item orders are not implemented yet. When they are, the deduction loop
must acquire locks in a **deterministic order** (sorted by `stockItemId`),
otherwise two concurrent orders containing the same products in different cart
order will deadlock.

Measured on 40 concurrent transactions deducting 3 items each:

| lock order | succeeded | deadlocks |
|---|---|---|
| cart order | 30 | **10** |
| sorted by id | **40** | **0** |

The application will also need to retry on MySQL error `1213`, which is safe
because a deadlock rolls the whole transaction back.
