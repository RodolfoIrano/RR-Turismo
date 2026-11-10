// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Atalho antigo. A tela "Sobre nós" agora fica em
// app/sobre-nos/index.tsx; este arquivo só redireciona para lá.
// ============================================================
import { Redirect } from "expo-router";

export default function SobreAntigo() {
  return <Redirect href="/sobre-nos" />;
}
