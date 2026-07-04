# Distributed Concurrency-Safe Cart Management System — Project Context

## Table of Contents

1. What You're Actually Building
2. High-Level System Architecture
3. Build Hierarchy — System Dependency Order
4. Codebase Folder Structure
5. Database Schema & Entity Relationships
6. The 10 Core Subsystems
7. Concurrency Deep-Dive
8. Non-Negotiable Business Rules
9. API Reference
10. Worked Example: "Add to Cart" Logic
11. Frontend Responsibilities
12. Recommended Tech Stack
13. Suggested Build Roadmap
14. Engineering Concepts You'll Practice
15. Quick-Reference Cheat Sheet

---

## 1. What You're Actually Building

If you build this from scratch, you're not building "a shopping cart page." You're building a **distributed state management system for an e-commerce platform** — the same class of problem Amazon, Flipkart, and Walmart solve in production.

**The central engineering question:**

> How do multiple users, multiple devices, changing product information, and concurrent database operations interact without corrupting the cart?

This is exactly why a project like this shows up in systems-design evaluations — it tests whether you actually understand:

- Database design
- Transactions
- Concurrency
- API design
- Synchronization
- Backend architecture
- Scalability
- State management

It's also a useful counterweight to a DS/ML-heavy portfolio — it's evidence you can design the backend a model or product has to live behind, not just the model itself.

## 2. High-Level System Architecture

The webpage is only **one client**. The full system looks like this:

```
                      ┌────────────┐
                      │    User     │
                      └──────┬─────┘
              ┌───────────────┴───────────────┐
        ┌─────▼─────┐                   ┌─────▼─────┐
        │  Laptop   │                   │  Mobile   │
        └─────┬─────┘                   └─────┬─────┘
              └───────────────┬───────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  REST / GraphQL API  │
                    └──────────┬──────────┘
        ┌───────────────────────┼───────────────────────┐
  ┌─────▼─────┐           ┌─────▼─────┐            ┌─────▼─────┐
  │   Cart    │           │  Product  │            │   Order   │
  │  Service  │           │  Service  │            │  Service  │
  └─────┬─────┘           └─────┬─────┘            └─────┬─────┘
        └───────────────────────┼───────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │    Database Layer      │
                    │ Transactions & Locking  │
                    └─────────────────────────┘
```

**Governing principle:** the server is the single source of truth. Every device sends a request → the server checks the database → every device refreshes from the server's response. No client ever trusts its own local state as correct.

## 3. Build Hierarchy — System Dependency Order

This is the order things should actually get built in — not the order they're explained in. Each layer depends on the layer(s) below it.

```
LAYER 0 — Foundation
└── Database schema (Users, Products, Cart, CartItems, Orders, Payments)

LAYER 1 — Identity & Catalog          (depends on Layer 0)
├── System 1 — User Authentication
└── System 2 — Product Management

LAYER 2 — Core State                  (depends on Layer 1)
└── System 3 — Cart Engine
     └── System 6 — Concurrency Manager
          build this INTO the Cart Engine from day one —
          bolting it on later means rewriting every endpoint

LAYER 3 — State Extensions            (depends on Layer 2)
├── System 4 — Save for Later Engine   (reuses Cart Engine + a status flag)
└── System 5 — Inventory Management    (reuses Product + Cart Engine)

LAYER 4 — Consistency Layer           (depends on Layers 2-3)
├── System 7 — Synchronization Engine  (needs versioning from Layer 2)
└── System 8 — Pricing Engine          (needs live Product data)

LAYER 5 — Orchestration               (depends on everything above)
└── System 9 — Checkout Validator      (every rule converges here)

LAYER 6 — Observability               (add incrementally, any time)
└── System 10 — Event System           (hooks into every service above)
```

**Why the order matters:** the Cart Engine and Concurrency Manager are usually treated as two separate features in tutorials, but here they're really one system. Design the `CartItems` row with a `version` column in your very first migration — don't add it after the fact.

## 4. Codebase Folder Structure

A layout that keeps the ten systems cleanly separated as services:

