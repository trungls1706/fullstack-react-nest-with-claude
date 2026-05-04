export interface CartItem {
  id: number;
  cartId: number;
  productVariantId: number;
  quantity: number;
  productVariant?: {
    id: number;
    sku: string;
    color: string | null;
    size: string | null;
    price: number;
    salePrice: number | null;
    stockQuantity: number;
    product?: {
      id: number;
      name: string;
      slug: string;
      thumbnailUrl: string | null;
    };
  };
}

export interface Cart {
  id: number;
  userId: number | null;
  sessionId: string | null;
  items: CartItem[];
}

export interface AddToCartPayload {
  productVariantId: number;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}
