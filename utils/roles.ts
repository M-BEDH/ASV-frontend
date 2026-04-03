export function roleLabel(role?: string | null): string {
  if (role === 'veterinaire') return 'Vétérinaire';
  if (role === 'assistant') return 'Assistant(e)';
  if (role === 'responsable') return 'Responsable';
  if (role === 'benevole') return 'Bénévole';
  return 'Client';
}

export function roleBgColor(role?: string | null, colors?: any): string {
  if (role === 'veterinaire') return colors.roleVet;
  if (role === 'assistant') return colors.roleAssistant;
  if (role === 'responsable') return colors.roleResponsable;
  if (role === 'benevole') return colors.roleBenevole;
  return colors.roleClient;
}
