// ─── Types ───────────────────────────────────────────────────────────────────
export type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductQueryParams,
  ProductVariant,
  CreateVariantPayload,
  UpdateVariantPayload,
  ProductImage,
} from './types/product.types';

// ─── Services ─────────────────────────────────────────────────────────────────
export { categoryService } from './services/category.service';
export { productService } from './services/product.service';

// ─── Hooks: Categories ────────────────────────────────────────────────────────
export { useCategories, CATEGORIES_QUERY_KEY } from './hooks/useCategories';
export { useCategory } from './hooks/useCategory';
export { useCreateCategory } from './hooks/useCreateCategory';
export { useUpdateCategory } from './hooks/useUpdateCategory';
export { useDeleteCategory } from './hooks/useDeleteCategory';

// ─── Hooks: Products ──────────────────────────────────────────────────────────
export { useProducts, productsQueryKey } from './hooks/useProducts';
export { useProduct, productQueryKey } from './hooks/useProduct';
export { useAdminProducts, adminProductsQueryKey } from './hooks/useAdminProducts';
export { useCreateProduct } from './hooks/useCreateProduct';
export { useUpdateProduct } from './hooks/useUpdateProduct';
export { useDeleteProduct } from './hooks/useDeleteProduct';

// ─── Hooks: Variants & Images ─────────────────────────────────────────────────
export { useProductVariants, productVariantsQueryKey } from './hooks/useProductVariants';
export { useCreateVariant } from './hooks/useCreateVariant';
export { useUpdateVariant } from './hooks/useUpdateVariant';
export { useUploadProductImages } from './hooks/useUploadProductImages';
export { useDeleteProductImage } from './hooks/useDeleteProductImage';

// ─── Components ───────────────────────────────────────────────────────────────
export { CategoryList } from './components/CategoryList';
export { CategoryForm } from './components/CategoryForm';
export { ProductList } from './components/ProductList';
export { ProductForm } from './components/ProductForm';
export { ProductCard } from './components/ProductCard';
export { VariantList } from './components/VariantList';
export { VariantForm } from './components/VariantForm';
export { VariantSelector } from './components/VariantSelector';
export { ProductImageGallery } from './components/ProductImageGallery';
export { ProductImageManager } from './components/ProductImageManager';
