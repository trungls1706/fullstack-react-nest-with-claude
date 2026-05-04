export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipping'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cod' | 'bank_transfer' | 'card';
export type PaymentStatus = 'unpaid' | 'paid';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productVariantId: number;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  thumbnailUrl: string | null;
}

export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingFee: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderListItem {
  id: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}
