# API Specification

## Overview

| Setting | Value |
|---------|-------|
| Base URL | `/api/v1` |
| Versioning | URL path (`/api/v1/`, `/api/v2/`) |
| Content-Type | `application/json` |
| Encoding | UTF-8 |

---

## Authentication

### Token Flow

```
┌─────────┐     POST /auth/login      ┌─────────┐
│ Client  │ ──────────────────────────▶│ Server  │
│         │◀────────────────────────── │         │
└─────────┘  access_token (body)       └─────────┘
             refresh_token (httpOnly cookie)
```

| Token | Lifetime | Storage |
|-------|----------|---------|
| Access Token | 15 minutes | Client memory/localStorage |
| Refresh Token | 7 days | httpOnly cookie |

### Header Format

```
Authorization: Bearer <access_token>
```

### Protected Routes

- **Public**: Login, Register, Product listing, Categories
- **Protected**: All other endpoints require valid JWT
- **Admin**: Endpoints under `/admin/*` require admin role

### Auth Errors

| Code | Status | Description |
|------|--------|-------------|
| AUTH_001 | 401 | Invalid credentials |
| AUTH_002 | 401 | Token expired |
| AUTH_003 | 401 | Token invalid |
| AUTH_004 | 403 | Insufficient permissions |
| AUTH_005 | 409 | Email already exists |

---

## Request Conventions

### Pagination

```
GET /products?page=2&limit=20
```

| Param | Type | Default | Max |
|-------|------|---------|-----|
| page | number | 1 | - |
| limit | number | 10 | 100 |

### Sorting

```
GET /products?sort=created_at&order=desc
```

### Filtering

```
GET /products?category_id=5&is_active=true
GET /products?min_price=100&max_price=500
GET /orders?status=pending,confirmed
```

### File Upload

```
Content-Type: multipart/form-data
Field: file (single) | files (multiple)
Max size: 5MB/file
Types: image/jpeg, image/png, image/webp
```

---

## Response Format

### Success (Single)

```json
{
  "success": true,
  "data": { "id": 1, "name": "Product" },
  "message": "Created successfully"
}
```

### Success (List + Pagination)

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "PROD_001",
    "message": "Product not found",
    "details": {}
  }
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| **Auth** |||
| AUTH_001 | 401 | Invalid credentials |
| AUTH_002 | 401 | Token expired |
| AUTH_003 | 401 | Token invalid |
| AUTH_004 | 403 | Insufficient permissions |
| AUTH_005 | 409 | Email already exists |
| **Product** |||
| PROD_001 | 404 | Product not found |
| PROD_002 | 404 | Variant not found |
| PROD_003 | 400 | Insufficient stock |
| **Cart** |||
| CART_001 | 404 | Cart not found |
| CART_002 | 400 | Cart is empty |
| **Order** |||
| ORD_001 | 404 | Order not found |
| ORD_002 | 400 | Cannot cancel (shipped) |
| **Review** |||
| REV_001 | 400 | Already reviewed |
| REV_002 | 403 | Must purchase first |
| **System** |||
| SYS_001 | 500 | Internal server error |
| SYS_002 | 400 | Validation error |

---

## Endpoints by Feature

### Auth Feature

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login, get tokens | No |
| POST | `/auth/refresh` | Refresh access token | No* |
| POST | `/auth/logout` | Logout, revoke token | Yes |
| GET | `/auth/me` | Get current user | Yes |
| PATCH | `/auth/me` | Update profile | Yes |
| PATCH | `/auth/change-password` | Change password | Yes |

*Uses refresh token from httpOnly cookie

### User Profile Feature

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/addresses` | List addresses | Yes |
| POST | `/addresses` | Create address | Yes |
| GET | `/addresses/:id` | Get address | Yes |
| PATCH | `/addresses/:id` | Update address | Yes |
| DELETE | `/addresses/:id` | Delete address | Yes |
| PATCH | `/addresses/:id/default` | Set default | Yes |

### Product Feature

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/categories` | List categories (tree) | No |
| GET | `/categories/:slug` | Category + products | No |
| GET | `/products` | List products | No |
| GET | `/products/:slug` | Product + variants | No |
| GET | `/products/:id/variants` | List variants | No |
| GET | `/variants/:id` | Variant detail | No |

