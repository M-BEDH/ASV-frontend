import { pad, dateToDisplay } from './dateUtils';

describe('pad', () => {
  it('ajoute un zéro devant un nombre à 1 chiffre', () => {
    expect(pad(5)).toBe('05');
  });

  it('ne modifie pas un nombre à 2 chiffres', () => {
    expect(pad(12)).toBe('12');
  });

  it('gère le zéro', () => {
    expect(pad(0)).toBe('00');
  });
});

describe('dateToDisplay', () => {
  it('formate une date au format JJ-MM-AAAA HH:MM', () => {
    const date = new Date(2024, 0, 5, 9, 7); // 5 janvier 2024, 09:07
    expect(dateToDisplay(date)).toBe('05-01-2024 09:07');
  });

  it('formate correctement une date en fin de mois', () => {
    const date = new Date(2023, 11, 31, 23, 59); // 31 décembre 2023, 23:59
    expect(dateToDisplay(date)).toBe('31-12-2023 23:59');
  });

  it('formate correctement minuit (00:00)', () => {
    const date = new Date(2024, 5, 1, 0, 0); // 1er juin 2024, 00:00
    expect(dateToDisplay(date)).toBe('01-06-2024 00:00');
  });
});
