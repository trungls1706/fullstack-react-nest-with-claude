export type PaymentMethod = 'cod' | 'bank_transfer' | 'card';

export interface CreateOrderPayload {
  addressId: number;
  paymentMethod: PaymentMethod;
  note?: string;
}

export interface Address {
  id: number;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  isDefault: boolean;
}
