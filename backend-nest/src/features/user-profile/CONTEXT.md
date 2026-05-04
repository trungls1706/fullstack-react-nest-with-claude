# User Profile Feature

## Owns
- `addresses` table

## Responsibilities
- CRUD for user shipping addresses
- Set default address

## Key Rules
- A user can have multiple addresses
- Only one address can be `is_default = true` at a time
- Orders snapshot address to JSON — changes here don't affect past orders
