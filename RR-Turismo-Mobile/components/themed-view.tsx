// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Igual ao themed-text.tsx, mas pro FUNDO (<View>) em vez do
// texto. Usado só nas telas "Sobre" e "Fale Conosco".
// ============================================================
// ============================================================
// COMPONENTE DE EXEMPLO DO TEMPLATE EXPO (<View> com tema claro/escuro)
// ------------------------------------------------------------
// Igual ao ThemedText, mas para o fundo (background) de uma View.
// ============================================================
import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
