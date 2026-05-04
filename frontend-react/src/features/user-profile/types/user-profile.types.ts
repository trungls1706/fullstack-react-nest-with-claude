export interface Address {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  isDefault: boolean;
}

export interface CreateAddressPayload {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
}

export interface UpdateAddressPayload {
  fullName?: string;
  phone?: string;
  addressLine?: string;
  city?: string;
}
