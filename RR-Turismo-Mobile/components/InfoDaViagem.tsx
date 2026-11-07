// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Mostra TODOS os dados que o criador cadastrou no site para a
// viagem, em "azulejos" organizados: data de ida e volta, duração,
// vagas, transporte, hospedagem e categoria. No topo, um aviso com
// a contagem regressiva ("Faltam 12 dias"), que se atualiza sozinho.
// ============================================================
import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./TextoTraduzido";
import { colors } from "../constants/colors";
import { radius, spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { Trip } from "../types";
import { useTraducao } from "../traducoes/TraducaoContext";
import { DataDaViagem, useContagemDias } from "../utils/datas";

type Icone = keyof typeof Ionicons.glyphMap;

// Um azulejo: ícone, rótulo pequeno e valor.
function Azulejo({ icone, rotulo, valor, destaque }: { icone: Icone; rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <View style={styles.azulejo}>
      <View style={styles.iconeCaixa}>
        <Ionicons name={icone} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rotulo}>{rotulo}</Text>
        <Text style={[styles.valor, destaque && { color: colors.danger }]} numberOfLines={2}>{valor}</Text>
      </View>
    </View>
  );
}

export default function InfoDaViagem({ trip }: { trip: Trip }) {
  const { t } = useTraducao();
  const contagem = useContagemDias(trip.dataIda);
  const ida = new DataDaViagem(trip.dataIda);
  const volta = new DataDaViagem(trip.dataVolta);

  const total = trip.assentos ?? 0;
  const ocupadas = trip.participantes ?? 0;
  const restantes = Math.max(total - ocupadas, 0);
  const esgotado = total > 0 && restantes === 0;

  return (
    <View>
      {/* Contagem regressiva (só se a data existe e ainda não passou) */}
      {contagem && ida.valida && (ida.diasRestantes() ?? -1) >= 0 && (
        <View style={styles.contagem}>
          <Ionicons name="hourglass-outline" size={20} color={colors.textInverse} />
          <Text style={styles.contagemTexto}>{contagem}</Text>
        </View>
      )}

      <View style={styles.grade}>
        <Azulejo icone="airplane-outline" rotulo={t.viagem.ida} valor={ida.valida ? ida.curta() : t.viagem.naoInformado} />
        <Azulejo icone="calendar-outline" rotulo={t.viagem.volta} valor={volta.valida ? volta.curta() : t.viagem.naoInformado} />
        <Azulejo
          icone="time-outline"
          rotulo={t.viagem.duracao}
          valor={`${trip.duration} ${trip.duration === 1 ? t.viagem.dia : t.viagem.dias}`}
        />
        <Azulejo
          icone="people-outline"
          rotulo={t.viagem.vagas}
          valor={total > 0 ? (esgotado ? t.viagem.esgotado : `${restantes} ${t.viagem.vagasRestantes} / ${total}`) : t.viagem.naoInformado}
          destaque={esgotado}
        />
        <Azulejo icone="bus-outline" rotulo={t.viagem.transporte} valor={trip.transporte || t.viagem.naoInformado} />
        <Azulejo icone="bed-outline" rotulo={t.viagem.hospedagem} valor={trip.hotel || t.viagem.naoInformado} />
        <Azulejo icone="pricetag-outline" rotulo={t.viagem.categoria} valor={trip.category || t.viagem.naoInformado} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contagem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  contagemTexto: { ...typography.h3, color: colors.textInverse },
  grade: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  azulejo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    width: "48.5%",
    backgroundColor: "#EEF1FA",
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  iconeCaixa: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  rotulo: { ...typography.caption, color: colors.textMuted },
  valor: { ...typography.body, fontWeight: "700" },
});
