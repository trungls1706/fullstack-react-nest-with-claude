# Order Feature

## Owns
- Order list page (history)
- Order detail page
- Cancel order action

## Key Rules
- Requires auth (ProtectedRoute)
- Orders are immutable snapshots — product info comes from order_items
- Status: pending → confirmed → shipping → delivered / cancelled
