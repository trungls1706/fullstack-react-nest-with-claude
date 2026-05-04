import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { VariantList } from './VariantList';

const mockVariants = [
  {
    id: 1,
    productId: 10,
    sku: 'SHIRT-WHITE-L',
    color: 'White',
    size: 'L',
    price: 250000,
    salePrice: null,
    stockQuantity: 50,
  },
  {
    id: 2,
    productId: 10,
    sku: 'SHIRT-BLACK-M',
    color: 'Black',
    size: 'M',
    price: 250000,
    salePrice: 200000,
    stockQuantity: 0,
  },
];

describe('VariantList', () => {
  it('should render empty state when no variants', () => {
    render(<VariantList variants={[]} onEdit={vi.fn()} />);

    expect(screen.getByText(/no variants yet/i)).toBeInTheDocument();
  });

  it('should render table headers', () => {
    render(<VariantList variants={mockVariants} onEdit={vi.fn()} />);

    expect(screen.getByText('SKU')).toBeInTheDocument();
    expect(screen.getByText('Color')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Sale Price')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should render variant SKUs', () => {
    render(<VariantList variants={mockVariants} onEdit={vi.fn()} />);

    expect(screen.getByText('SHIRT-WHITE-L')).toBeInTheDocument();
    expect(screen.getByText('SHIRT-BLACK-M')).toBeInTheDocument();
  });

  it('should render color and size values', () => {
    render(<VariantList variants={mockVariants} onEdit={vi.fn()} />);

    expect(screen.getByText('White')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('Black')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('should show "—" for variants without sale price', () => {
    render(<VariantList variants={mockVariants} onEdit={vi.fn()} />);

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('should show stock quantity badge', () => {
    render(<VariantList variants={mockVariants} onEdit={vi.fn()} />);

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should call onEdit with variant when Edit button is clicked', async () => {
    const onEdit = vi.fn();
    render(<VariantList variants={mockVariants} onEdit={onEdit} />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await userEvent.click(editButtons[0]);

    expect(onEdit).toHaveBeenCalledWith(mockVariants[0]);
  });

  it('should call onEdit with correct variant when second Edit is clicked', async () => {
    const onEdit = vi.fn();
    render(<VariantList variants={mockVariants} onEdit={onEdit} />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await userEvent.click(editButtons[1]);

    expect(onEdit).toHaveBeenCalledWith(mockVariants[1]);
  });
});
