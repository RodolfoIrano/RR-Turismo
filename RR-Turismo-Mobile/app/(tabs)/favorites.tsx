// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Atalho antigo. A tela "Favoritos" agora fica em
// app/favoritos/index.tsx; este arquivo só redireciona para lá.
// ============================================================
import { Redirect } from "expo-router";

export default function FavoritosAntigo() {
  return <Redirect href="/favoritos" />;
}
