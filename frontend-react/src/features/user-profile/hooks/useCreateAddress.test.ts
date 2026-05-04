import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCreateAddress } from './useCreateAddress';

vi.mock('../services/address.service', () => ({
  addressService: {
    create: vi.fn(),
  },
}));

import { addressService } from '../services/address.service';

const mockAddress = {
  id: 3,
  userId: 10,
  fullName: 'Tran Thi C',
  phone: '0912345678',
  addressLine: '789 GHI Street',
  city: 'Da Nang',
  isDefault: false,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useCreateAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call addressService.create with correct payload', async () => {
    vi.mocked(addressService.create).mockResolvedValue(mockAddress);

    const { result } = renderHook(() => useCreateAddress(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      fullName: 'Tran Thi C',
      phone: '0912345678',
      addressLine: '789 GHI Street',
      city: 'Da Nang',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(addressService.create).toHaveBeenCalledWith({
      fullName: 'Tran Thi C',
      phone: '0912345678',
      addressLine: '789 GHI Street',
      city: 'Da Nang',
    });
  });

  it('should return created address data on success', async () => {
    vi.mocked(addressService.create).mockResolvedValue(mockAddress);

    const { result } = renderHook(() => useCreateAddress(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      fullName: 'Tran Thi C',
      phone: '0912345678',
      addressLine: '789 GHI Street',
      city: 'Da Nang',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockAddress);
  });

  it('should return error state when API fails', async () => {
    vi.mocked(addressService.create).mockRejectedValue(
      new Error('Unauthorized'),
    );

    const { result } = renderHook(() => useCreateAddress(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      fullName: 'Tran Thi C',
      phone: '0912345678',
      addressLine: '789 GHI Street',
      city: 'Da Nang',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
