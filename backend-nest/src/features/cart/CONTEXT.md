# Cart Feature

## Owns
- `carts` table
- `cart_items` table

## Responsibilities
- Guest cart (session_id cookie) + logged-in cart (user_id)
- Add / update / remove items
- Merge guest cart on login
- Clear cart after checkout

## Key Rules
- Cart items link to `product_variants`, NOT `products`
- Guest identified by `session_id` cookie
- On login: merge guest cart into user cart via POST /cart/merge

## Error Codes
- CART_001: Cart not found
- CART_002: Cart is empty
