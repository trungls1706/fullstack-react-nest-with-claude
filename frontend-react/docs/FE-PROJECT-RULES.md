# Frontend Project Rules

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 + Vite | Framework |
| TypeScript (strict) | Language |
| Zustand | Global state (auth, cart) |
| TanStack Query | Server state |
| Tailwind CSS | Styling |
| React Hook Form + Zod | Forms |
| React Router v7 | Routing |
| Axios | HTTP client |

---

## 1. Feature Structure

```
src/
├── features/
│   ├── auth/           # login, register, JWT
│   ├── user-profile/   # addresses, settings
│   ├── product/        # catalog, categories, detail
│   ├── cart/           # cart state, guest cart
│   ├── checkout/       # checkout flow
│   ├── order/          # order history
│   └── review/         # product reviews
├── shared/
│   ├── components/     # Button, Input, Modal
│   ├── hooks/          # useDebounce, useLocalStorage
│   ├── layouts/        # MainLayout, AdminLayout
│   ├── lib/            # axios instance, utils
│   └── types/          # common types
├── routes/
│   ├── index.tsx       # createBrowserRouter
│   ├── routes.ts       # ROUTES constants
│   ├── ProtectedRoute.tsx
│   └── AdminRoute.tsx
└── config/
```

**Each feature folder:**
```
features/[feature-name]/
├── components/         # Feature-specific components
├── hooks/              # TanStack Query hooks
├── services/           # API calls
├── stores/             # Zustand (if needed)
├── types/
├── pages/
├── index.ts            # Barrel exports
└── CONTEXT.md
```

---

## 2. Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Feature folders | kebab-case | `user-profile/` |
| Components | PascalCase | `ProductCard.tsx` |
| Hooks | camelCase + use | `useProducts.ts` |
| Services | .service suffix | `product.service.ts` |
| Stores | .store suffix | `cart.store.ts` |
| Types | .types suffix | `product.types.ts` |
| Pages | PascalCase + Page | `ProductListPage.tsx` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Route paths | UPPER_SNAKE_CASE | `ROUTES.PRODUCT_DETAIL` |

---

## 3. Feature Rules

### Feature Boundaries

| Feature | Owns |
|---------|------|
| auth | login, register, logout, auth state |
| user-profile | addresses CRUD, profile settings |
| product | categories, listing, detail, variants |
| cart | cart state, add/remove, guest cart |
| checkout | checkout flow, order creation |
| order | history, detail, cancel |
| review | reviews list, create/edit |

### Cross-Feature Communication

```tsx
// ✅ DO: Import from barrel file
import { useCart } from '@/features/cart';

// ✅ DO: Use URL state
const [searchParams] = useSearchParams();
const categoryId = searchParams.get('category');

// ❌ DON'T: Import internal files
import { CartItem } from '../cart/components/CartItem'; // WRONG
```

---

## 4. Code Patterns

### API Calls (Services + TanStack Query)

```tsx
// services/product.service.ts
export const productService = {
  getAll: (params: ProductParams) => 
    axios.get<ProductListResponse>('/products', { params }),
  getBySlug: (slug: string) => 
    axios.get<Product>(`/products/${slug}`),
};

// hooks/useProducts.ts
export const useProducts = (params: ProductParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getAll(params),
  });
};

// ❌ DON'T: API calls in components
useEffect(() => { axios.get('/products')... }, []); // WRONG
```

### State Management

```tsx
// ✅ Local state first
const [isOpen, setIsOpen] = useState(false);

// ✅ Server state: TanStack Query
const { data, isLoading } = useProducts(params);

// ✅ Global state: Zustand (auth, cart only)
const { user, logout } = useAuthStore();

// ✅ URL state: filters, pagination
const [searchParams, setSearchParams] = useSearchParams();
```

### Routing (React Router v7)

```tsx
// routes/routes.ts
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:slug',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
} as const;

// Usage
import { useNavigate, useParams } from 'react-router'; // NOT react-router-dom

const navigate = useNavigate();
const { slug } = useParams<{ slug: string }>();

navigate(ROUTES.PRODUCT_DETAIL.replace(':slug', slug));
```

### Form Handling

```tsx
// ✅ DO: React Hook Form + Zod
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

### Authentication

```tsx
// ✅ Axios interceptor for auto-refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await refreshToken();
      return axiosInstance(error.config);
    }
    return Promise.reject(error);
  }
);

// ✅ ProtectedRoute with Navigate
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  return children;
};
```

---

## 5. Anti-Patterns (DON'T)

| ❌ DON'T | ✅ DO |
|----------|-------|
| Import feature internals | Use barrel exports (index.ts) |
| API calls in components | Use services + hooks |
| `useEffect` for fetching | Use TanStack Query |
| Server data in Zustand | Use TanStack Query cache |
| Hardcode route paths | Use `ROUTES` constants |
| `import from 'react-router-dom'` | `import from 'react-router'` |
| Inline styles | Use Tailwind classes |
| Use `any` type | Enable strict mode |
| localStorage for tokens | httpOnly cookie + memory |
| Deep prop drilling | Use context or composition |

---

## 6. Component Rules

```tsx
// Structure: Imports → Types → Component → Export

// 1. Imports
import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';

// 2. Types
interface Props {
  categoryId: number;
  onSelect: (id: number) => void;
}

// 3. Component (max 200 lines)
export const ProductList = ({ categoryId, onSelect }: Props) => {
  const { data, isLoading } = useProducts({ categoryId });
  
  if (isLoading) return <ProductListSkeleton />;
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {data?.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

---

## 7. Git Workflow

### Branch Naming
```
feature/cart-guest-merge
fix/checkout-address-validation
refactor/product-list-pagination
```

### Commit Messages
```
feat: add product variant selector
fix: correct cart quantity update
style: improve checkout form layout
```

### PR Requirements
- ✅ One feature/fix per PR
- ✅ Screenshots for UI changes
- ✅ Update CONTEXT.md if logic changes

---

## 8. Testing

| Focus Area | Priority |
|------------|----------|
| Checkout flow | Critical |
| Cart operations | High |
| Auth flow | High |
| Form validations | Medium |

```tsx
// ProductCard.test.tsx
describe('ProductCard', () => {
  it('should add item to cart on click', async () => {
    render(<ProductCard product={mockProduct} />);
    
    await userEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct.id);
  });
});
```

**Skip testing**: Pure UI components, third-party wrappers