**Admin Endpoints:**

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/admin/categories` | Create category | Admin |
| PATCH | `/admin/categories/:id` | Update category | Admin |
| DELETE | `/admin/categories/:id` | Delete category | Admin |
| POST | `/admin/products` | Create product | Admin |
| PATCH | `/admin/products/:id` | Update product | Admin |
| DELETE | `/admin/products/:id` | Soft delete | Admin |
| POST | `/admin/products/:id/variants` | Create variant | Admin |
| PATCH | `/admin/variants/:id` | Update variant | Admin |
| POST | `/admin/products/:id/images` | Upload images | Admin |
| DELETE | `/admin/images/:id` | Delete image | Admin |

### Cart Feature

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/cart` | Get cart | No* |
| POST | `/cart/items` | Add item | No* |
| PATCH | `/cart/items/:id` | Update quantity | No* |
| DELETE | `/cart/items/:id` | Remove item | No* |
| DELETE | `/cart` | Clear cart | No* |
| POST | `/cart/merge` | Merge guest cart | Yes |

*Guest: session_id cookie; Logged-in: user_id

### Order Feature

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/orders` | List user orders | Yes |
| GET | `/orders/:id` | Order detail | Yes |
| POST | `/orders/checkout` | Create order | Yes |
| PATCH | `/orders/:id/cancel` | Cancel order | Yes |

**Admin Endpoints:**

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/admin/orders` | List all orders | Admin |
| PATCH | `/admin/orders/:id/status` | Update status | Admin |
| PATCH | `/admin/orders/:id/payment` | Update payment | Admin |

### Review Feature

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/products/:id/reviews` | List reviews | No |
| POST | `/products/:id/reviews` | Create review | Yes |
| PATCH | `/reviews/:id` | Update review | Yes |
| DELETE | `/reviews/:id` | Delete review | Yes |
| DELETE | `/admin/reviews/:id` | Admin delete | Admin |

---

## Endpoint Details

### POST /auth/register

```json
// Request
{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "Nguyen Van A",
  "phone": "0901234567"
}

// Response 201
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "role": "customer"
  },
  "message": "Registration successful"
}
```

| Error | Status | Condition |
|-------|--------|-----------|
| AUTH_005 | 409 | Email exists |
| SYS_002 | 400 | Invalid email format |

---

### POST /auth/login

```json
// Request
{
  "email": "user@example.com",
  "password": "securePassword123"
}

// Response 200
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "Nguyen Van A",
      "role": "customer"
    }
  }
}
// + Set-Cookie: refreshToken=xxx; HttpOnly; Secure
```

---

### POST /orders/checkout

```json
// Request
{
  "addressId": 5,
  "paymentMethod": "cod",
  "note": "Call before delivery"
}

// Response 201
{
  "success": true,
  "data": {
    "id": 100,
    "status": "pending",
    "paymentMethod": "cod",
    "paymentStatus": "unpaid",
    "shippingFee": 30000,
    "totalAmount": 530000,
    "shippingAddress": {
      "fullName": "Nguyen Van A",
      "phone": "0901234567",
      "addressLine": "123 ABC Street",
      "city": "Ho Chi Minh"
    },
    "items": [
      {
        "productName": "Ao thun nam",
        "sku": "ATN-WHITE-L",
        "price": 250000,
        "quantity": 2,
        "thumbnailUrl": "https://..."
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Business Logic:**
1. Validate stock for all items
2. Snapshot product info → `order_items`
3. Snapshot address → `shipping_address` (JSON)
4. Deduct stock from `product_variants`
5. Clear cart
6. Use database transaction

| Error | Status | Condition |
|-------|--------|-----------|
| CART_002 | 400 | Cart empty |
| PROD_003 | 400 | Insufficient stock |
| USER_001 | 404 | Address not found |

---

### POST /products/:id/reviews

```json
// Request
{
  "orderId": 100,
  "rating": 5,
  "comment": "Great product!"
}

// Response 201
{
  "success": true,
  "data": {
    "id": 50,
    "rating": 5,
    "comment": "Great product!",
    "createdAt": "2024-01-20T15:00:00Z",
    "user": {
      "id": 1,
      "fullName": "Nguyen Van A"
    }
  }
}
```

| Error | Status | Condition |
|-------|--------|-----------|
| REV_002 | 403 | Not purchased |
| REV_001 | 400 | Already reviewed |
| ORD_001 | 404 | Order not found |

---

## NestJS Implementation Notes

```typescript
// Swagger decorators
@ApiTags('orders')
@ApiOperation({ summary: 'Create order from cart' })
@ApiResponse({ status: 201, type: OrderResponseDto })

// Controller
@Post('checkout')
@UseGuards(JwtAuthGuard)
async checkout(
  @CurrentUser() user: User,
  @Body() dto: CreateOrderDto,
): Promise<OrderResponseDto> {
  return this.checkoutService.execute(user.id, dto);
}

// Rate limiting (auth endpoints)
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('login')
async login(@Body() dto: LoginDto) {}
```