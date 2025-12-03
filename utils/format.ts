export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const parseNumber = (value: string): number => {
  const num = parseFloat(value.replace(/,/g, ''));
  return isNaN(num) ? 0 : num;
};