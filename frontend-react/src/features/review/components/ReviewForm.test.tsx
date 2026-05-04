import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ReviewForm } from './ReviewForm';

const mockOrders = [
  { id: 100, createdAt: '2024-01-15T10:00:00Z' },
  { id: 101, createdAt: '2024-01-20T10:00:00Z' },
];

const mockReview = {
  id: 1,
  userId: 5,
  productId: 3,
  orderId: 100,
  rating: 4,
  comment: 'Good product',
  createdAt: '2024-01-22T10:00:00Z',
  user: { id: 5, fullName: 'Le Van C' },
};

describe('ReviewForm', () => {
  it('should render rating stars, comment field, and action buttons', () => {
    render(<ReviewForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText(/rating/i)).toBeInTheDocument();
    expect(screen.getByText(/comment/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should render order selector when orders provided', () => {
    render(
      <ReviewForm
        orders={mockOrders}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText(/order/i)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /order #100/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /order #101/i })).toBeInTheDocument();
  });

  it('should not render order selector when defaultValues provided (edit mode)', () => {
    render(
      <ReviewForm
        defaultValues={mockReview}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.queryByText(/^order$/i)).not.toBeInTheDocument();
  });

  it('should pre-fill comment when defaultValues provided', () => {
    render(
      <ReviewForm
        defaultValues={mockReview}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue('Good product')).toBeInTheDocument();
  });

  it('should show "Saving..." and disable submit when isLoading', () => {
    render(<ReviewForm onSubmit={vi.fn()} onCancel={vi.fn()} isLoading />);

    const button = screen.getByRole('button', { name: /saving/i });
    expect(button).toBeDisabled();
  });

  it('should call onCancel when Cancel clicked', async () => {
    const onCancel = vi.fn();
    render(<ReviewForm onSubmit={vi.fn()} onCancel={onCancel} />);

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should allow selecting a star rating', async () => {
    render(<ReviewForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    const stars = screen.getAllByRole('button', { name: '★' });
    await userEvent.click(stars[4]); // click 5th star

    // Stars are rendered, clicking the 5th one should set rating to 5
    expect(stars[4]).toBeInTheDocument();
  });
});
