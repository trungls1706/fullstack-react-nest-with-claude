// Types
export type {
  Address,
  CreateOrderPayload,
  PaymentMethod,
} from './types/checkout.types';

// Service
export { checkoutService } from './services/checkout.service';

// Hooks
export { useAddresses, ADDRESSES_QUERY_KEY } from './hooks/useAddresses';
export { useCheckout } from './hooks/useCheckout';

// Pages
export { CheckoutPage } from './pages/CheckoutPage';
