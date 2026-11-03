// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Versões "inteligentes" de <Text> e <TextInput> que TRADUZEM
// sozinhas o que mostram, conforme o idioma escolhido no globo.
// Funcionam igual aos originais do React Native (mesmas
// propriedades), só acrescentam a tradução automática.
//
// Por isso TODAS as telas importam Text daqui, e não de
// "react-native": é assim que o app inteiro é traduzido sem
// ninguém escrever tradução à mão.
// ============================================================
import React from "react";
import {
  Text as TextoNativo,
  TextInput as CampoNativo,
  TextProps,
  TextInputProps,
  HostInstance,
  TextInputInstance,
} from "react-native";
import { useTraducaoOpcional } from "../traducoes/TraducaoContext";

// Traduz os "filhos" do texto: só mexe nas strings; números e outros
// componentes (ex: um <Text> aninhado) passam direto.
function traduzirFilhos(filhos: React.ReactNode, traduzir: (s: string) => string): React.ReactNode {
  if (typeof filhos === "string") return traduzir(filhos);
  if (Array.isArray(filhos)) {
    return filhos.map((filho, i) =>
      typeof filho === "string" ? traduzir(filho) : Array.isArray(filho) ? (
        <React.Fragment key={i}>{traduzirFilhos(filho, traduzir)}</React.Fragment>
      ) : (
        filho
      ),
    );
  }
  return filhos;
}

export const Text = React.forwardRef<HostInstance, TextProps>(function Text(props, ref) {
  const contexto = useTraducaoOpcional();
  if (!contexto || contexto.idioma === "pt") return <TextoNativo ref={ref} {...props} />;
  return (
    <TextoNativo ref={ref} {...props}>
      {traduzirFilhos(props.children, contexto.traduzir)}
    </TextoNativo>
  );
});

export const TextInput = React.forwardRef<TextInputInstance, TextInputProps>(function TextInput(props, ref) {
  const contexto = useTraducaoOpcional();
  const placeholder =
    contexto && contexto.idioma !== "pt" && typeof props.placeholder === "string"
      ? contexto.traduzir(props.placeholder)
      : props.placeholder;
  return <CampoNativo ref={ref} {...props} placeholder={placeholder} />;
});
