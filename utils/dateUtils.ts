export const pad = (n: number): string => String(n).padStart(2, '0');

// Date → DD-MM-YYYY HH:MM
export const dateToDisplay = (d: Date): string =>
  `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

// YYYY-MM-DD → DD-MM-YYYY
export const toDisplayDate = (iso: string): string => {
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
};

// DD-MM-YYYY → YYYY-MM-DD
export const toIsoDate = (display: string): string => {
  const [d, m, y] = display.split('-');
  return `${y}-${m}-${d}`;
};

// DD-MM-YYYY HH:MM → Date
export const displayToDate = (display: string): Date => {
  const [datePart, timePart] = display.split(' ');
  const [d, m, y] = (datePart || '').split('-');
  const [h, min] = (timePart || '00:00').split(':');
  const date = new Date(+y, +m - 1, +d, +h, +min);
  return isNaN(date.getTime()) ? new Date() : date;
};

// DD-MM-YYYY HH:MM → YYYY-MM-DD HH:MM (ISO pour l'API)
export const toIsoDatetime = (display: string): string => {
  const [datePart, timePart = '00:00'] = display.split(' ');
  const [d, m, y] = datePart.split('-');
  const localDate = new Date(`${y}-${m}-${d}T${timePart}:00`);
  return localDate.toISOString().slice(0, 16).replace('T', ' ');
};

// YYYY-MM-DDTHH:MM (input datetime-local web) → DD-MM-YYYY HH:MM
export const fromDatetimeLocal = (s: string): string => {
  if (!s) return '';
  const [datePart, timePart] = s.split('T');
  const [y, m, d] = datePart.split('-');
  return `${d}-${m}-${y} ${timePart?.slice(0, 5) ?? '00:00'}`;
};

// DD-MM-YYYY HH:MM → YYYY-MM-DDTHH:MM (pour input datetime-local web)
export const toDatetimeLocal = (display: string): string => {
  const [datePart, timePart] = display.split(' ');
  const [d, m, y] = (datePart || '').split('-');
  if (!y) return '';
  return `${y}-${m}-${d}T${timePart ?? '00:00'}`;
};
