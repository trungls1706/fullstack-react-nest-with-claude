# Checkout Feature

## Owns
- CheckoutPage with form (address selection, payment method)
- useCheckout mutation hook
- checkout.service.ts → POST /orders/checkout

## Key Rules
- Requires auth (ProtectedRoute)
- On success: clear cart store, redirect to order confirmation
- On error: show toast, keep form data intact
- Uses addresses from user-profile feature (import via barrel)
