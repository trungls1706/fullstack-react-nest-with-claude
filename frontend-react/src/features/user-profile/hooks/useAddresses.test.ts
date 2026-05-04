import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAddresses } from './useAddresses';

vi.mock('../services/address.service', () => ({
  addressService: {
    getAll: vi.fn(),
  },
}));

import { addressService } from '../services/address.service';

const mockAddresses = [
  {
    id: 1,
    userId: 10,
    fullName: 'Nguyen Van A',
    phone: '0901234567',
    addressLine: '123 ABC Street',
    city: 'Ho Chi Minh',
    isDefault: true,
  },
  {
    id: 2,
    userId: 10,
    fullName: 'Nguyen Van B',
    phone: '0909999999',
    addressLine: '456 DEF Street',
    city: 'Ha Noi',
    isDefault: false,
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useAddresses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', () => {
    vi.mocked(addressService.getAll).mockResolvedValue(mockAddresses);

    const { result } = renderHook(() => useAddresses(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should return addresses on success', async () => {
    vi.mocked(addressService.getAll).mockResolvedValue(mockAddresses);

    const { result } = renderHook(() => useAddresses(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockAddresses);
    expect(result.current.data).toHaveLength(2);
  });

  it('should return error state when API fails', async () => {
    vi.mocked(addressService.getAll).mockRejectedValue(
      new Error('Unauthorized'),
    );

    const { result } = renderHook(() => useAddresses(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });

  it('should call addressService.getAll exactly once on mount', async () => {
    vi.mocked(addressService.getAll).mockResolvedValue(mockAddresses);

    const { result } = renderHook(() => useAddresses(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(addressService.getAll).toHaveBeenCalledTimes(1);
  });
});
