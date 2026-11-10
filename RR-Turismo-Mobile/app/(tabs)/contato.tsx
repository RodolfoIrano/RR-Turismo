// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Atalho antigo. A tela "Fale conosco" agora fica em
// app/fale-conosco/index.tsx; este arquivo só redireciona para lá
// (assim qualquer link antigo continua funcionando).
// ============================================================
import { Redirect } from "expo-router";

export default function ContatoAntigo() {
  return <Redirect href="/fale-conosco" />;
}
