# Inventory & Order Management System

A full-stack application for managing products, customers, orders, and inventory tracking.

## Tech Stack

- **Backend**: Python (FastAPI) with PostgreSQL
- **Frontend**: React (Vite)
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose

## Features

- CRUD operations for Products, Customers, and Orders
- Unique product SKU validation
- Unique customer email validation
- Automatic stock reduction when orders are placed
- Order rejection when product stock is insufficient
- Responsive UI

## Getting Started

### Prerequisites

- Docker & Docker Compose installed

### Run with Docker Compose

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Environment Variables

#### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://postgres:postgres@db:5432/inventory_db |
| CORS_ORIGINS | Comma-separated allowed origins | http://localhost:3000 |

#### Frontend
| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:8000 |

## API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/{id}` - Get single customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

### Orders
- `GET /api/orders` - List all orders
- `GET /api/orders/{id}` - Get single order
- `POST /api/orders` - Create order (auto-reduces stock)
- `DELETE /api/orders/{id}` - Cancel order (restores stock)

## Business Rules

1. **Unique Product SKU** - Each product must have a unique SKU identifier
2. **Unique Customer Email** - No two customers can have the same email
3. **Inventory Validation** - Orders cannot be placed if product stock is insufficient
4. **Automatic Stock Reduction** - Stock is automatically decremented when an order is placed
5. **Stock Restoration** - Cancelling an order restores the stock quantities
