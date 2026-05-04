// Types
export type {
  Address,
  CreateAddressPayload,
  UpdateAddressPayload,
} from './types/user-profile.types';

// Service
export { addressService } from './services/address.service';

// Hooks
export { useAddresses, ADDRESSES_QUERY_KEY } from './hooks/useAddresses';
export { useCreateAddress } from './hooks/useCreateAddress';
export { useUpdateAddress } from './hooks/useUpdateAddress';
export { useDeleteAddress } from './hooks/useDeleteAddress';
export { useSetDefaultAddress } from './hooks/useSetDefaultAddress';

// Components
export { AddressCard } from './components/AddressCard';
export { AddressForm } from './components/AddressForm';

// Pages
export { ProfilePage } from './pages/ProfilePage';
