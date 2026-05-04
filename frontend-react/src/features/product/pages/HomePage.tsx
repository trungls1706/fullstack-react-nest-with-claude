import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { ProductCard } from '../components/ProductCard';
import type { Category } from '../types/product.types';

/* ─── Flatten Category Tree ────────────────────────────────── */
const flattenCategories = (cats: Category[]): Category[] => {
  const result: Category[] = [];
  const walk = (list: Category[]) => {
    for (const c of list) {
      result.push(c);
      if (c.children?.length) walk(c.children);
    }
  };
  walk(cats);
  return result;
};

/* ─── Category Sidebar Filter ───────────────────────────────── */
const CategoryFilter = ({
  categories,
  selectedId,
  onSelect,
}: {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}) => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggle = (id: number) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const renderCategory = (cat: Category, depth = 0) => {
    const hasChildren = cat.children && cat.children.length > 0;
    const isExpanded = expanded[cat.id] ?? true; // default expanded
    const isActive = selectedId === cat.id;

    return (
      <div key={cat.id}>
        <button
          onClick={() => onSelect(isActive ? null : cat.id)}
          className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
            isActive
              ? 'bg-indigo-50 text-indigo-700 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          {hasChildren && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                toggle(cat.id);
              }}
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
            >
              <svg
                className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </span>
          )}
          {!hasChildren && <span className="w-5 flex-shrink-0" />}
          <span className="truncate">{cat.name}</span>
          {isActive && (
            <svg className="ml-auto h-4 w-4 flex-shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          )}
        </button>
        {hasChildren && isExpanded && (
          <div className="mt-0.5">
            {cat.children!.map((child) => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-0.5">
      {/* "All" option */}
      <button
        onClick={() => onSelect(null)}
        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
          selectedId === null
            ? 'bg-indigo-50 text-indigo-700 shadow-sm'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
        </svg>
        All Products
        {selectedId === null && (
          <svg className="ml-auto h-4 w-4 flex-shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        )}
      </button>
      {categories.map((cat) => renderCategory(cat))}
    </div>
  );
};

/* ─── Mobile Category Chips ─────────────────────────────────── */
const MobileCategoryChips = ({
  categories,
  selectedId,
  onSelect,
}: {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}) => {
  const flat = flattenCategories(categories);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
          selectedId === null
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
            : 'bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50'
        }`}
      >
        All
      </button>
      {flat.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(selectedId === cat.id ? null : cat.id)}
          className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            selectedId === cat.id
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};

/* ─── Pagination ────────────────────────────────────────────── */
const Pagination = ({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  const pages: (number | 'dots')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== 'dots') {
      pages.push('dots');
    }
  }

  return (
    <div className="mt-10 flex items-center justify-center gap-1.5">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>
      {pages.map((p, i) =>
        p === 'dots' ? (
          <span key={`dots-${i}`} className="px-2 text-gray-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[36px] rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              p === page
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
};

/* ─── Product Skeleton ──────────────────────────────────────── */
const ProductSkeleton = () => (
  <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
    <div className="aspect-square animate-pulse bg-gray-100" />
    <div className="p-4 space-y-2.5">
      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
      <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
    </div>
  </div>
);

/* ─── HomePage ──────────────────────────────────────────────── */
export const HomePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const categoryId = searchParams.get('category')
    ? Number(searchParams.get('category'))
    : null;
  const page = Number(searchParams.get('page') ?? 1);

  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: productsData, isLoading: productsLoading } = useProducts({
    limit: 12,
    page,
    categoryId: categoryId ?? undefined,
    isActive: true,
  });

  const products = productsData?.data ?? [];
  const meta = productsData?.meta;

  const handleCategorySelect = (id: number | null) => {
    setSearchParams((prev) => {
      if (id === null) {
        prev.delete('category');
      } else {
        prev.set('category', String(id));
      }
      prev.set('page', '1');
      return prev;
    });
    setSidebarOpen(false);
  };

  const handlePageChange = (p: number) => {
    setSearchParams((prev) => {
      prev.set('page', String(p));
      return prev;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find selected category name
  const findCategoryName = (cats: Category[], id: number): string | null => {
    for (const c of cats) {
      if (c.id === id) return c.name;
      if (c.children?.length) {
        const found = findCategoryName(c.children, id);
        if (found) return found;
      }
    }
    return null;
  };
  const selectedCategoryName = categoryId && categories
    ? findCategoryName(categories, categoryId)
    : null;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-950 px-4 py-20 sm:py-28">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-indigo-600/20 blur-[100px]" />
          <div className="absolute -bottom-20 right-0 h-60 w-60 rounded-full bg-purple-600/20 blur-[80px]" />
          <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[60px]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-gray-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            New arrivals weekly
          </div>
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Discover Premium
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> Products</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-400">
            Explore our curated collection of high-quality items. From electronics to fashion, find everything you need at unbeatable prices.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => navigate(ROUTES.PRODUCTS)}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:brightness-110"
            >
              Shop Now
            </button>
            <button
              onClick={() => {
                document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              Browse Collection
            </button>
          </div>
        </div>
      </section>

      {/* Main Content: Sidebar + Products */}
      <section id="products-section" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sidebar (Desktop) */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-20 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-900">
                <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                </svg>
                Categories
              </h2>
              {catLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 animate-pulse rounded-lg bg-gray-100" />
                  ))}
                </div>
              ) : categories ? (
                <CategoryFilter
                  categories={categories}
                  selectedId={categoryId}
                  onSelect={handleCategorySelect}
                />
              ) : null}
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {/* Header bar */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedCategoryName || 'All Products'}
                </h2>
                {meta && (
                  <p className="mt-1 text-sm text-gray-500">
                    {meta.total} product{meta.total !== 1 ? 's' : ''} found
                  </p>
                )}
              </div>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 lg:hidden"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                </svg>
                Filters
                {categoryId && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                    1
                  </span>
                )}
              </button>
            </div>

            {/* Mobile category chips */}
            <div className="mb-6 lg:hidden">
              {categories && (
                <MobileCategoryChips
                  categories={categories}
                  selectedId={categoryId}
                  onSelect={handleCategorySelect}
                />
              )}
            </div>

            {/* Active filter badge */}
            {selectedCategoryName && (
              <div className="mb-5 flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Filter:</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                  {selectedCategoryName}
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className="rounded-full p-0.5 transition-colors hover:bg-indigo-100"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </div>
            )}

            {/* Products grid */}
            {productsLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try removing filters or check back later.
                </p>
                {categoryId && (
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className="mt-4 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {meta && (
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </section>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Panel */}
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">Categories</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {categories && (
                <CategoryFilter
                  categories={categories}
                  selectedId={categoryId}
                  onSelect={handleCategorySelect}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
