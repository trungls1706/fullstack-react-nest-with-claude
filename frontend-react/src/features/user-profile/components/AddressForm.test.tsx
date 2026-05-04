import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AddressForm } from './AddressForm';

const mockAddress = {
  id: 1,
  userId: 10,
  fullName: 'Nguyen Van A',
  phone: '0901234567',
  addressLine: '123 ABC Street',
  city: 'Ho Chi Minh',
  isDefault: true,
};

describe('AddressForm', () => {
  it('should render all form fields and action buttons', () => {
    render(<AddressForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText(/full name/i)).toBeInTheDocument();
    expect(screen.getByText(/^phone$/i)).toBeInTheDocument();
    expect(screen.getByText(/^address$/i)).toBeInTheDocument();
    expect(screen.getByText(/^city$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should pre-fill fields when defaultValues provided', () => {
    render(
      <AddressForm
        defaultValues={mockAddress}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0901234567')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123 ABC Street')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ho Chi Minh')).toBeInTheDocument();
  });

  it('should show validation errors when submitted empty', async () => {
    render(<AddressForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/phone is required/i)).toBeInTheDocument();
      expect(screen.getByText(/address is required/i)).toBeInTheDocument();
      expect(screen.getByText(/city is required/i)).toBeInTheDocument();
    });
  });

  it('should call onSubmit with form data when valid', async () => {
    const onSubmit = vi.fn();
    render(<AddressForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByPlaceholderText(/nguyen van a/i), 'Test User');
    await userEvent.type(screen.getByPlaceholderText(/0901234567/i), '0987654321');
    await userEvent.type(screen.getByPlaceholderText(/123 abc street/i), '99 XYZ Road');
    await userEvent.type(screen.getByPlaceholderText(/ho chi minh/i), 'Ha Noi');

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'Test User',
          phone: '0987654321',
          addressLine: '99 XYZ Road',
          city: 'Ha Noi',
        }),
      );
    });
  });

  it('should call onCancel when Cancel button clicked', async () => {
    const onCancel = vi.fn();
    render(<AddressForm onSubmit={vi.fn()} onCancel={onCancel} />);

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should show "Saving..." and disable button when isLoading is true', () => {
    render(<AddressForm onSubmit={vi.fn()} onCancel={vi.fn()} isLoading />);

    const button = screen.getByRole('button', { name: /saving/i });
    expect(button).toBeDisabled();
  });
});
