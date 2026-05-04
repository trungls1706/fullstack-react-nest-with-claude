import { formatPrice } from '@/shared/utils/format';
import type { ProductVariant } from '../types/product.types';

interface Props {
  variants: ProductVariant[];
  onEdit: (variant: ProductVariant) => void;
}

export const VariantList = ({ variants, onEdit }: Props) => {
  if (variants.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        No variants yet. Add the first one.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              SKU
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Color
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Size
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Sale Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Stock
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {variants.map((variant) => (
            <tr key={variant.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-mono text-gray-900">
                {variant.sku}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {variant.color ?? '—'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {variant.size ?? '—'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {formatPrice(variant.price)}
              </td>
              <td className="px-4 py-3 text-sm text-indigo-600">
                {variant.salePrice ? formatPrice(variant.salePrice) : '—'}
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    variant.stockQuantity > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {variant.stockQuantity}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-sm">
                <button
                  onClick={() => onEdit(variant)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
