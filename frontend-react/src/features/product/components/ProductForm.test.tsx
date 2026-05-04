import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProductForm } from './ProductForm';

const mockCategories = [
  { id: 1, parentId: null, name: 'Electronics', slug: 'electronics' },
  { id: 2, parentId: null, name: 'Clothing', slug: 'clothing' },
];

describe('ProductForm', () => {
  it('should render all form fields', () => {
    render(<ProductForm categories={mockCategories} onSubmit={vi.fn()} />);

    expect(screen.getByText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByText(/^slug$/i)).toBeInTheDocument();
    expect(screen.getByText(/^category$/i)).toBeInTheDocument();
    expect(screen.getByText(/description/i)).toBeInTheDocument();
    expect(screen.getByText(/thumbnail url/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('should render category options in select', () => {
    render(<ProductForm categories={mockCategories} onSubmit={vi.fn()} />);

    expect(
      screen.getByRole('option', { name: 'Electronics' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Clothing' }),
    ).toBeInTheDocument();
  });

  it('should pre-fill fields when defaultValues provided', () => {
    const mockProduct = {
      id: 1,
      categoryId: 1,
      name: 'iPhone 15',
      slug: 'iphone-15',
      description: 'Great phone',
      thumbnailUrl: null,
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };

    render(
      <ProductForm
        defaultValues={mockProduct}
        categories={mockCategories}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue('iPhone 15')).toBeInTheDocument();
    expect(screen.getByDisplayValue('iphone-15')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Great phone')).toBeInTheDocument();
  });

  it('should show validation error when name is empty', async () => {
    render(<ProductForm categories={mockCategories} onSubmit={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it('should show validation error when slug is empty', async () => {
    render(<ProductForm categories={mockCategories} onSubmit={vi.fn()} />);

    await userEvent.type(screen.getAllByRole('textbox')[0], 'iPhone 15');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/slug is required/i)).toBeInTheDocument();
    });
  });

  it('should show slug format validation error for invalid slug', async () => {
    render(<ProductForm categories={mockCategories} onSubmit={vi.fn()} />);

    const inputs = screen.getAllByRole('textbox');
    await userEvent.type(inputs[0], 'iPhone 15');
    await userEvent.type(inputs[1], 'iPhone 15!');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/only lowercase letters, numbers, hyphens/i),
      ).toBeInTheDocument();
    });
  });

  it('should call onSubmit with form data when valid', async () => {
    const onSubmit = vi.fn();
    render(<ProductForm categories={mockCategories} onSubmit={onSubmit} />);

    const inputs = screen.getAllByRole('textbox');
    await userEvent.type(inputs[0], 'iPhone 15');
    await userEvent.type(inputs[1], 'iphone-15');

    const categorySelect = screen.getByRole('combobox');
    await userEvent.selectOptions(categorySelect, '1');

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'iPhone 15', slug: 'iphone-15', categoryId: 1 }),
        expect.anything(),
      );
    });
  });

  it('should show "Saving..." and disable button when isLoading is true', () => {
    render(
      <ProductForm categories={mockCategories} onSubmit={vi.fn()} isLoading />,
    );

    const button = screen.getByRole('button', { name: /saving/i });
    expect(button).toBeDisabled();
  });
});
