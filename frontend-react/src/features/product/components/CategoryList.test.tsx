import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryList } from './CategoryList';

const mockDeleteCategory = vi.fn();
const mockNavigate = vi.fn();
let mockIsPending = false;

vi.mock('../hooks/useDeleteCategory', () => ({
  useDeleteCategory: () => ({
    mutate: mockDeleteCategory,
    isPending: mockIsPending,
  }),
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockCategories = [
  { id: 1, parentId: null, name: 'Electronics', slug: 'electronics' },
  { id: 2, parentId: 1, name: 'Phones', slug: 'phones' },
];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

describe('CategoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
  });

  it('should render empty state when no categories', () => {
    render(<CategoryList categories={[]} />, { wrapper });

    expect(screen.getByText(/no categories found/i)).toBeInTheDocument();
  });

  it('should render table headers', () => {
    render(<CategoryList categories={mockCategories} />, { wrapper });

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Slug')).toBeInTheDocument();
    expect(screen.getByText('Parent')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should render list of categories with name and slug', () => {
    render(<CategoryList categories={mockCategories} />, { wrapper });

    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('electronics')).toBeInTheDocument();
    expect(screen.getByText('Phones')).toBeInTheDocument();
    expect(screen.getByText('phones')).toBeInTheDocument();
  });

  it('should show "—" for root category (null parentId)', () => {
    render(<CategoryList categories={mockCategories} />, { wrapper });

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('should navigate to edit page when Edit is clicked', async () => {
    render(<CategoryList categories={mockCategories} />, { wrapper });

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await userEvent.click(editButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/categories/1/edit');
  });

  it('should call deleteCategory with id when confirm accepted', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<CategoryList categories={mockCategories} />, { wrapper });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await userEvent.click(deleteButtons[0]);

    expect(mockDeleteCategory).toHaveBeenCalledWith(1);
  });

  it('should NOT call deleteCategory when confirm is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<CategoryList categories={mockCategories} />, { wrapper });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await userEvent.click(deleteButtons[0]);

    expect(mockDeleteCategory).not.toHaveBeenCalled();
  });

  it('should disable Delete buttons when isPending is true', () => {
    mockIsPending = true;

    render(<CategoryList categories={mockCategories} />, { wrapper });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    deleteButtons.forEach((btn) => expect(btn).toBeDisabled());
  });
});
