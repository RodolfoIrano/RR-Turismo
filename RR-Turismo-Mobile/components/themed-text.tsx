// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Um <Text> "inteligente" que muda de cor sozinho no modo claro/
// escuro do aparelho. Usado só nas telas "Sobre" e "Fale Conosco".
// ============================================================
// ============================================================
// COMPONENTE DE EXEMPLO DO TEMPLATE EXPO (<Text> com tema claro/escuro)
// ------------------------------------------------------------
// Vem pronto do template padrão do Expo. Troca a cor do texto
// automaticamente conforme o modo claro/escuro do aparelho (usa
// constants/theme.ts, não constants/colors.ts). É usado nas
// telas "Sobre"/"Contato" e na tela modal de exemplo.
// ============================================================
import { StyleSheet, type TextProps } from 'react-native';
import { Text } from './TextoTraduzido';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string; // Cor a usar no modo claro (sobrepõe o tema padrão)
  darkColor?: string; // Cor a usar no modo escuro
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link'; // Estilo pré-definido de texto
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
