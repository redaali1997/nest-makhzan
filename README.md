# Makhzan — Order & Inventory System

A backend system that processes customer orders against real inventory **without
overselling stock or double-charging customers**.

Built to demonstrate correctness under concurrency — the class of bug that unit
tests pass and production finds.

---

## The problem

Makhzan is an online retailer. Its previous system had two failures that only
appeared under load:

- **Oversell** — stock was checked and deducted as two separate steps, so two
  concurrent checkouts could both pass the check and both deduct, driving stock
  negative.
- **Double charge** — a retried checkout request created a second order and a
  second charge, because nothing guaranteed the request was processed once.

Normal traffic is ~500 orders/day. Promotional peaks reach ~2,000 orders/hour —
precisely when the failure rate is highest.

## The approach

| Problem                         | Solution                                                                                                  |
| ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Oversell                        | Check and deduct collapsed into one atomic conditional update inside a transaction                        |
| Double charge                   | Client-supplied idempotency key persisted under a uniqueness constraint                                   |
| Unknown payment outcome         | Gateway called outside the transaction; unresolved orders reconciled by a scheduled worker, never guessed |
| Payment failure after deduction | Compensating transaction driven by a persisted event, retried until it succeeds                           |
| Notification failure            | Queued and retried independently; never affects order state                                               |

Full reasoning, actor model, failure analysis, and out-of-scope decisions:
**[SCOPE.md](./SCOPE.md)**

---

## Stack

| Layer          | Choice                                                      |
| -------------- | ----------------------------------------------------------- |
| Runtime        | Node.js · TypeScript                                        |
| Framework      | NestJS 11                                                   |
| Database       | MySQL 8.4 · TypeORM (migrations only, `synchronize: false`) |
| Cache & queues | Redis 8.8                                                   |
| Config         | Zod-validated environment, fail-fast at boot                |
| Infrastructure | Docker Compose                                              |

**Architecture:** modular monolith. Modules communicate through explicit
interfaces and domain events, so the seams that would become service boundaries
are already drawn — without paying the distributed-systems cost up front.

---

## Getting started

**Requirements:** Docker and Docker Compose. Node.js 20+ if running the app
outside a container.

```bash
git clone https://github.com/redaali1997/nest-makhzan.git
cd nest-makhzan

cp .env.example .env        # fill in the values
docker compose up -d        # MySQL + Redis

npm install
npm run migration:run
npm run start:dev
```

The API is served on `http://localhost:3000`.

### Useful commands

```bash
npm run migration:generate --name=<Name>   # generate from entity changes
npm run migration:show                     # [X] applied · [ ] pending
npm run migration:revert                   # roll back the last one
npm run test                               # unit tests
npm run test:e2e                           # end-to-end tests
```

---

## Project structure

```
src/
├── modules/
│   ├── catalog/      products
│   ├── inventory/    warehouses, stock items, stock movements
│   └── payment/      gateway abstraction and implementations
└── shared/
    ├── config/       Zod-validated, namespaced configuration
    └── database/     data source, TypeORM options, migrations
```

---

## Status

|     |                                                         |
| --- | ------------------------------------------------------- |
| ✅   | Scope, actor model, and failure analysis                |
| ✅   | Infrastructure, fail-fast configuration, migrations     |
| ✅   | Domain model — products, warehouses, stock, movements   |
| ✅   | Payment gateway abstraction                             |
| 🔄   | Atomic stock allocation and idempotent checkout         |
| ⬜   | Compensation workers and the transactional outbox       |
| ⬜   | Observability — correlation ids, health checks, metrics |
| ⬜   | Load test proving zero oversell at 2,000 orders/hour    |

---

## Documentation

- **[SCOPE.md](./SCOPE.md)** — the problem, the critical path, and every
  exclusion with its reason
- **`docs/adr/`** — architecture decision records

---

## Author

**Reda Ali** — Backend Engineer
[GitHub](https://github.com/redaali1997) · [LinkedIn](https://linkedin.com/in/redaalii97)