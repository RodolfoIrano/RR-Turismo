// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Define SOMBRAS padronizadas (dá profundidade/elevação pros
// cards, deixando eles "flutuarem" em vez de ficarem chapados).
// Use assim, dentro de qualquer StyleSheet.create:
//
//   card: {
//     ...shadows.card,
//     backgroundColor: colors.surface,
//     ...
//   }
//
// No iOS a sombra é feita com shadowColor/Offset/Opacity/Radius;
// no Android é feita com a propriedade "elevation" - por isso os
// dois grupos de propriedades aparecem juntos aqui, cobrindo as
// duas plataformas de uma vez.
// ============================================================
import { Platform } from "react-native";

// Sombra leve - usada nos cards de viagem/guia/categoria nas listas.
export const card = Platform.select({
  ios: {
    shadowColor: "#0B1F33",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  android: {
    elevation: 3,
  },
  default: {},
});

// Sombra um pouco mais forte - usada em elementos "flutuantes"
// por cima do conteúdo, tipo botões fixos ou modais.
export const elevated = Platform.select({
  ios: {
    shadowColor: "#0B1F33",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
  },
  android: {
    elevation: 8,
  },
  default: {},
});

export const shadows = { card, elevated };
export default shadows;