```
cart-system/
├── backend/
│   ├── src/
│   │   ├── config/                  # DB connection, env vars, JWT secrets
│   │   ├── models/                  # ORM models / Prisma schema
│   │   │   ├── user.model.js
│   │   │   ├── product.model.js
│   │   │   ├── cart.model.js
│   │   │   ├── cartItem.model.js
│   │   │   ├── order.model.js
│   │   │   └── payment.model.js
│   │   ├── services/                # business logic — one file per system
│   │   │   ├── auth.service.js
│   │   │   ├── product.service.js
│   │   │   ├── cart.service.js
│   │   │   ├── saveForLater.service.js
│   │   │   ├── inventory.service.js
│   │   │   ├── concurrency.util.js
│   │   │   ├── sync.service.js
│   │   │   ├── pricing.service.js
│   │   │   ├── checkout.service.js
│   │   │   └── event.service.js
│   │   ├── controllers/             # request/response handling per route
│   │   ├── routes/                  # route definitions
│   │   ├── middleware/              # auth guard, error handler, validators
│   │   ├── utils/
│   │   └── app.js
│   ├── prisma/                      # schema.prisma + migrations (or /migrations)
│   ├── tests/                       # Jest + Supertest
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/              # CartItem, SaveForLaterList, PriceAlert...
│   │   ├── pages/                   # Cart, Checkout, ProductList
│   │   ├── store/                   # Redux Toolkit / Zustand slices
│   │   ├── services/                # API client (axios/fetch wrappers)
│   │   └── hooks/                   # useCart, useSync, usePolling
│   └── package.json
│
└── README.md
```

## 5. Database Schema & Entity Relationships

```
Users ──(1:1)── Cart ──(1:many)── CartItems ──(many:1)── Products
                                       │
                                 on checkout
                                       ▼
                               Orders ──(1:1)── Payments
```

**One User → One Cart → Many CartItems → One Product per item.**

### Users
| Field | Notes |
|---|---|
| user_id | PK |
| name | |
| email | unique |

### Products
| Field | Notes |
|---|---|
| product_id | PK |
| name | |
| price | current price — always read live at checkout |
| stock | current available units |
| status | e.g. `ACTIVE` / `DISCONTINUED` |
| updated_at | |

### Cart
| Field | Notes |
|---|---|
| cart_id | PK |
| user_id | FK → Users |
| created_at | |
| updated_at | |
| version | optimistic locking at the cart level |

### CartItems
| Field | Notes |
|---|---|
| cart_item_id | PK |
| cart_id | FK → Cart |
| product_id | FK → Products |
| quantity | |
| status | `ACTIVE` or `SAVED` |
| price_when_added | snapshot price, compared against live price at checkout |
| updated_at | |
| version | optimistic locking at the row level |

### Orders / Payments
*Referenced throughout the checkout flow in your notes but not fully spec'd — filled in here so the schema is complete.*

| Table | Key fields |
|---|---|
| Orders | order_id (PK), user_id (FK), total_amount, status, created_at |
| Payments | payment_id (PK), order_id (FK), amount, status, method, created_at |

## 6. The 10 Core Subsystems

### System 1 — User Authentication
Before someone owns a cart, they must exist.
**Flow:** Register → Login → JWT Token → Authenticated User
**Tech:** JWT, Sessions, Cookies, Refresh Tokens

### System 2 — Product Management
Every cart depends on products existing first.
**Flow:** Product → Price → Stock → Category → Images → Availability → Discount
**Admin can:** add product, delete product, update stock, change price

### System 3 — Cart Engine ⭐ *(the heart of the project)*
Don't model a cart as a plain list. Model it as a **stateful service** tracking: which products, how many, active-or-saved, last modified, who owns it, and its version.
Practical schema: `Cart(cart_id, user_id, version, created_at, updated_at)` + `CartItems(item_id, product_id, quantity, status, price_when_added, version)`

### System 4 — Save for Later Engine
Not a second cart — a **state transition** on the same row: `status` flips between `ACTIVE` and `SAVED`. Nothing is ever deleted for this action.

### System 5 — Inventory Management
If stock = 5 and five users try to buy 5 units each at once, naive updates can push stock negative — which is impossible in reality. The inventory service must: **reserve stock → reduce stock → roll back if the surrounding transaction fails.**

### System 6 — Concurrency Manager ⭐ *(the biggest concept in the project)*
Laptop, phone, and tablet updating the same quantity at once must never produce a random result. Two accepted approaches — detailed in Section 7:
- **Optimistic Locking** — every row carries a version number; stale updates are rejected.
- **Database Transactions** — `BEGIN → Lock Row → Update → Unlock → COMMIT`.

### System 7 — Synchronization Engine
If the laptop says quantity = 3 and the phone says quantity = 1, neither is "correct" — only the server's current row is. **Flow:** Request → Server → Database → Updated response → Refresh UI. No client trusts its own local state.

### System 8 — Pricing Engine
Never trust the price a user added an item at. If it was added at ₹500 and the admin later changes it to ₹650, checkout must **compare → detect the mismatch → notify the user** before charging anything.

