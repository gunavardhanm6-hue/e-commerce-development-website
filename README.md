# 🛒 Distributed Concurrency-Safe Cart Management System

> A production-grade, distributed e-commerce cart system built to solve real-world concurrency, state synchronization, and transactional integrity challenges.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Core Features](#core-features)
- [API Reference](#api-reference)
- [Concurrency & Locking](#concurrency--locking)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Build Roadmap](#build-roadmap)
- [Engineering Concepts](#engineering-concepts)
- [License](#license)

---

## 🎯 Overview

This is not a simple "add to cart" demo. It is a **distributed state management system** for an e-commerce platform — the same class of problem that Amazon, Flipkart, and Walmart solve in production.

**The central engineering question:**

> How do multiple users, multiple devices, changing product information, and concurrent database operations interact without corrupting the cart?

This system demonstrates expertise in:
- Database design & normalization
- ACID transactions & concurrency control
- Optimistic locking & row-level versioning
- REST API design & validation pipelines
- Multi-device state synchronization
- Inventory reservation & rollback
- Event-driven architecture

---

## 🏗️ Architecture

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

**Governing Principle:** The server is the single source of truth. Every device sends a request → the server checks the database → every device refreshes from the server's response. No client ever trusts its own local state as correct.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Zustand |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Authentication** | JWT + Refresh Tokens |
| **Concurrency** | Optimistic Locking (version fields), Row-Level Locks, ACID Transactions |
| **Real-time Sync** | Socket.IO (WebSockets) |
| **Testing** | Jest, Supertest, React Testing Library |
| **Validation** | Zod |
| **API Client** | Axios |

---

## 📁 Project Structure

### Client

```
client/
├── public/
├── src/
│   ├── app/              # App-level configuration
│   ├── assets/           # Static assets
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Shared components (Button, Modal, etc.)
│   │   ├── cart/         # Cart-specific components
│   │   ├── checkout/     # Checkout flow components
│   │   ├── product/      # Product display components
│   │   ├── navbar/       # Navigation components
│   │   ├── footer/       # Footer components
│   │   └── ui/           # Primitive UI components
│   ├── pages/            # Route-level pages
│   ├── layouts/          # Page layouts
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Business logic services
│   ├── api/              # API client & interceptors
│   ├── context/          # React context providers
│   ├── store/            # Zustand state management
│   ├── routes/           # Route definitions
│   ├── utils/            # Utility functions
│   ├── constants/        # App constants
│   ├── validators/       # Zod validation schemas
│   ├── types/            # TypeScript type definitions
│   ├── styles/           # Global styles
│   └── main.tsx          # Entry point
├── package.json
└── vite.config.ts
```

### Server

```
server/
├── src/
│   ├── config/           # Environment & DB configuration
│   ├── database/         # Prisma schema & migrations
│   ├── middleware/       # Auth guards, error handlers, validators
│   ├── common/           # Shared decorators, filters, pipes
│   ├── modules/          # Feature modules (Auth, Product, Cart, etc.)
│   ├── services/         # Business logic services
│   ├── repositories/     # Data access layer
│   ├── interfaces/       # TypeScript interfaces & contracts
│   ├── utils/            # Helper utilities
│   ├── events/           # Event-driven logic
│   ├── sockets/          # Socket.IO handlers
│   ├── jobs/             # Background jobs & cron tasks
│   ├── types/            # Global type definitions
│   ├── routes/           # Route definitions
│   ├── app.ts            # Express app configuration
│   └── server.ts         # Server bootstrap
└── package.json
```

---

## 🗄️ Database Schema

### Entity Relationships

```
Users ──(1:1)── Cart ──(1:many)── CartItems ──(many:1)── Products
                                       │
                                 on checkout
                                       ▼
                               Orders ──(1:1)── Payments
```

### Tables

#### `Users`
| Field | Type | Notes |
|-------|------|-------|
| `user_id` | UUID | Primary Key |
| `name` | String | |
| `email` | String | Unique, indexed |
| `password_hash` | String | bcrypt hashed |
| `role` | Enum | `USER` / `ADMIN` |
| `created_at` | Timestamp | |
| `updated_at` | Timestamp | |

#### `Products`
| Field | Type | Notes |
|-------|------|-------|
| `product_id` | UUID | Primary Key |
| `name` | String | |
| `description` | Text | |
| `price` | Decimal | Current live price |
| `stock` | Integer | Available units |
| `status` | Enum | `ACTIVE` / `DISCONTINUED` |
| `category` | String | |
| `images` | JSON | Array of image URLs |
| `updated_at` | Timestamp | |

#### `Cart`
| Field | Type | Notes |
|-------|------|-------|
| `cart_id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key → Users |
| `version` | Integer | Optimistic locking at cart level |
| `created_at` | Timestamp | |
| `updated_at` | Timestamp | |

#### `CartItems`
| Field | Type | Notes |
|-------|------|-------|
| `cart_item_id` | UUID | Primary Key |
| `cart_id` | UUID | Foreign Key → Cart |
| `product_id` | UUID | Foreign Key → Products |
| `quantity` | Integer | Must be > 0 |
| `status` | Enum | `ACTIVE` / `SAVED` |
| `price_when_added` | Decimal | Snapshot price at add time |
| `version` | Integer | Optimistic locking at row level |
| `updated_at` | Timestamp | |

#### `Orders`
| Field | Type | Notes |
|-------|------|-------|
| `order_id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key → Users |
| `total_amount` | Decimal | |
| `status` | Enum | `PENDING` / `CONFIRMED` / `CANCELLED` |
| `created_at` | Timestamp | |

#### `Payments`
| Field | Type | Notes |
|-------|------|-------|
| `payment_id` | UUID | Primary Key |
| `order_id` | UUID | Foreign Key → Orders |
| `amount` | Decimal | |
| `status` | Enum | `PENDING` / `SUCCESS` / `FAILED` |
| `method` | String | |
| `created_at` | Timestamp | |

---

## ⚡ Core Features

### 1. Authentication System
- JWT-based authentication with refresh tokens
- Role-based access control (User / Admin)
- Secure password hashing with bcrypt
- Token rotation & expiration handling

### 2. Product Management
- Full CRUD for products (Admin only)
- Live price & stock tracking
- Product status management (`ACTIVE` / `DISCONTINUED`)
- Category-based filtering

### 3. Cart Engine
- Stateful cart service tracking products, quantities, and status
- Duplicate product collapse — adding the same product increments quantity, never creates a new row
- Optimistic locking on every cart item update
- Version-based conflict detection

### 4. Save for Later
- State transition on the same row (`ACTIVE` ↔ `SAVED`)
- No data duplication or deletion
- Saved items excluded from cart total

### 5. Inventory Management
- Stock reservation during checkout
- Atomic stock reduction on successful payment
- Automatic rollback on transaction failure
- Prevents negative stock (overselling)

### 6. Concurrency Manager
- **Optimistic Locking** — version fields on `Cart` and `CartItems`; stale updates rejected with `409 Conflict`
- **Database Transactions** — ACID `BEGIN → Lock → Update → COMMIT/ROLLBACK` for checkout
- Race condition prevention across multiple devices

### 7. Synchronization Engine
- Server as single source of truth
- Polling & WebSocket-based real-time cart refresh
- Cross-device state consistency

### 8. Pricing Engine
- Live price validation at checkout
- Price mismatch detection (`price_when_added` vs current price)
- User notification before charging

### 9. Checkout Validator
- Convergence point for all business rules:
  - Stock validation
  - Product existence & status check
  - Price validation
  - Optimistic lock version check
  - Coupon & tax calculation
  - Payment processing
- Full transaction wrapper — all-or-nothing commit/rollback

### 10. Event System
- Event logging for every meaningful action:
  - Item added / removed / moved
  - Quantity changed
  - Price changed
  - Checkout completed / cancelled
- Feeds analytics, recommendations, notifications, and auditing

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Create a new user account |
| `POST` | `/api/v1/auth/login` | Authenticate and receive JWT |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `POST` | `/api/v1/auth/logout` | Invalidate tokens |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/products` | List all products |
| `GET` | `/api/v1/products/:id` | Get product details |
| `POST` | `/api/v1/products` | Create product (Admin) |
| `PUT` | `/api/v1/products/:id` | Update product (Admin) |
| `DELETE` | `/api/v1/products/:id` | Delete product (Admin) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/cart` | Fetch current cart (server truth) |
| `POST` | `/api/v1/cart/add` | Add product (increments if exists) |
| `PUT` | `/api/v1/cart/update` | Update quantity (requires `version`) |
| `DELETE` | `/api/v1/cart/remove` | Remove item entirely |
| `PATCH` | `/api/v1/cart/save-for-later` | Move item to saved |
| `PATCH` | `/api/v1/cart/move-to-cart` | Move saved item back to active |

### Checkout
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/checkout` | Run full checkout validation & create order |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/orders` | List user orders |
| `GET` | `/api/v1/orders/:id` | Get order details |

**Request Pipeline:**
```
Authenticate → Validate → Business Logic → Database → Response
```

---

## 🔒 Concurrency & Locking

### The Problem

Two devices updating the same cart item simultaneously:

```
Request A (Laptop): reads qty = 1 → writes qty = 2
Request B (Mobile):  reads qty = 1 → writes qty = 3
Final DB value:       qty = 3  ❌ (Expected: 4)
```

### Solution: Optimistic Locking

Every row carries a `version` number:

```
CartItem: { id: 5, quantity: 2, version: 7 }

Laptop reads v7 → sends update with version = 7
  → DB: current version == 7 ? YES
  → Apply update → quantity = 3, version = 8

Mobile (read v7 earlier) → sends update with version = 7
  → DB: current version == 7 ? NO (it's 8)
  → Reject → return 409 Conflict
  → Frontend re-fetches latest cart and retries
```

### Checkout Transaction

```sql
BEGIN;
  -- Reserve stock
  UPDATE products SET stock = stock - ? WHERE product_id = ? AND stock >= ?;

  -- Create order
  INSERT INTO orders (...) VALUES (...);

  -- Process payment
  INSERT INTO payments (...) VALUES (...);

  -- Clear active cart items
  DELETE FROM cart_items WHERE cart_id = ? AND status = 'ACTIVE';
COMMIT;
-- On any failure: ROLLBACK
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/distributed-cart-system.git
cd distributed-cart-system
```

### 2. Install Dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 3. Configure Environment

```bash
# Server
cd server
cp .env.example .env
# Edit .env with your database credentials

# Client
cd ../client
cp .env.example .env
```

### 4. Database Setup

```bash
cd server
npx prisma migrate dev
npx prisma db seed
```

### 5. Run the Application

```bash
# Terminal 1 — Server
cd server
npm run dev

# Terminal 2 — Client
cd client
npm run dev
```

The application will be available at:
- **Client:** http://localhost:5173
- **Server:** http://localhost:3000
- **API Docs:** http://localhost:3000/api/docs

---

## 🔐 Environment Variables

### Server (`.env`)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cart_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Server
PORT=3000
NODE_ENV=development

# Redis (optional)
REDIS_URL="redis://localhost:6379"
```

### Client (`.env`)

```env
VITE_API_BASE_URL="http://localhost:3000/api/v1"
VITE_SOCKET_URL="ws://localhost:3000"
```

---

## 🧪 Testing

```bash
# Server tests
cd server
npm test

# Client tests
cd client
npm test

# Coverage
cd server
npm run test:coverage
```

### Concurrency Testing

Special test suite for race conditions:

```bash
cd server
npm run test:concurrency
```

This runs simultaneous requests to verify:
- Optimistic locking rejects stale updates
- Stock never goes negative
- Checkout transactions are atomic
- Cross-device synchronization works

---

## 📅 Build Roadmap

### Phase 1 — Foundation
- [x] Database schema design & migrations
- [x] Authentication (JWT + refresh tokens)
- [x] Product CRUD (admin-only)

### Phase 2 — Core Cart
- [x] Cart Engine with optimistic locking
- [x] Add / Update / Remove cart items
- [x] Save for Later (status flip)

### Phase 3 — Inventory & Sync
- [x] Stock reservation & rollback
- [x] Real-time sync via Socket.IO
- [x] Cross-device state consistency

### Phase 4 — Pricing & Checkout
- [x] Price mismatch detection
- [x] Discontinued product handling
- [x] Full checkout transaction (ACID)

### Phase 5 — Events & Polish
- [x] Event logging system
- [x] Admin dashboard
- [x] Analytics & reporting
- [x] Comprehensive test suite
- [x] Production deployment config

---

## 🎓 Engineering Concepts Demonstrated

| Concept | Implementation |
|---------|---------------|
| **Concurrency Control** | Optimistic locking with version fields |
| **ACID Transactions** | Multi-table checkout wrapper |
| **Database Normalization** | 6 separate, related tables |
| **REST API Design** | Resource-based routes with validation |
| **State Management** | Zustand + server-as-source-of-truth |
| **Validation Pipelines** | Stock, price, status, permissions |
| **Error Recovery** | 409 conflicts, rollback on failure |
| **Scalability** | Stateless services, connection pooling |
| **Event-Driven Architecture** | Action logging & analytics |
| **Real-time Synchronization** | WebSocket-based cart refresh |

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

---

## 📧 Contact

For questions or support, please open an issue or contact the maintainers.

> **Built with ❤️ to solve real distributed systems problems.**
