# Cart Feature

## Owns
- CartIcon (header badge)
- CartDrawer / CartPage
- CartItem component
- Cart Zustand store (persisted to localStorage for guest count)

## Key Rules
- Cart items link to `product_variants`, NOT products
- Guest cart: identified by session_id cookie (server manages)
- On login: call POST /cart/merge to merge guest cart
- Cart count in header comes from Zustand store (optimistic) or TanStack Query
