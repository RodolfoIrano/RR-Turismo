// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Define os TAMANHOS E PESOS DE FONTE usados no app (título,
// subtítulo, texto normal, etc), pra manter consistência visual.
// ============================================================
import { colors } from "./colors";

// Tipografia padronizada para manter hierarquia visual em todo o app.
export const typography = {
  h1: { fontSize: 26, fontWeight: "700" as const, color: colors.text },
  h2: { fontSize: 20, fontWeight: "700" as const, color: colors.text },
  h3: { fontSize: 17, fontWeight: "600" as const, color: colors.text },
  body: { fontSize: 15, fontWeight: "400" as const, color: colors.text },
  bodyMuted: { fontSize: 14, fontWeight: "400" as const, color: colors.textSecondary },
  caption: { fontSize: 12, fontWeight: "400" as const, color: colors.textMuted },
  price: { fontSize: 18, fontWeight: "700" as const, color: colors.accent },
  button: { fontSize: 15, fontWeight: "700" as const, color: colors.textInverse },
};
