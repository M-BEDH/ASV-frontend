import React from 'react';
import { render, screen } from '@testing-library/react-native';
import FieldLabel from './FieldLabel';

// On isole le composant de son contexte de thème
jest.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: { textSecondary: '#575b63' },
  }),
}));

describe('FieldLabel', () => {
  it("affiche le texte du label", () => {
    render(<FieldLabel>Nom de l'animal</FieldLabel>);
    expect(screen.getByText("Nom de l'animal")).toBeTruthy();
  });

  it("n'affiche pas 'requis' par défaut", () => {
    render(<FieldLabel>Espèce</FieldLabel>);
    expect(screen.queryByText('requis')).toBeNull();
  });

  it("affiche 'requis' quand required={true}", () => {
    render(<FieldLabel required>Date de naissance</FieldLabel>);
    expect(screen.getByText('requis')).toBeTruthy();
  });
});
