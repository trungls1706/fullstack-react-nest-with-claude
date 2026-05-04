import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { VariantForm } from './VariantForm';

describe('VariantForm', () => {
  it('should render all form fields', () => {
    render(<VariantForm onSubmit={vi.fn()} />);

    expect(screen.getByText(/^sku$/i)).toBeInTheDocument();
    expect(screen.getByText(/^stock$/i)).toBeInTheDocument();
    expect(screen.getByText(/^color$/i)).toBeInTheDocument();
    expect(screen.getByText(/^size$/i)).toBeInTheDocument();
    expect(screen.getByText(/price \(vnd\)/i)).toBeInTheDocument();
    expect(screen.getByText(/sale price/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /save variant/i }),
    ).toBeInTheDocument();
  });

  it('should pre-fill fields when defaultValues provided', () => {
    const mockVariant = {
      id: 1,
      productId: 10,
      sku: 'SHIRT-WHITE-L',
      color: 'White',
      size: 'L',
      price: 250000,
      salePrice: null,
      stockQuantity: 100,
    };

    render(<VariantForm defaultValues={mockVariant} onSubmit={vi.fn()} />);

    expect(screen.getByDisplayValue('SHIRT-WHITE-L')).toBeInTheDocument();
    expect(screen.getByDisplayValue('White')).toBeInTheDocument();
    expect(screen.getByDisplayValue('L')).toBeInTheDocument();
    expect(screen.getByDisplayValue('250000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
  });

  it('should show validation error when SKU is empty', async () => {
    render(<VariantForm onSubmit={vi.fn()} />);

    await userEvent.click(
      screen.getByRole('button', { name: /save variant/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/sku is required/i)).toBeInTheDocument();
    });
  });

  it('should show validation error when price is missing', async () => {
    render(<VariantForm onSubmit={vi.fn()} />);

    await userEvent.type(screen.getByPlaceholderText(/e\.g\. shirt/i), 'SKU-001');
    await userEvent.click(
      screen.getByRole('button', { name: /save variant/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/price is required/i)).toBeInTheDocument();
    });
  });

  it('should call onSubmit with form data when valid', async () => {
    const onSubmit = vi.fn();
    render(<VariantForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByPlaceholderText(/e\.g\. shirt/i), 'SKU-001');
    await userEvent.type(screen.getByPlaceholderText('250000'), '250000');
    await userEvent.type(screen.getByPlaceholderText('0'), '50');

    await userEvent.click(
      screen.getByRole('button', { name: /save variant/i }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          sku: 'SKU-001',
          price: 250000,
          stockQuantity: 50,
        }),
        expect.anything(),
      );
    });
  });

  it('should show "Saving..." and disable button when isLoading is true', () => {
    render(<VariantForm onSubmit={vi.fn()} isLoading />);

    const button = screen.getByRole('button', { name: /saving/i });
    expect(button).toBeDisabled();
  });
});
