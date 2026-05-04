# Product Feature

## Owns
- `categories` table (self-referencing tree)
- `products` table
- `product_variants` table ⚠️ Cart & Order link here
- `product_images` table

## Responsibilities
- Category CRUD (nested/tree structure)
- Product CRUD with slug
- Variant management (color, size, price, stock)
- Image upload management

## Key Rules
- Cart and Order ALWAYS link to `product_variants`, NEVER to `products`
- Products use soft-delete (`is_active = false`)
- Slug must be unique — generate from product name

## Error Codes
- PROD_001: Product not found
- PROD_002: Variant not found
- PROD_003: Insufficient stock
