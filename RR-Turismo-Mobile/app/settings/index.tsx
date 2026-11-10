// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela de CONFIGURAÇÕES: uma lista de opções (Editar perfil,
// Idioma, Minhas reservas, Favoritos, Ajuda, Fale conosco, Sobre).
// Cada linha abre a sua própria tela.
// ============================================================
import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "../../components/TextoTraduzido";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

import { useAuth } from "../../contexts/AuthContext";
import { useTraducao } from "../../traducoes/TraducaoContext";
import { buscarInfoIdioma } from "../../traducoes/idiomasDisponiveis";
import Aparece from "../../components/auth/Aparece";

type Icone = keyof typeof Ionicons.glyphMap;

export default function Configuracoes() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { idioma } = useTraducao();
  const info = buscarInfoIdioma(idioma);

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>

        {isAuthenticated && (
          <Aparece atraso={40}>
            <Grupo titulo="Conta">
              <Linha
                icone="person-circle-outline"
                titulo="Editar perfil"
                detalhe="Nome, foto de perfil e capa"
                aoTocar={() => router.push("/settings/editar-perfil")}
              />
              <Linha
                icone="briefcase-outline"
                titulo="Minhas reservas"
                detalhe="Suas viagens reservadas"
                aoTocar={() => router.push("/bookings")}
              />
              <Linha
                icone="heart-outline"
                titulo="Favoritos"
                detalhe="Viagens que você salvou"
                aoTocar={() => router.push("/favoritos")}
                ultima
              />
            </Grupo>
          </Aparece>
        )}

        <Aparece atraso={120}>
          <Grupo titulo="Preferências">
            <Linha
              icone="language-outline"
              titulo="Idioma"
              detalhe={`${info.bandeira}  ${info.nome}`}
              aoTocar={() => router.push("/settings/idioma")}
              ultima
            />
          </Grupo>
        </Aparece>

        <Aparece atraso={200}>
          <Grupo titulo="Ajuda">
            <Linha
              icone="chatbubbles-outline"
              titulo="Assistente de ajuda"
              detalhe="Tire dúvidas sobre o app"
              aoTocar={() => router.push("/ajuda")}
            />
            <Linha
              icone="mail-outline"
              titulo="Fale conosco"
              detalhe="Entre em contato com a equipe"
              aoTocar={() => router.push("/fale-conosco")}
            />
            <Linha
              icone="information-circle-outline"
              titulo="Sobre o RR Turismo"
              detalhe="Conheça o projeto"
              aoTocar={() => router.push("/sobre-nos")}
              ultima
            />
          </Grupo>
        </Aparece>
      </ScrollView>
    </SafeAreaView>
  );
}

// Bloco com título (ex: "Conta") e as linhas dentro de um cartão.
function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={styles.grupo}>
      <Text style={styles.grupoTitulo}>{titulo}</Text>
      <View style={styles.cartao}>{children}</View>
    </View>
  );
}

// Uma opção: ícone num quadradinho colorido + título + detalhe + seta.
function Linha({
  icone, titulo, detalhe, aoTocar, ultima,
}: { icone: Icone; titulo: string; detalhe?: string; aoTocar: () => void; ultima?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.linha, !ultima && styles.linhaComDivisor]}
      onPress={aoTocar}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      <View style={styles.icone}>
        <Ionicons name={icone} size={20} color={colors.secondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.linhaTitulo}>{titulo}</Text>
        {!!detalhe && <Text style={typography.caption}>{detalhe}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.backgroundMuted },
  conteudo: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  grupo: { marginBottom: spacing.xl },
  grupoTitulo: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  cartao: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    shadowColor: "#001146",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  linha: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md + 2 },
  linhaComDivisor: { borderBottomWidth: 1, borderBottomColor: colors.border },
  icone: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(26,86,219,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  linhaTitulo: { fontSize: 15, fontWeight: "700", color: colors.text },
});
