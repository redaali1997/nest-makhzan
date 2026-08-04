# Project Scope — Makhzan Order & Inventory System

> **Status:** Approved · **Last updated:** 2026-07-27
> A backend system that processes customer orders against real inventory without
> overselling stock or double-charging customers.

---

## 1. The Problem

Makhzan is an online retailer selling electronics and office supplies. Its current
system accepts orders for products that are not actually in stock, and charges
customers twice when they submit the checkout request more than once.

The root cause is that stock verification and stock deduction happen as two
separate steps with no protection against concurrent execution, and there is no
mechanism guaranteeing that a repeated checkout request is processed exactly once.

The cost surfaces as cancellations, returns, and manual refunds. It scales with
traffic: normal load is ~500 orders/day, but promotional periods spike to
~2,000 orders/hour — precisely when the failure rate is highest.

---

## 2. Actors

| Actor                  | Interaction                                                                                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Customer**           | Browses products, manages a cart, places and pays for orders, tracks order status.                                                                              |
| **Operations staff**   | Views incoming orders, advances order status, adjusts stock levels when shipments arrive.                                                                       |
| **Payment gateway**    | External system. Receives charge requests and calls back via webhook to report success or failure. Callbacks may arrive more than once, out of order, or never. |
| **Background workers** | Internal, unattended processes. Release expired reservations, retry failed compensations, dispatch notifications, publish domain events.                        |

> **Why workers are listed as an actor:** any process that can initiate a state
> change is an actor. Omitting them here is how they get omitted from the design.

---

## 3. The Critical Path

The one flow this project exists to get right: **placing an order.** Each step is
paired with its failure question, because the bugs we are fixing live in the
failure paths, not the happy path.

| #   | Step (inside the system)                                            | Failure question                                             | Decision                                                                                                                                                                    |
| --- | ------------------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Receive checkout request carrying a client-supplied idempotency key | What if the same request arrives twice?                      | The key is persisted with a uniqueness constraint. A duplicate returns the original result instead of creating new work.                                                    |
| 2   | Load requested items and validate availability per line item        | What if a concurrent request read the same stock count?      | Availability is never trusted from a prior read. The check and the deduction are one atomic operation (step 3).                                                             |
| 3   | Deduct stock and create the order in a single database transaction  | What if deduction succeeds and order creation fails?         | Both live in one transaction, so both commit or neither does. Deduction uses a conditional update that fails when insufficient stock exists, rather than a read-then-write. |
| 4   | Request a charge from the payment gateway                           | What if the gateway times out and we don't know the outcome? | The gateway call happens **outside** the transaction. Unknown outcomes leave the order in `pending_payment` and are resolved by reconciliation, never by guessing.          |
| 5   | Receive and process the payment webhook                             | What if it arrives twice, or never?                          | Webhooks are deduplicated by gateway event id. Orders stuck in `pending_payment` past a timeout are reconciled by a scheduled worker.                                       |
| 6   | Advance order status and notify the customer                        | What if the email fails to send?                             | Notification failure never affects order state. Notifications are queued, retried independently, and dead-lettered on permanent failure.                                    |

**On payment failure (step 5):** stock was already deducted in step 3, so it must
be returned. This is a **compensating transaction** — a reversing operation that
restores consistency. It is owned by a background worker reacting to a persisted
`PaymentFailed` event, never by the HTTP request, because the request may be gone.

---

## 4. In Scope

1. **Product catalogue with per-warehouse stock** — read-only for customers, quantity-adjustable by operations staff.
2. **Cart management** — add, update quantity, remove. Carts hold no stock reservation.
3. **Idempotent checkout** — the same idempotency key produces exactly one order and one charge.
4. **Atomic stock allocation with quantity support** — validates and deducts a requested quantity per line item under concurrent load without going negative.
5. **Order state machine** — explicit states and explicitly permitted transitions; illegal transitions are rejected.
6. **Payment integration against a mock gateway** — charge request, webhook handling, deduplication, reconciliation of unknown outcomes.
7. **Compensation on payment failure** — event-driven stock return, with retry until success.
8. **Order status and history endpoints** — for customers and operations staff.
9. **Stock adjustment endpoint** — for operations staff, producing an audit trail.
10. **Notifications** — queued, retried, observable.

---

## 5. Explicitly Out of Scope