### System 9 — Checkout Validator
The convergence point for every rule in the system:
Cart → Stock → Price → Availability → Discontinued check → Coupons → Taxes → Shipping → Payment → Order. Any single step can fail, and each must fail safely and clearly.

### System 10 — Event System
Every meaningful action becomes an event: item added, item removed, item moved (active↔saved), price changed, quantity changed, checkout completed, checkout cancelled. Feeds analytics, recommendations, notifications, and auditing — this is what real companies actually use it for.

## 7. Concurrency Deep-Dive — Why This Project Is Actually Hard

### The race condition, concretely
Cart starts at `iPhone: qty 1`. Laptop sends "increase to 2." Mobile sends "increase to 3." Both requests hit the server almost simultaneously.

Without concurrency control:
```
Request A (Laptop): reads qty = 1 → writes qty = 2
Request B (Mobile):  reads qty = 1 → writes qty = 3
Final DB value:       qty = 3
```
The user expected either `1 + 1 + 2 = 4` (both increments applied) or at least a predictable "last write wins" — not a silently dropped update. This is a **race condition**, and preventing it is the actual point of this project.

A second common conflict: one device **deletes** an item while another **updates its quantity**, arriving together. Depending on transaction ordering, either the delete or the update should win outright — but the row must never end up duplicated, negative, or `NULL`.

### Solution A — Optimistic Locking *(recommended default)*
Every row carries a `version` number.

```
CartItem: { id: 5, quantity: 2, version: 7 }

Laptop reads version 7, sends update with version = 7
  → DB checks: current version == 7 ?  YES
  → Apply update → quantity = 3, version becomes 8

Mobile (also read version 7 earlier) sends update with version = 7
  → DB checks: current version == 7 ?  NO — it's now 8
  → Reject → return 409 Conflict
  → Frontend re-fetches the latest cart and lets the user retry
```
Cheap, doesn't hold database locks, and scales well — the standard choice for individual cart-item edits.

### Solution B — Database Transactions (ACID)
Used mainly around checkout, where several tables must change together atomically.
```
BEGIN
  Decrease stock
  Update cart
  Create order
  Charge payment
COMMIT
```
If the payment step fails: `ROLLBACK` — stock, cart, and order all revert as if nothing happened. Preventing partial updates is the whole point.

**In practice:** most real systems use both — optimistic locking on frequent, cheap cart-item edits, and a real transaction wrapping the rare, must-be-atomic checkout sequence.

## 8. Non-Negotiable Business Rules

**Never allow:**
- Duplicate rows for the same product in a cart — `Laptop, Laptop, Laptop` should always collapse to one row, `Laptop, qty 3`
- Negative quantity
- Null quantity
- A checkout total that includes `SAVED` items
- A checkout that charges the stale (added-at) price instead of the live price
- A checkout that allows buying more units than are currently in stock

**Always:**
- Increase quantity on the existing row when the same product is added again — never insert a new row
- Check the version number (or hold a row lock) before committing any cart-item update
- Recompute the cart total, GST, and shipping strictly from `ACTIVE` items
- Wrap checkout in a single transaction so it either fully succeeds or fully rolls back
- Re-validate stock, price, and product status at the moment of checkout — not at the moment the item was added

### Worked numeric examples (from your notes)

| Rule | Example |
|---|---|
| Cart total = ACTIVE items only | Laptop ₹70,000 + Mouse ₹800 + Keyboard ₹2,000 = **₹72,800** |
| Saved items excluded from total | Cart: Laptop ₹70,000. Saved: Monitor ₹15,000 → Total = **₹70,000**, not ₹85,000 |
| Price mismatch at checkout | Added at ₹50,000 → admin changes to ₹52,000 → checkout must show both and get confirmation |
| Stock validation | Cart requests qty 5, stock has only 2 → checkout blocked: "Only 2 items available" |

