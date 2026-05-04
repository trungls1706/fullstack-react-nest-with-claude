import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleList } from './RoleList';

const mockDeleteRole = vi.fn();
const mockNavigate = vi.fn();
let mockIsPending = false;

vi.mock('../hooks/useDeleteRole', () => ({
  useDeleteRole: () => ({ mutate: mockDeleteRole, isPending: mockIsPending }),
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockRoles = [
  { id: 1, name: 'admin' },
  { id: 2, name: 'customer' },
];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

describe('RoleList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
  });

  it('should render empty state when no roles', () => {
    render(<RoleList roles={[]} />, { wrapper });

    expect(screen.getByText(/no roles found/i)).toBeInTheDocument();
  });

  it('should render list of roles with ID and Name', () => {
    render(<RoleList roles={mockRoles} />, { wrapper });

    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('customer')).toBeInTheDocument();
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('should navigate to edit page when Edit is clicked', async () => {
    render(<RoleList roles={mockRoles} />, { wrapper });

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await userEvent.click(editButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/roles/1/edit');
  });

  it('should call deleteRole with role id when confirm accepted', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<RoleList roles={mockRoles} />, { wrapper });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await userEvent.click(deleteButtons[0]);

    expect(mockDeleteRole).toHaveBeenCalledWith(1);
  });

  it('should NOT call deleteRole when confirm is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<RoleList roles={mockRoles} />, { wrapper });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await userEvent.click(deleteButtons[0]);

    expect(mockDeleteRole).not.toHaveBeenCalled();
  });

  it('should disable Delete buttons when isPending is true', () => {
    mockIsPending = true;

    render(<RoleList roles={mockRoles} />, { wrapper });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    deleteButtons.forEach((btn) => expect(btn).toBeDisabled());
  });
});
