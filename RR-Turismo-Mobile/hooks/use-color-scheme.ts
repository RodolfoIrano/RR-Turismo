// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Detecta se o celular está no modo CLARO ou ESCURO. Usado por
// ThemedText, ThemedView e pelas telas "Sobre" e "Fale Conosco".
//
// Nas versões novas do React Native o sistema pode responder
// "unspecified" (sem preferência); aqui isso vira "light", assim
// o resto do app só precisa lidar com dois valores.
// ============================================================
import { useColorScheme as useColorSchemeRN } from 'react-native';

export function useColorScheme(): 'light' | 'dark' {
  return useColorSchemeRN() === 'dark' ? 'dark' : 'light';
}
