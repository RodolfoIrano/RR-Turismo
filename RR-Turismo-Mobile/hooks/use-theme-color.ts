// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Escolhe a cor certa (clara ou escura) pra usar em cada
// momento. Usado pelos componentes themed-text/themed-view.
// ============================================================
/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

// Escolhe a cor certa (constants/theme.ts) para o modo claro ou
// escuro atual. Se o componente que chamou já passou uma cor
// específica (props.light/props.dark), essa tem prioridade.
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
