import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CategoryForm } from './CategoryForm';

const mockCategories = [
  { id: 1, parentId: null, name: 'Electronics', slug: 'electronics' },
  { id: 2, parentId: null, name: 'Clothing', slug: 'clothing' },
];

describe('CategoryForm', () => {
  it('should render Name, Slug, and Parent Category fields and Save button', () => {
    render(<CategoryForm onSubmit={vi.fn()} />);

    expect(screen.getByText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByText(/^slug$/i)).toBeInTheDocument();
    expect(screen.getByText(/parent category/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('should render "None (root category)" option in parent select', () => {
    render(<CategoryForm onSubmit={vi.fn()} />);

    expect(screen.getByRole('option', { name: /none/i })).toBeInTheDocument();
  });

  it('should render parent categories in select options', () => {
    render(<CategoryForm categories={mockCategories} onSubmit={vi.fn()} />);

    expect(
      screen.getByRole('option', { name: 'Electronics' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Clothing' }),
    ).toBeInTheDocument();
  });

  it('should pre-fill fields when defaultValues provided', () => {
    render(
      <CategoryForm
        defaultValues={{
          id: 3,
          parentId: 1,
          name: 'Phones',
          slug: 'phones',
        }}
        categories={mockCategories}
        onSubmit={vi.fn()}
      />,
    );

    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('Phones');
    expect(inputs[1]).toHaveValue('phones');
  });

  it('should show validation error when submitted with empty name', async () => {
    render(<CategoryForm onSubmit={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it('should show validation error when submitted with empty slug', async () => {
    render(<CategoryForm onSubmit={vi.fn()} />);

    await userEvent.type(screen.getAllByRole('textbox')[0], 'Electronics');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/slug is required/i)).toBeInTheDocument();
    });
  });

  it('should show slug format validation error for invalid slug', async () => {
    render(<CategoryForm onSubmit={vi.fn()} />);

    const inputs = screen.getAllByRole('textbox');
    await userEvent.type(inputs[0], 'Electronics');
    await userEvent.type(inputs[1], 'Invalid Slug!');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/only lowercase letters, numbers, hyphens/i),
      ).toBeInTheDocument();
    });
  });

  it('should call onSubmit with form data when valid', async () => {
    const onSubmit = vi.fn();
    render(<CategoryForm onSubmit={onSubmit} />);

    const inputs = screen.getAllByRole('textbox');
    await userEvent.type(inputs[0], 'Electronics');
    await userEvent.type(inputs[1], 'electronics');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Electronics', slug: 'electronics' }),
        expect.anything(),
      );
    });
  });

  it('should show "Saving..." and disable button when isLoading is true', () => {
    render(<CategoryForm onSubmit={vi.fn()} isLoading />);

    const button = screen.getByRole('button', { name: /saving/i });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Saving...');
  });
});
