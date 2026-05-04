# Review Feature

## Owns
- `reviews` table — 3-way link: user + product + order

## Responsibilities
- List reviews for a product (public, paginated)
- Create review with verified-purchase enforcement
- Update/delete own review
- Admin delete any review

## Key Business Rules
- User must have purchased the product via the given order (REV_002)
- One review per user per product per order — Unique(userId, productId, orderId) (REV_001)
- Reviews link to `products`, NOT `product_variants`

## Purchase Verification Flow
1. Find order by orderId + userId (ownership check)
2. Check order.items[].productVariant.productId === productId

## Cross-Feature Dependencies
- ProductModule → ProductRepository (verify product exists)
- OrderModule → OrderRepository (verify purchase)

## Exports
- ReviewService (available to future features)
