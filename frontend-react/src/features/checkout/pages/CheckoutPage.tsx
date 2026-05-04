import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ROUTES } from '@/routes/routes';
import { formatPrice } from '@/shared/utils/format';
import { useCart } from '@/features/cart/hooks/useCart';
import { useAddresses } from '../hooks/useAddresses';
import { useCheckout } from '../hooks/useCheckout';
import type { PaymentMethod } from '../types/checkout.types';

const schema = z.object({
  addressId: z.number().min(1, 'Please select a delivery address'),
  paymentMethod: z.enum(['cod', 'bank_transfer', 'card'] as const),
});

type FormValues = z.infer<typeof schema>;

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'card', label: 'Credit / Debit Card' },
];

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const { mutate: placeOrder, isPending } = useCheckout();
  const [orderError, setOrderError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: 'cod' },
  });

  const selectedAddressId = watch('addressId');

  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, item) => {
    const price = item.productVariant?.salePrice ?? item.productVariant?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);
  const shippingFee = subtotal > 500000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  const onSubmit = (values: FormValues) => {
    setOrderError(null);
    placeOrder(values, {
      onSuccess: (order) => {
        navigate(ROUTES.ORDER_DETAIL.replace(':id', String(order.id)));
      },
      onError: () => {
        setOrderError('Failed to place order. Please try again.');
      },
    });
  };

  if (cartLoading || addressesLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-lg bg-gray-100 lg:col-span-2" />
          <div className="h-48 animate-pulse rounded-lg bg-gray-100" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center">
        <p className="text-gray-500">Your cart is empty.</p>
        <button
          onClick={() => navigate(ROUTES.PRODUCTS)}
          className="mt-4 rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: Address + Payment */}
          <div className="space-y-6 lg:col-span-2">
            {/* Delivery address */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-base font-semibold text-gray-900">
                Delivery Address
              </h2>

              {!addresses || addresses.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No saved addresses.{' '}
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.PROFILE)}
                    className="text-indigo-600 hover:underline"
                  >
                    Add one in your profile.
                  </button>
                </p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${
                        Number(selectedAddressId) === Number(addr.id)
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        className="mt-1"
                        checked={Number(selectedAddressId) === Number(addr.id)}
                        onChange={() => setValue('addressId', Number(addr.id))}
                      />
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">
                          {addr.fullName}
                          {addr.isDefault && (
                            <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-600">
                              Default
                            </span>
                          )}
                        </p>
                        <p className="text-gray-500">{addr.phone}</p>
                        <p className="text-gray-500">
                          {addr.addressLine}, {addr.city}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {errors.addressId && (
                <p className="mt-2 text-xs text-red-500">
                  {errors.addressId.message}
                </p>
              )}
            </div>

            {/* Payment method */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-base font-semibold text-gray-900">
                Payment Method
              </h2>
              <div className="space-y-3">
                {PAYMENT_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-3"
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      {...register('paymentMethod')}
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Right: Order summary */}
          <div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-base font-semibold text-gray-900">
                Order Summary
              </h2>

              <div className="mb-4 space-y-3">
                {items.map((item) => {
                  const price =
                    item.productVariant?.salePrice ??
                    item.productVariant?.price ??
                    0;
                  return (
                    <div key={item.id} className="flex items-start gap-2">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                        {item.productVariant?.product?.thumbnailUrl ? (
                          <img
                            src={item.productVariant.product.thumbnailUrl}
                            alt={item.productVariant.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 text-xs text-gray-700">
                        <p className="font-medium">
                          {item.productVariant?.product?.name ?? 'Product'}
                        </p>
                        <p className="text-gray-400">×{item.quantity}</p>
                      </div>
                      <p className="text-xs font-medium text-gray-900">
                        {formatPrice(price * item.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {orderError && (
                <p className="mt-3 text-xs text-red-500">{orderError}</p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="mt-5 w-full rounded-md bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isPending ? 'Placing order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
