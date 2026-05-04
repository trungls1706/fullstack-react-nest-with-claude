// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  children?: Category[];
}

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  parentId?: number | null;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  parentId?: number | null;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  categoryId: number;
  category?: Pick<Category, 'id' | 'name' | 'slug'>;
  name: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface CreateProductPayload {
  categoryId: number;
  name: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
}

export interface UpdateProductPayload {
  categoryId?: number;
  name?: string;
  slug?: string;
  description?: string;
  thumbnailUrl?: string;
  isActive?: boolean;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  categoryId?: number;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ─── Product Variant ──────────────────────────────────────────────────────────

export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  color: string | null;
  size: string | null;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
}

export interface CreateVariantPayload {
  sku: string;
  color?: string;
  size?: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
}

export interface UpdateVariantPayload {
  sku?: string;
  color?: string;
  size?: string;
  price?: number;
  salePrice?: number;
  stockQuantity?: number;
}

// ─── Product Image ────────────────────────────────────────────────────────────

export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  sortOrder: number;
}
