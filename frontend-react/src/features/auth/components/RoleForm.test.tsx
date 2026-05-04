import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RoleForm } from './RoleForm';

describe('RoleForm', () => {
  it('should render Role Name field and Save button', () => {
    render(<RoleForm onSubmit={vi.fn()} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('should render "Role Name" label text', () => {
    render(<RoleForm onSubmit={vi.fn()} />);

    expect(screen.getByText(/role name/i)).toBeInTheDocument();
  });

  it('should pre-fill name field when defaultValues provided', () => {
    render(<RoleForm defaultValues={{ id: 1, name: 'admin' }} onSubmit={vi.fn()} />);

    expect(screen.getByRole('textbox')).toHaveValue('admin');
  });

  it('should show validation error when submitted with empty name', async () => {
    render(<RoleForm onSubmit={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it('should call onSubmit with form data when valid', async () => {
    const onSubmit = vi.fn();
    render(<RoleForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByRole('textbox'), 'editor');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ name: 'editor' }, expect.anything());
    });
  });

  it('should show "Saving..." and disable button when isLoading is true', () => {
    render(<RoleForm onSubmit={vi.fn()} isLoading />);

    const button = screen.getByRole('button', { name: /saving/i });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Saving...');
  });

  it('should show validation error when name exceeds 50 characters', async () => {
    render(<RoleForm onSubmit={vi.fn()} />);

    await userEvent.type(screen.getByRole('textbox'), 'a'.repeat(51));
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/max 50 characters/i)).toBeInTheDocument();
    });
  });
});
