import { useState } from 'react';
import type { ProductImage } from '../types/product.types';

interface Props {
  images: ProductImage[];
  thumbnailUrl?: string | null;
}

export const ProductImageGallery = ({ images, thumbnailUrl }: Props) => {
  const allImages = [
    ...(thumbnailUrl ? [{ id: 0, productId: 0, imageUrl: thumbnailUrl, sortOrder: -1 }] : []),
    ...images,
  ];

  const [activeUrl, setActiveUrl] = useState<string>(
    allImages[0]?.imageUrl ?? '',
  );

  if (allImages.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100 text-gray-400">
        No images
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
        <img
          src={activeUrl}
          alt="Product"
          className="h-full w-full object-cover"
        />
      </div>

      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img) => (
            <button
              key={img.id}
              onClick={() => setActiveUrl(img.imageUrl)}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 ${
                activeUrl === img.imageUrl
                  ? 'border-indigo-500'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={img.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
