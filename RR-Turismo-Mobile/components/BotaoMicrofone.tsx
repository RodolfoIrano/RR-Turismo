// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Botão de MICROFONE: SEGURE para falar, SOLTE para escrever o
// que foi dito no campo. Usa o ReconhecedorDeVoz (fala -> texto).
//
// Se o app estiver no Expo Go (sem o módulo de voz), o toque mostra
// uma dica: usar o microfone do TECLADO do celular, que faz o mesmo
// e funciona em qualquer lugar.
// ============================================================
import React, { useRef, useState } from "react";
import { Alert, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { radius } from "../constants/spacing";
import { ReconhecedorDeVoz } from "../services/ReconhecedorDeVoz";
import { useTraducao } from "../traducoes/TraducaoContext";

interface Props {
  idiomaFala?: string;                      // idioma em que a pessoa vai falar (padrão: o do app)
  aoTexto: (texto: string, final: boolean) => void;
  tamanho?: number;
  aoSemSuporte?: () => void;                // chamado quando não há reconhecimento de voz
}

export default function BotaoMicrofone({ idiomaFala, aoTexto, tamanho = 22, aoSemSuporte }: Props) {
  const { idioma, t, traduzir } = useTraducao();
  const reconhecedor = useRef(new ReconhecedorDeVoz()).current;
  const [ouvindo, setOuvindo] = useState(false);

  async function comecar() {
    if (!ReconhecedorDeVoz.disponivel) {
      if (aoSemSuporte) aoSemSuporte();
      else Alert.alert(traduzir(t.voz.indisponivelTitulo), traduzir(t.voz.indisponivelTexto));
      return;
    }
    setOuvindo(true);
    const ok = await reconhecedor.iniciar(
      idiomaFala ?? idioma,
      aoTexto,
      (erro) => {
        setOuvindo(false);
        if (erro === "permissao") Alert.alert(traduzir(t.voz.permissaoMicrofone));
      },
    );
    if (!ok) setOuvindo(false);
  }

  function terminar() {
    reconhecedor.parar();
    setOuvindo(false);
  }

  return (
    <Pressable
      onPressIn={comecar}
      onPressOut={terminar}
      style={[styles.botao, ouvindo && styles.ouvindo]}
      accessibilityRole="button"
      accessibilityLabel={traduzir(t.voz.segureParaFalar)}
      hitSlop={8}
    >
      <Ionicons name={ouvindo ? "mic" : "mic-outline"} size={tamanho} color={ouvindo ? colors.textInverse : colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: { padding: 6, borderRadius: radius.full },
  ouvindo: { backgroundColor: colors.danger },
});