## 9. API Reference

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Create a user |
| POST | `/auth/login` | Authenticate, issue JWT |
| GET | `/cart` | Fetch the current cart (server's source of truth) |
| POST | `/cart/add` | Add a product to the cart (bump quantity if it's already there) |
| PUT | `/cart/update` | Change quantity — must include the item's `version` |
| DELETE | `/cart/remove` | Remove an item entirely |
| PATCH | `/cart/save-for-later` | Flip an item `ACTIVE → SAVED` |
| PATCH | `/cart/move-to-cart` | Flip an item `SAVED → ACTIVE` |
| POST | `/checkout` | Run the full checkout validation flow and create an order |

Every endpoint follows the same internal pipeline:
```
Authenticate → Validate → Business Logic → Database → Response
```

### Checkout flow specifically
```
Click Checkout
  → Fetch latest cart
  → Validate stock
  → Validate product exists
  → Validate product not discontinued
  → Validate latest prices
  → Check optimistic-lock version
  → BEGIN transaction
      → Reserve stock
      → Create order
      → Process payment
  → COMMIT (or ROLLBACK on any failure)
  → Clear ACTIVE cart items only — SAVED items stay untouched
```

## 10. Worked Example: "Add to Cart" Business Logic

This is the part most students underestimate — "add product" is never a plain `INSERT`:

```
Does the product exist?
   NO  → return 404
   YES → continue

Is the user authenticated?
   NO  → return 401
   YES → continue

Is stock available?
   NO  → return 409 / "out of stock"
   YES → continue

Is this product already an ACTIVE item in the user's cart?
   YES → increase quantity on the existing row
   NO  → insert a new CartItem row

Update the row's version number
Return the updated cart (server's current state)
```
Every feature in this project becomes a decision tree like this one — that's expected, and it's the actual skill being tested.

## 11. Frontend Responsibilities

The UI is not "just buttons." It owns:
- Displaying the cart
- Sending quantity updates
- Handling errors (409 conflicts, stock errors, stale price)
- Showing price-change notices
- Showing stock errors clearly
- Moving items between Active and Saved
- Refreshing automatically after every server response

**Rule of thumb:** the frontend is a *reflection* of server state, never the *owner* of it.

## 12. Recommended Tech Stack

| Layer | Options |
|---|---|
| Frontend | React, Next.js, Tailwind CSS, Redux Toolkit / Zustand |
| Backend | Node.js + Express (or NestJS), Java Spring Boot, Django |
| Database | PostgreSQL or MySQL |
| ORM | Prisma, TypeORM, Sequelize, Hibernate |
| Authentication | JWT + Refresh Tokens |
| Concurrency | Optimistic Locking, Row-Level Locks, ACID Transactions |
| Caching (optional) | Redis |
| Real-time sync (optional) | WebSockets / Socket.IO |
| Testing | Postman, Jest, Supertest |

**Suggested default for a solo build:** Node.js + Express + PostgreSQL + Prisma — Prisma's built-in optimistic-locking support via a `version` field maps almost directly onto Section 7 — plus React for the frontend. Given your Python/DS background, Django + Django REST Framework + PostgreSQL is a solid alternative; you'd just implement the version check manually in the view layer instead of getting it from the ORM.

## 13. Suggested Build Roadmap

**Phase 1 — Foundation**
- Design and migrate the full schema (Users, Products, Cart, CartItems, Orders, Payments)
- Build auth (register / login / JWT)
- Build product CRUD (admin-only)

**Phase 2 — Core Cart**
- Build the Cart Engine with `version` on `CartItems` from the start
- Implement optimistic locking on update/delete
- Implement Save-for-Later as a status flip, not a new table

**Phase 3 — Inventory & Sync**
- Reserve / reduce / rollback stock logic
- Polling or WebSocket-based refresh so a second device reflects changes made on the first

**Phase 4 — Pricing & Checkout**
- Price-mismatch detection at checkout
- Discontinued-product handling
- Full checkout transaction (stock reservation → order → payment → commit/rollback)

**Phase 5 — Events & Polish**
- Event logging for every cart action
- Test the concurrency edge cases specifically — two clients updating the same item, a delete racing an update, checkout with a stale price. This is what will actually separate your submission, since most student projects never test simultaneous requests.

## 14. Engineering Concepts You'll Practice

- Concurrency control — preventing race conditions on shared rows
- ACID transactions — all-or-nothing multi-table updates
- Optimistic locking — version-based conflict detection
- Database normalization — Users / Cart / CartItems / Products / Orders / Payments as separate, related tables
- REST API design
- State management across sessions and devices
- Validation pipelines — stock, price, status, permissions, all checked before checkout
- Error recovery — conflicts, discontinued products, failed updates
- Designing for scale — thousands of concurrent users

## 15. Quick-Reference Cheat Sheet

| Situation | Correct behavior |
|---|---|
| Same product added twice | Increment the existing row's quantity |
| Two devices edit the same item at once | Version check rejects the stale one → 409 |
| Item moved to "Save for Later" | Status flip on the same row, no deletion |
| Cart total | Sum of `ACTIVE` items only |
| Price changed since item was added | Compare live price vs `price_when_added`, notify before charging |
| Requested quantity > stock | Reject at checkout with the real available count |
| Product discontinued mid-cart | Detect at checkout, let the user remove it, don't crash |
| Checkout | Runs inside one transaction — full success or full rollback |