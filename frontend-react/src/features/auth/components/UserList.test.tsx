import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserList } from './UserList';
import type { User } from '../types/user.types';

const mockNavigate = vi.fn();
const mockToggleActive = vi.fn();
let mockIsPending = false;

vi.mock('../hooks/useToggleUserActive', () => ({
  useToggleUserActive: () => ({ mutate: mockToggleActive, isPending: mockIsPending }),
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockUsers: User[] = [
  {
    id: 1,
    email: 'admin@example.com',
    fullName: 'Admin User',
    phone: '0901234567',
    roleId: 1,
    role: { id: 1, name: 'admin' },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    email: 'customer@example.com',
    fullName: 'Customer User',
    phone: null,
    roleId: 2,
    role: { id: 2, name: 'customer' },
    isActive: false,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockIsPending = false;
});

describe('UserList', () => {
  it('should show empty state when no users', () => {
    render(<UserList users={[]} />);
    expect(screen.getByText('No users found.')).toBeInTheDocument();
  });

  it('should render user rows', () => {
    render(<UserList users={mockUsers} />);
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('customer@example.com')).toBeInTheDocument();
    expect(screen.getByText('Customer User')).toBeInTheDocument();
  });

  it('should show Active/Inactive status badges', () => {
    render(<UserList users={mockUsers} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('should navigate to edit page when Edit is clicked', async () => {
    render(<UserList users={mockUsers} />);
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await userEvent.click(editButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/admin/users/1/edit');
  });

  it('should call toggleActive when Deactivate is clicked for active user', async () => {
    render(<UserList users={mockUsers} />);
    const deactivateButton = screen.getByRole('button', { name: /deactivate/i });
    await userEvent.click(deactivateButton);
    expect(mockToggleActive).toHaveBeenCalledWith(1);
  });

  it('should call toggleActive when Activate is clicked for inactive user', async () => {
    render(<UserList users={mockUsers} />);
    const activateButton = screen.getByRole('button', { name: /^activate$/i });
    await userEvent.click(activateButton);
    expect(mockToggleActive).toHaveBeenCalledWith(2);
  });

  it('should disable toggle buttons when isPending', () => {
    mockIsPending = true;
    render(<UserList users={mockUsers} />);
    const buttons = screen.getAllByRole('button', { name: /deactivate|activate/i });
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('should show fallback role text when role is missing', () => {
    const userWithoutRole: User = { ...mockUsers[0], role: undefined, roleId: 99 };
    render(<UserList users={[userWithoutRole]} />);
    expect(screen.getByText('Role #99')).toBeInTheDocument();
  });
});