Each exclusion is a decision with a reason, not an omission.

1. **A real payment gateway.** A mock gateway simulating success, failure, and
   timeout is used instead. Real integration is compliance and credentials work;
   it adds nothing to the engineering problem, and the mock gives far better
   control over failure scenarios — which is what we actually need to test.

2. **Any user interface.** The system is exposed as an OpenAPI-documented HTTP
   API only. UI work would consume the time budget that should go into backend
   depth, and it is not the strength being demonstrated.

3. **Cart-time stock reservation (soft allocation).** Stock is committed at
   confirmation, not when items enter the cart. Reserving on add-to-cart freezes
   inventory for customers who may never convert. The trade-off is accepted
   consciously: it concentrates all contention into the confirmation moment,
   which is exactly where the concurrency control is built.

4. **Discounts, coupons, and promotions.** Pricing rules are a separate problem
   domain with their own complexity. They would inflate scope without touching
   consistency or concurrency.

5. **Returns and refunds.** Post-delivery reverse logistics is a second workflow
   of comparable size to the entire critical path. Payment-failure compensation
   already demonstrates the reversal pattern.

6. **Search, filtering, and recommendations.** Listing and retrieval by id are
   sufficient to exercise the order flow. Full-text search is an infrastructure
   topic orthogonal to the problem statement.

7. **Multiple payment methods.** Card only. Additional methods multiply
   integration surface while re-testing the same state machine.

8. **Shipping-carrier integration and rate calculation.** Status transitions are
   driven manually by operations staff. Carrier APIs are third-party plumbing.

9. **Reporting, analytics, and dashboards.** Aggregate reporting is a read-side
   concern that would pull the project toward breadth instead of depth.

10. **Multi-tenancy.** The system serves one retailer. Tenant isolation is a
    different architectural problem and would obscure this one.

### Deliberate simplifications

- **Two warehouses are modelled, one allocation strategy.** Stock is tracked per
  warehouse because the business genuinely holds it that way and removing it
  would make the inventory arithmetic unrealistically simple. Allocation always
  draws from the warehouse with sufficient stock, nearest-first by fixed
  priority. Split-shipment across warehouses is out of scope.
- **No guest checkout.** All orders belong to an authenticated customer, which
  keeps ownership and authorization unambiguous.

---

## 6. Definition of Done

The project is complete when all six statements below are independently
verifiable by someone other than the author.

1. **No oversell under load.** A k6 load test sustaining 2,000 orders/hour
   against limited stock completes with zero negative stock rows and zero
   confirmed orders exceeding available quantity.

2. **Exactly-once checkout.** Submitting the same checkout request 10 times
   concurrently with one idempotency key yields exactly one order and one charge,
   proven by an automated test.

3. **Compensation is durable.** An integration test that fails a payment
   asserts stock returns to its pre-order level within 60 seconds, and still
   succeeds when the worker process is killed and restarted mid-compensation.

4. **Failure paths are covered.** Every failure question in section 3 has a
   corresponding test. Domain and application layer coverage exceeds 70%.

5. **The system is observable.** Every request carries a correlation id through
   logs; health checks, queue depth, and order-state counts are exposed as
   metrics.

6. **It is deployed and legible.** Running publicly via a CI/CD pipeline, with a
   README stating the problem and the trade-offs, an OpenAPI specification, an
   architecture diagram, and a `docs/adr` directory recording each significant
   decision.

---

## Glossary

| Term                         | Meaning                                                                                                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Oversell**                 | Confirming an order for stock that does not exist.                                                                                                               |
| **Idempotency**              | Repeating an operation produces the same result as performing it once.                                                                                           |
| **Soft allocation**          | Temporary reservation with an expiry. Not used here.                                                                                                             |
| **Hard allocation**          | Permanent deduction at confirmation. Used here.                                                                                                                  |
| **Compensating transaction** | A reversing operation that restores consistency after a later step fails.                                                                                        |
| **Saga**                     | A sequence of local transactions coordinated by events, each with a compensation.                                                                                |
| **Eventual consistency**     | The system converges to a consistent state, but not instantaneously.                                                                                             |
| **Transactional outbox**     | Persisting events in the same transaction as the state change, then publishing them separately, so an event is never lost or published for a rolled-back change. |
| **Dead letter queue**        | Where messages go after exhausting retries, for manual inspection.                                                                                               |