# Product Feature

## Owns
- Product listing page (with filters, pagination via URL params)
- Product detail page
- Category pages
- VariantSelector component

## Key Rules
- Filters/pagination go in URL params (useSearchParams) — shareable, bookmarkable
- Cart/order always use variant IDs, never product IDs directly
- Product images come from `product_images` table
