// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Paleta de cores separada, só pras telas "Sobre" e "Fale
// Conosco" (que têm suporte a modo claro/escuro, diferente do
// resto do app).
// ============================================================
// ============================================================
// TEMA INSTITUCIONAL (telas "Sobre" e "Fale Conosco")
// ------------------------------------------------------------
// Essas duas telas (app/(tabs)/sobre.tsx e app/(tabs)/contato.tsx)
// respeitam o modo claro/escuro do aparelho, diferente da maior
// parte do app (que usa sempre a paleta fixa de
// constants/colors.ts, sem modo escuro).
//
// Por isso elas têm este arquivo de tema próprio: reúne, com
// nome, todas as cores que antes estavam soltas como
// "#1A6BAA", "#CCCCCC" etc espalhadas pelo código.
//
// COMO USAR:
//   import { useColorScheme } from "react-native";
//   import { coresInstitucionais } from "../../constants/temaInstitucional";
//   ...
//   const colorScheme = useColorScheme();
//   const cores = coresInstitucionais(colorScheme);
//   // cores.fundo, cores.cartao, cores.texto, cores.marca, etc.
// ============================================================

export type EsquemaDeCor = "light" | "dark" | null | undefined;

// Cores que MUDAM entre o modo claro e o modo escuro.
const modoClaro = {
  fundoTela: "#F0F0F0",       // fundo da tela (atrás do formulário/conteúdo)
  cartao: "#FFFFFF",          // fundo dos campos/inputs
  texto: "#1A1A1A",
  borda: "#CCCCCC",
  placeholder: "#AAAAAA",     // cor do texto de exemplo dentro dos campos vazios
  textoInativo: "#444444",    // texto dos "chips" de assunto quando NÃO selecionados
};

const modoEscuro = {
  fundoTela: "#121212",
  cartao: "#1E1E1E",
  texto: "#FFFFFF",
  borda: "#3A3A3A",
  placeholder: "#888888",
  textoInativo: "#CCCCCC",
};

// Cores FIXAS, iguais nos dois modos (cor institucional/marca).
const fixas = {
  marca: "#1A6BAA",     // azul institucional - título, botão principal, destaque
  sobreMarca: "#FFFFFF", // cor do texto/ícone em cima da cor "marca"
  obrigatorio: "#CC0000", // asterisco e avisos de campo obrigatório
  sombra: "#000000",
};

// Função principal: recebe o esquema de cor atual do aparelho
// (retornado por useColorScheme()) e devolve o objeto de cores
// já resolvido para light ou dark, pronto para usar no style.
export function coresInstitucionais(colorScheme: EsquemaDeCor) {
  const variavel = colorScheme === "dark" ? modoEscuro : modoClaro;
  return { ...fixas, ...variavel };
}

// Cores fixas exportadas à parte, para uso direto dentro de um
// StyleSheet.create() no nível do módulo (fora de componentes),
// onde não é possível chamar hooks como useColorScheme().
export const coresInstitucionaisFixas = fixas;
