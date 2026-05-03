export const formatPrice = (value: number, currency = 'VND'): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(value);

export const formatDate = (input: string | Date): string =>
  new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(typeof input === 'string' ? new Date(input) : input);
