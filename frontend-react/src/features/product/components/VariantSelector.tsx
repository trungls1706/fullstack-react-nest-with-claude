import { useState } from 'react';
import { formatPrice } from '@/shared/utils/format';
import type { ProductVariant } from '../types/product.types';

interface Props {
  variants: ProductVariant[];
  onSelect: (variant: ProductVariant) => void;
}

export const VariantSelector = ({ variants, onSelect }: Props) => {
  const [selected, setSelected] = useState<ProductVariant | null>(null);

  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const handleSelect = (color: string | null, size: string | null) => {
    const match = variants.find(
      (v) =>
        (color === null || v.color === color) &&
        (size === null || v.size === size),
    );
    if (match) {
      setSelected(match);
      onSelect(match);
    }
  };

  return (
    <div className="space-y-4">
      {colors.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700">Color</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color!);
                  handleSelect(color!, selectedSize);
                }}
                className={`rounded-md border px-3 py-1 text-sm ${
                  selectedColor === color
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700">Size</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => {
                  setSelectedSize(size!);
                  handleSelect(selectedColor, size!);
                }}
                className={`rounded-md border px-3 py-1 text-sm ${
                  selectedSize === size
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div className="rounded-md bg-gray-50 p-3 text-sm">
          <p className="font-medium text-gray-900">
            {formatPrice(selected.salePrice ?? selected.price)}
            {selected.salePrice && (
              <span className="ml-2 text-gray-400 line-through">
                {formatPrice(selected.price)}
              </span>
            )}
          </p>
          <p className="mt-1 text-gray-500">
            Stock:{' '}
            <span
              className={
                selected.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'
              }
            >
              {selected.stockQuantity > 0
                ? `${selected.stockQuantity} available`
                : 'Out of stock'}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};
