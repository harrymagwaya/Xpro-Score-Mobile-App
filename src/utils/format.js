export function formatCurrency(value, currency = 'UGX') {
  const amount = Number(value || 0);
  return `${currency} ${amount.toLocaleString()}`;
}

export function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

export function maskIdentifier(value) {
  if (!value) return '••••••••';
  const text = String(value);
  if (text.length <= 8) return text;
  return `${text.slice(0, 4)}••••${text.slice(-4)}`;
}

export function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '') ?? '-';
}

export function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}
