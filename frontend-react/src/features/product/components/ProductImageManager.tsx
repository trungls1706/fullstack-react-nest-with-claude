import { useRef } from 'react';
import { useDeleteProductImage } from '../hooks/useDeleteProductImage';
import { useUploadProductImages } from '../hooks/useUploadProductImages';
import type { ProductImage } from '../types/product.types';

interface Props {
  productId: number;
  images: ProductImage[];
}

export const ProductImageManager = ({ productId, images }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadImages, isPending: isUploading } =
    useUploadProductImages(productId);
  const { mutate: deleteImage, isPending: isDeleting } =
    useDeleteProductImage(productId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    uploadImages(files, {
      onSuccess: () => {
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
    });
  };

  const handleDelete = (image: ProductImage) => {
    if (!confirm('Delete this image?')) return;
    deleteImage(image.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : '+ Upload Images'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-xs text-gray-500">
          Max 5 MB per file. JPEG, PNG, WebP.
        </p>
      </div>

      {images.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 py-12 text-center text-gray-400">
          No images uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image) => (
            <div key={image.id} className="group relative">
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={image.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                onClick={() => handleDelete(image)}
                disabled={isDeleting}
                className="absolute right-1 top-1 hidden rounded-full bg-red-600 p-1 text-white hover:bg-red-700 group-hover:flex disabled:opacity-50"
                title="Delete image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <p className="mt-1 text-center text-xs text-gray-400">
                #{image.sortOrder}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
