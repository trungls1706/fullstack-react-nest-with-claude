# Order Feature

## Entities
- `orders` — user orders with JSON snapshot of shipping address
- `order_items` — line items with snapshot of product data (name, sku, price, thumbnailUrl)

## Services
- `OrderService` — list/detail/cancel for users; list/detail/status/payment for admin
- `CheckoutService` — cart → order conversion via DB transaction (pessimistic lock on variants)

## Checkout Flow
1. Get user cart (must be non-empty)
2. Validate address ownership
3. Open QueryRunner transaction
4. For each cart item: pessimistic-write lock variant, validate stock
5. Create Order with shipping_address JSON snapshot
6. Create OrderItems with product data snapshot
7. Decrement stock_quantity on each variant
8. Delete cart items
9. Commit transaction

## Cross-Feature Dependencies
- CartModule → CartRepository (get cart)
- UserProfileModule → AddressRepository (validate address)
- ProductVariant entity accessed via qr.manager (no ProductModule import needed)

## Exports
- OrderService — for future ReviewModule (verify purchase)
- OrderRepository — for admin stats or reporting
