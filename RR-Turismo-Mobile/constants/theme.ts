// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ (SEM USO DIRETO NO APP):
// Tema padrão que veio pronto do template do Expo. É usado só
// pelos componentes de exemplo (themed-text/themed-view) das
// telas "Sobre" e "Fale Conosco" - o resto do app usa
// constants/colors.ts.
// ============================================================
/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// ============================================================
// NOTA: este arquivo é o tema padrão gerado pelo template do
// Expo (com suporte a modo claro/escuro), usado só pelos
// componentes de exemplo que vieram prontos no template
// (themed-text.tsx, themed-view.tsx, collapsible.tsx etc).
//
// A paleta de cores DE VERDADE do app RR Turismo (usada em
// quase todas as telas) é outra: constants/colors.ts. Os dois
// arquivos são independentes de propósito - não foram unidos
// para não alterar o comportamento dos componentes de exemplo.
// ============================================================

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
