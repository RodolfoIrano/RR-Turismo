// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela "Perfil" (aba). Mostra capa + foto do usuário (toque para
// trocar), um resumo (reservas, realizadas, salvas), as fileiras
// "Próximas viagens", "Viagens realizadas" e "Salvas", e os
// atalhos para Reservas, Modo Guia, Configurações e Sair.
// ============================================================
import React, { useCallback, useMemo, useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "../../components/TextoTraduzido";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

import { useAuth } from "../../contexts/AuthContext";
import { useCatalogo } from "../../contexts/CatalogoContext";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useTraducao } from "../../traducoes/TraducaoContext";
import TabHeader from "../../components/TabHeader";
import PerfilVisitante from "../../components/PerfilVisitante";
import CabecalhoDoPerfil from "../../components/perfil/CabecalhoDoPerfil";
import MiniCartaoViagem from "../../components/perfil/MiniCartaoViagem";
import Aparece from "../../components/auth/Aparece";
import { usePerfilImagens } from "../../hooks/usePerfilImagens";
import * as bookingService from "../../services/bookingService";
import { VISITANTE } from "../../services/ArmazenamentoPorConta";
import { DataDaViagem } from "../../utils/datas";
import type { Booking, Trip } from "../../types";

// Uma viagem "realizada" é uma reserva confirmada cuja data de volta
// (ou de ida, se não tiver volta) já passou.
function jaAconteceu(b: Booking): boolean {
  const dias = new DataDaViagem(b.dataVolta ?? b.dataIda).diasRestantes();
  return dias !== null && dias < 0;
}

export default function Profile() {
  const router = useRouter();
  const { user, signOut, isAuthenticated } = useAuth();
  const { t } = useTraducao();
  const { buscarViagem } = useCatalogo();
  const { favorites } = useFavorites();

  // Foto + capa (busca, troca e envio) - ver hooks/usePerfilImagens.ts
  const imagens = usePerfilImagens();

  // Reservas do usuário: recarrega toda vez que a aba ganha foco, assim
  // uma compra nova já aparece aqui sem precisar reabrir o app.
  const [reservas, setReservas] = useState<Booking[]>([]);
  const dono = user?.id ?? VISITANTE;
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      bookingService.getBookings(dono).then((lista) => ativo && setReservas(lista)).catch(() => {});
      return () => { ativo = false; };
    }, [dono])
  );

  // Separa as reservas em "próximas" e "realizadas" e transforma
  // cada uma na viagem correspondente do catálogo.
  const { proximas, realizadas } = useMemo(() => {
    const validas = reservas.filter((b) => b.status !== "Cancelada");
    const comViagem = (b: Booking) => ({ reserva: b, viagem: buscarViagem(b.tripId) });
    const lista = validas.map(comViagem).filter((x): x is { reserva: Booking; viagem: Trip } => !!x.viagem);
    return {
      proximas: lista.filter((x) => !jaAconteceu(x.reserva)),
      realizadas: lista.filter((x) => x.reserva.status === "Confirmada" && jaAconteceu(x.reserva)),
    };
  }, [reservas, buscarViagem]);

  const salvas = useMemo(
    () => favorites.map((f) => buscarViagem(f.tripId)).filter((v): v is Trip => !!v),
    [favorites, buscarViagem]
  );

  async function handleLogout() {
    await signOut();
    router.replace("/(tabs)");
  }

  // Visitante (sem login): mostra o convite para entrar, nunca dados de perfil.
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <TabHeader title={t.perfil.titulo} />
        <PerfilVisitante />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <TabHeader title={t.perfil.titulo} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
        <CabecalhoDoPerfil
          nome={user?.name ?? ""}
          email={user?.email}
          ehGuia={user?.guia}
          foto={imagens.foto}
          banner={imagens.banner}
          enviandoFoto={imagens.enviandoFoto}
          enviandoBanner={imagens.enviandoBanner}
          aoTrocarFoto={imagens.trocarFoto}
          aoTrocarBanner={imagens.trocarBanner}
        />

        {/* RESUMO */}
        <Aparece atraso={80}>
          <View style={styles.resumo}>
            <Numero valor={proximas.length} rotulo="Próximas" icone="airplane-outline" />
            <View style={styles.divisor} />
            <Numero valor={realizadas.length} rotulo="Realizadas" icone="checkmark-done-outline" />
            <View style={styles.divisor} />
            <Numero valor={salvas.length} rotulo="Salvas" icone="heart-outline" />
          </View>
        </Aparece>

        {/* FILEIRAS DE VIAGENS */}
        <Aparece atraso={160}>
          <Fileira titulo="Próximas viagens" icone="airplane-outline" vazio="Quando você reservar uma viagem, ela aparece aqui.">
            {proximas.map(({ reserva, viagem }) => (
              <MiniCartaoViagem
                key={reserva.id}
                viagem={viagem}
                icone="time-outline"
                detalhe={new DataDaViagem(reserva.dataIda).contagem() ?? new DataDaViagem(reserva.dataIda).curta()}
              />
            ))}
          </Fileira>
        </Aparece>

        <Aparece atraso={220}>
          <Fileira titulo="Viagens realizadas" icone="checkmark-done-outline" vazio="As viagens que você já fez ficam guardadas aqui.">
            {realizadas.map(({ reserva, viagem }) => (
              <MiniCartaoViagem
                key={reserva.id}
                viagem={viagem}
                icone="checkmark-circle-outline"
                detalhe={new DataDaViagem(reserva.dataVolta ?? reserva.dataIda).curta()}
              />
            ))}
          </Fileira>
        </Aparece>

        <Aparece atraso={280}>
          <Fileira titulo="Viagens salvas" icone="heart-outline" vazio="Toque no coração de uma viagem para salvá-la.">
            {salvas.map((viagem) => (
              <MiniCartaoViagem key={viagem.id} viagem={viagem} icone="location-outline" detalhe={viagem.location} />
            ))}
          </Fileira>
        </Aparece>

        {/* ATALHOS */}
        <Aparece atraso={340}>
          <View style={styles.menu}>
            <MenuItem icon="briefcase-outline" label={t.perfil.minhasReservas} onPress={() => router.push("/bookings")} />

            {/* Modo Guia: só aparece para quem tem Cadastro.guia = true */}
            {user?.guia && (
              <MenuItem icon="radio-outline" label={t.aoVivo.modoGuia} onPress={() => router.push("/modo-guia")} />
            )}

            <MenuItem icon="heart-outline" label={t.perfil.favoritos} onPress={() => router.push("/favoritos")} />
            <MenuItem icon="chatbubbles-outline" label="Fale conosco" onPress={() => router.push("/fale-conosco")} />
            <MenuItem icon="information-circle-outline" label="Sobre nós" onPress={() => router.push("/sobre-nos")} />
            <MenuItem icon="settings-outline" label={t.perfil.configuracoes} onPress={() => router.push("/settings")} />
            <MenuItem icon="log-out-outline" label={t.perfil.sair} onPress={handleLogout} danger semDivisor />
          </View>
        </Aparece>
      </ScrollView>
    </SafeAreaView>
  );
}

