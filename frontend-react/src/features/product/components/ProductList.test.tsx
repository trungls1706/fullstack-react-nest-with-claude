import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductList } from './ProductList';

const mockDeleteProduct = vi.fn();
const mockNavigate = vi.fn();
let mockIsPending = false;

vi.mock('../hooks/useDeleteProduct', () => ({
  useDeleteProduct: () => ({
    mutate: mockDeleteProduct,
    isPending: mockIsPending,
  }),
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockProducts = [
  {
    id: 1,
    categoryId: 1,
    category: { id: 1, name: 'Electronics', slug: 'electronics' },
    name: 'iPhone 15',
    slug: 'iphone-15',
    description: null,
    thumbnailUrl: null,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    categoryId: 2,
    category: { id: 2, name: 'Clothing', slug: 'clothing' },
    name: 'Basic T-Shirt',
    slug: 'basic-t-shirt',
    description: null,
    thumbnailUrl: 'https://example.com/tshirt.jpg',
    isActive: false,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

describe('ProductList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
  });

  it('should render empty state when no products', () => {
    render(<ProductList products={[]} />, { wrapper });

    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });

  it('should render table headers', () => {
    render(<ProductList products={mockProducts} />, { wrapper });

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should render product names and categories', () => {
    render(<ProductList products={mockProducts} />, { wrapper });

    expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    expect(screen.getByText('Basic T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Clothing')).toBeInTheDocument();
  });

  it('should show Active/Inactive status badges', () => {
    render(<ProductList products={mockProducts} />, { wrapper });

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('should render thumbnail image when thumbnailUrl is provided', () => {
    render(<ProductList products={mockProducts} />, { wrapper });

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/tshirt.jpg');
  });

  it('should navigate to edit page when Edit is clicked', async () => {
    render(<ProductList products={mockProducts} />, { wrapper });

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await userEvent.click(editButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/products/1/edit');
  });

  it('should navigate to variants page when Variants is clicked', async () => {
    render(<ProductList products={mockProducts} />, { wrapper });

    const variantsButtons = screen.getAllByRole('button', { name: /variants/i });
    await userEvent.click(variantsButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/products/1/variants');
  });

  it('should call deleteProduct with id when confirm accepted', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<ProductList products={mockProducts} />, { wrapper });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await userEvent.click(deleteButtons[0]);

    expect(mockDeleteProduct).toHaveBeenCalledWith(1);
  });

  it('should NOT call deleteProduct when confirm is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<ProductList products={mockProducts} />, { wrapper });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await userEvent.click(deleteButtons[0]);

    expect(mockDeleteProduct).not.toHaveBeenCalled();
  });

  it('should disable Delete buttons when isPending is true', () => {
    mockIsPending = true;

    render(<ProductList products={mockProducts} />, { wrapper });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    deleteButtons.forEach((btn) => expect(btn).toBeDisabled());
  });
});
