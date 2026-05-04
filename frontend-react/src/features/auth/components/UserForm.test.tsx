import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserForm } from './UserForm';
import type { User } from '../types/user.types';
import type { Role } from '../types/role.types';

const mockRoles: Role[] = [
  { id: 1, name: 'admin' },
  { id: 2, name: 'customer' },
];

const mockUser: User = {
  id: 1,
  email: 'admin@example.com',
  fullName: 'Admin User',
  phone: '0901234567',
  roleId: 1,
  role: { id: 1, name: 'admin' },
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('UserForm', () => {
  it('should render all fields and submit button', () => {
    render(<UserForm roles={mockRoles} onSubmit={vi.fn()} />);
    expect(screen.getAllByRole('textbox').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('should show Full Name and Phone labels', () => {
    render(<UserForm roles={mockRoles} onSubmit={vi.fn()} />);
    expect(screen.getByText(/full name/i)).toBeInTheDocument();
    expect(screen.getByText(/phone/i)).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
  });

  it('should pre-fill values from defaultValues', () => {
    render(<UserForm roles={mockRoles} defaultValues={mockUser} onSubmit={vi.fn()} />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('Admin User');
    expect(inputs[1]).toHaveValue('0901234567');
  });

  it('should show validation error when fullName is empty', async () => {
    render(<UserForm roles={mockRoles} onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
    });
  });

  it('should call onSubmit with form data', async () => {
    const mockSubmit = vi.fn();
    render(<UserForm roles={mockRoles} onSubmit={mockSubmit} />);

    const inputs = screen.getAllByRole('textbox');
    await userEvent.type(inputs[0], 'New User');
    await userEvent.type(inputs[1], '0909090909');
    await userEvent.selectOptions(screen.getByRole('combobox'), '1');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        { fullName: 'New User', phone: '0909090909', roleId: 1 },
        expect.anything(),
      );
    });
  });

  it('should show Saving... and disable button when isLoading', () => {
    render(<UserForm roles={mockRoles} onSubmit={vi.fn()} isLoading={true} />);
    const btn = screen.getByRole('button', { name: /saving/i });
    expect(btn).toBeDisabled();
  });

  it('should render role options from roles prop', () => {
    render(<UserForm roles={mockRoles} onSubmit={vi.fn()} />);
    expect(screen.getByRole('option', { name: 'admin' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'customer' })).toBeInTheDocument();
  });
});
