// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Notificações do app (avisos que aparecem no topo do celular):
//   - "Compra confirmada" assim que a reserva é feita;
//   - "Sua viagem é amanhã" agendada para um dia antes da viagem.
// São notificações LOCAIS: o próprio aparelho as mostra, sem servidor.
//
// SEGURANÇA: tudo aqui é "à prova de falha". Se o aparelho não permitir
// (ou o recurso não existir no emulador), a função só não faz nada -
// a compra NUNCA deixa de funcionar por causa de uma notificação.
//
// ✏️ ONDE MUDAR O QUÊ:
//   - Textos dos avisos ........ funções avisarCompraConfirmada / agendarLembreteDaViagem
//   - Horário do lembrete ...... HORA_DO_LEMBRETE
// ============================================================
import { Platform } from "react-native";

const HORA_DO_LEMBRETE = 9; // 9h da manhã, um dia antes da viagem
const CANAL = "reservas";

// Carrega o módulo só na hora de usar e protege contra qualquer erro.
function carregar(): typeof import("expo-notifications") | null {
  try {
    return require("expo-notifications");
  } catch {
    return null;
  }
}

let preparado = false;

// Deixa o aviso aparecer mesmo com o app aberto + cria o canal do Android.
export async function prepararNotificacoes(): Promise<boolean> {
  const Notifications = carregar();
  if (!Notifications) return false;
  try {
    if (!preparado) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(CANAL, {
          name: "Reservas",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
      preparado = true;
    }

    const atual = await Notifications.getPermissionsAsync();
    if (atual.granted) return true;
    if (!atual.canAskAgain) return false;
    const pedido = await Notifications.requestPermissionsAsync();
    return pedido.granted;
  } catch {
    return false;
  }
}

export async function avisarCompraConfirmada(codigo: string, titulosDasViagens: string[]): Promise<void> {
  const Notifications = carregar();
  if (!Notifications) return;
  try {
    if (!(await prepararNotificacoes())) return;
    const resumo =
      titulosDasViagens.length === 1 ? titulosDasViagens[0] : `${titulosDasViagens.length} viagens`;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Compra confirmada! ✈️",
        body: `Pedido ${codigo} • ${resumo}. Boa viagem!`,
      },
      trigger: null, // agora
    });
  } catch {
    // sem notificação, a compra segue normal
  }
}

// Agenda "sua viagem é amanhã" para as 9h do dia anterior (se ainda for no futuro).
export async function agendarLembreteDaViagem(titulo: string, dataIdaIso?: string): Promise<void> {
  const Notifications = carregar();
  if (!Notifications || !dataIdaIso) return;
  try {
    const ida = new Date(dataIdaIso);
    if (Number.isNaN(ida.getTime())) return;
    const aviso = new Date(ida);
    aviso.setDate(aviso.getDate() - 1);
    aviso.setHours(HORA_DO_LEMBRETE, 0, 0, 0);
    if (aviso.getTime() <= Date.now()) return;
    if (!(await prepararNotificacoes())) return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Sua viagem é amanhã! 🧳",
        body: `${titulo}: confira os detalhes e prepare a mala.`,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: aviso },
    });
  } catch {
    // ignora
  }
}
