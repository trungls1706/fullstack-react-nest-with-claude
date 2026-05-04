import type { Address } from '../types/user-profile.types';

interface Props {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
  isDeleting?: boolean;
  isSettingDefault?: boolean;
}

export const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isDeleting,
  isSettingDefault,
}: Props) => {
  return (
    <div
      className={`rounded-lg border p-4 ${
        address.isDefault ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="mb-2 flex items-start justify-between">
        <div>
          <p className="font-medium text-gray-900">
            {address.fullName}
            {address.isDefault && (
              <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-600">
                Default
              </span>
            )}
          </p>
          <p className="text-sm text-gray-500">{address.phone}</p>
          <p className="text-sm text-gray-500">
            {address.addressLine}, {address.city}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => onEdit(address)}
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          Edit
        </button>
        {!address.isDefault && (
          <>
            <button
              onClick={() => onSetDefault(address.id)}
              disabled={isSettingDefault}
              className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              Set as default
            </button>
            <button
              onClick={() => {
                if (!confirm('Delete this address?')) return;
                onDelete(address.id);
              }}
              disabled={isDeleting}
              className="text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};
