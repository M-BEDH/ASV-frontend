export const pad = (n: number): string => String(n).padStart(2, '0');

export const dateToDisplay = (d: Date): string =>
  `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
