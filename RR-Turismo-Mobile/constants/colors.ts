// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// É a PALETA DE CORES oficial do app (azul, laranja, verde,
// vermelho, etc, todos com nome). Qualquer cor usada no app
// vem daqui - assim, pra mudar uma cor em todo lugar de uma vez,
// muda só aqui.
// ============================================================
// ============================================================
// PALETA DE CORES - RR TURISMO
// ------------------------------------------------------------
// Centralizar as cores aqui evita valores "mágicos" espalhados
// pelos componentes e facilita ajustar a identidade visual do
// app em um único lugar.
// ============================================================

export const colors = {
  primary: "#0B3D5C",       // azul escuro - elementos principais (header, botões primários)
  primaryDark: "#072A40",   // variação mais escura, usada em pressed states
  primaryMuted: "#9FB7C9",  // azul claro - textos/ícones inativos sobre fundo azul (ex: abas não selecionadas)
  secondary: "#2CB1BC",     // azul turquesa - detalhes, ícones, links
  accent: "#FF7A3D",        // laranja - preços, botões de destaque, ofertas

  background: "#FFFFFF",
  backgroundMuted: "#F4F7F9", // cinza claro - fundos de tela
  surface: "#FFFFFF",

  text: "#1B2733",
  textSecondary: "#5D6B77",
  textMuted: "#9AA6B2",
  textInverse: "#FFFFFF",

  border: "#E3E8EC",
  success: "#2E9E5B",
  warning: "#E0A400",
  danger: "#E5484D",
  dangerSuave: "#FDECEC",    // fundo claro para caixas de erro

  star: "#F5A623",
  favorite: "#E5484D",

  // Fundo semitransparente usado atrás de ícones sobre fotos
  // (ex: botão de favorito em cima da imagem da viagem).
  overlayLight: "rgba(255,255,255,0.9)",

  // Versões mais sutis, usadas nos "pontinhos" do indicador de
  // fotos da galeria (bolinha inativa) e no fundo do contador
  // "1/3" sobre a foto.
  overlayLightSutil: "rgba(255,255,255,0.6)",
  overlayEscuro: "rgba(0,0,0,0.5)",

  // ---- Radar do Modo Guia (visual de "rastreador de filme") ----
  radarFundo: "#04141F",        // quase preto azulado
  radarLinha: "#0E4A3A",        // círculos e eixos da grade
  radarVerde: "#2EE58A",        // pontos "compartilhando" e varredura
  radarVerdeSuave: "rgba(46,229,138,0.18)", // brilho da varredura
  radarAmarelo: "#FFC83D",      // ponto "distante"
  radarVermelho: "#FF4D5A",     // ponto em "alerta"
  statusSemLocalizacao: "#8A97A3", // cinza: sem sinal
};