// Um número do resumo (ex: "2  Próximas").
function Numero({ valor, rotulo, icone }: { valor: number; rotulo: string; icone: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.numero}>
      <Ionicons name={icone} size={18} color={colors.secondary} />
      <Text style={styles.numeroValor}>{valor}</Text>
      <Text style={styles.numeroRotulo}>{rotulo}</Text>
    </View>
  );
}

// Título + fileira horizontal de viagens (ou mensagem se estiver vazia).
function Fileira({
  titulo, icone, vazio, children,
}: { titulo: string; icone: keyof typeof Ionicons.glyphMap; vazio: string; children: React.ReactNode }) {
  const temItens = React.Children.count(children) > 0;
  return (
    <View style={styles.fileira}>
      <View style={styles.fileiraTitulo}>
        <View style={styles.fileiraIcone}>
          <Ionicons name={icone} size={16} color={colors.secondary} />
        </View>
        <Text style={styles.fileiraTexto}>{titulo}</Text>
      </View>

      {temItens ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fileiraLista}>
          {children}
        </ScrollView>
      ) : (
        <Text style={[typography.bodyMuted, styles.vazio]}>{vazio}</Text>
      )}
    </View>
  );
}


// ============================================================
// COMPONENTE DE ITEM DO MENU
// ------------------------------------------------------------
// Componente reutilizável para cada opção do perfil.
//
// Recebe:
// - icon: ícone que será exibido
// - label: texto da opção
// - onPress: ação executada ao tocar
// - danger: indica se o item deve utilizar uma cor de alerta
// ============================================================
function MenuItem({
  icon,
  label,
  onPress,
  danger,
  semDivisor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
  semDivisor?: boolean;
}) {

  return (
    <TouchableOpacity
      style={[styles.menuItem, semDivisor && { borderBottomWidth: 0 }]}
      onPress={onPress}
      accessibilityRole="button"
    >

      {/* Ícone da opção */}
      <Ionicons
        name={icon}
        size={20}
        color={
          danger
            ? colors.danger
            : colors.text
        }
      />


      {/* Nome da opção */}
      <Text
        style={[
          typography.body,
          styles.menuLabel,
          danger && {
            color: colors.danger,
          },
        ]}
      >
        {label}
      </Text>


      {/* Seta indicando que a opção pode ser acessada */}
      <Ionicons
        name="chevron-forward"
        size={18}
        color={colors.textMuted}
      />

    </TouchableOpacity>
  );
}


// ============================================================
// ESTILOS
// ------------------------------------------------------------
// Define o layout, espaçamentos, tamanhos e aparência dos
// elementos da tela de perfil.
//
// Todas as cores vêm de constants/colors.ts (nenhum "#hexcode"
// solto aqui), para manter a identidade visual centralizada.
// ============================================================
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // Cartão com os 3 números (próximas / realizadas / salvas)
  resumo: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    shadowColor: "#001146",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  numero: { flex: 1, alignItems: "center", gap: 2 },
  numeroValor: { fontSize: 22, fontWeight: "700", color: colors.primary },
  numeroRotulo: { fontSize: 12, color: colors.textSecondary, fontWeight: "600" },
  divisor: { width: 1, height: 36, backgroundColor: colors.border },

  // Fileiras de viagens
  fileira: { marginTop: spacing.xl },
  fileiraTitulo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  fileiraIcone: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "rgba(26,86,219,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  fileiraTexto: { fontSize: 17, fontWeight: "700", color: colors.primary },
  fileiraLista: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  vazio: { paddingHorizontal: spacing.lg },

  // Atalhos (cartão arredondado)
  menu: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.backgroundMuted,
    borderRadius: radius.xl,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLabel: { flex: 1, marginLeft: spacing.md },
});
