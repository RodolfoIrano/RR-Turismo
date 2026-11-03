// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// O Alert nativo (janelinha de aviso/confirmação) não é um <Text>,
// então não é traduzido sozinho. Esta função devolve um "Alert"
// que traduz o título, a mensagem e os botões antes de mostrar.
//
// Uso numa tela:
//   const { traduzir } = useTraducao();
//   const Alert = criarAlertaTraduzido(traduzir);
//   Alert.alert("Título", "Mensagem", [{ text: "OK" }]);
// ============================================================
import { Alert as AlertaNativo, AlertButton } from "react-native";

export function criarAlertaTraduzido(traduzir: (texto: string) => string) {
  return {
    alert(titulo: string, mensagem?: string, botoes?: AlertButton[]) {
      AlertaNativo.alert(
        traduzir(titulo),
        mensagem ? traduzir(mensagem) : mensagem,
        botoes?.map((b) => ({ ...b, text: b.text ? traduzir(b.text) : b.text })),
      );
    },
  };
}
