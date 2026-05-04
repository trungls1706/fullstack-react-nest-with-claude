import { useState } from 'react';
import { useAddresses } from '../hooks/useAddresses';
import { useCreateAddress } from '../hooks/useCreateAddress';
import { useUpdateAddress } from '../hooks/useUpdateAddress';
import { useDeleteAddress } from '../hooks/useDeleteAddress';
import { useSetDefaultAddress } from '../hooks/useSetDefaultAddress';
import { AddressCard } from '../components/AddressCard';
import { AddressForm } from '../components/AddressForm';
import type { Address, CreateAddressPayload } from '../types/user-profile.types';

type FormMode = { type: 'create' } | { type: 'edit'; address: Address } | null;

export const ProfilePage = () => {
  const [formMode, setFormMode] = useState<FormMode>(null);

  const { data: addresses, isLoading, isError } = useAddresses();
  const { mutate: createAddress, isPending: isCreating } = useCreateAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();
  const { mutate: setDefault, isPending: isSettingDefault } =
    useSetDefaultAddress();

  const handleSubmit = (data: CreateAddressPayload) => {
    if (formMode?.type === 'edit') {
      updateAddress(
        { id: formMode.address.id, data },
        { onSuccess: () => setFormMode(null) },
      );
    } else {
      createAddress(data, { onSuccess: () => setFormMode(null) });
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Addresses section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Delivery Addresses
          </h2>
          {!formMode && (
            <button
              onClick={() => setFormMode({ type: 'create' })}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              + Add Address
            </button>
          )}
        </div>

        {/* Form panel */}
        {formMode && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              {formMode.type === 'edit' ? 'Edit Address' : 'New Address'}
            </h3>
            <AddressForm
              defaultValues={
                formMode.type === 'edit' ? formMode.address : undefined
              }
              isLoading={isCreating || isUpdating}
              onSubmit={handleSubmit}
              onCancel={() => setFormMode(null)}
            />
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg bg-gray-100"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            Failed to load addresses.
          </div>
        ) : !addresses || addresses.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center">
            <p className="text-gray-500">No addresses yet.</p>
            <button
              onClick={() => setFormMode({ type: 'create' })}
              className="mt-3 text-sm font-medium text-indigo-600 hover:underline"
            >
              Add your first address
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <AddressCard
                key={addr.id}
                address={addr}
                onEdit={(a) => setFormMode({ type: 'edit', address: a })}
                onDelete={(id) => deleteAddress(id)}
                onSetDefault={(id) => setDefault(id)}
                isDeleting={isDeleting}
                isSettingDefault={isSettingDefault}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
