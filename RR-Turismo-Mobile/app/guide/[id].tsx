// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela de PERFIL DO GUIA (foto, bio, idiomas, especialidades, e
// a lista de viagens que ele oferece). Abre quando o usuário
// toca no nome do guia.
// ============================================================
import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, FlatList, TouchableOpacity, Linking } from "react-native";
import { Text } from "../../components/TextoTraduzido";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import Rating from "../../components/Rating";
import TripCard from "../../components/TripCard";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import { useCatalogo } from "../../contexts/CatalogoContext";
import { useTraducao } from "../../traducoes/TraducaoContext";
import { REDES_SOCIAIS } from "../../utils/redesSociais";
import { carregarGuiaOuErro } from "../../services/guideService";
import type { Guide } from "../../types";

// ============================================================
// PERFIL DO GUIA (/guide/[id])
// ------------------------------------------------------------
// Tela responsável por apresentar as informações completas de
// um guia turístico selecionado pelo usuário.
//
// O ID do guia é recebido pela rota dinâmica /guide/[id].
//
// Em vez de fazer uma nova chamada de rede, busca o guia e as
// viagens dele diretamente no catálogo que o CatalogoContext já
// carregou do backend (evita depender de uma segunda requisição,
// que poderia falhar por conta própria mesmo com a lista
// funcionando - foi exatamente esse tipo de bug que corrigimos
// na tela de detalhes da viagem).
//
// São exibidos:
// - Foto e nome do guia;
// - Localização;
// - Avaliação e quantidade de avaliações;
// - Quantidade de viagens realizadas;
// - Anos de experiência;
// - Biografia;
// - Idiomas;
// - Especialidades;
// - Viagens oferecidas pelo guia.
// ============================================================
export default function GuideProfile() {
  // Recupera o ID do guia enviado pela rota
  const { id } = useLocalSearchParams<{ id: string }>();

  // Permite navegar entre as telas do aplicativo
  const router = useRouter();

  // Textos traduzidos conforme o idioma escolhido
  const { t } = useTraducao();

  // Catálogo de viagens e guias já carregado do backend
  const { buscarGuia, viagens, carregando, erro } = useCatalogo();

  const guiaDoCatalogo = buscarGuia(id);

  // Se o guia não veio na lista do catálogo, busca direto pelo id.
  // Assim o erro real aparece na tela, em vez de "não encontrado".
  const [guiaDireto, setGuiaDireto] = useState<Guide | null>(null);
  const [erroDireto, setErroDireto] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (guiaDoCatalogo || carregando) return;
    let cancelado = false;
    setErroDireto(null);
    carregarGuiaOuErro(id)
      .then((g) => { if (!cancelado) setGuiaDireto(g); })
      .catch((e) => {
        if (!cancelado) setErroDireto(e instanceof Error ? e.message : String(e));
      });
    return () => { cancelado = true; };
  }, [id, guiaDoCatalogo, carregando, tentativa]);

  const guide = guiaDoCatalogo ?? guiaDireto ?? undefined;

  // Viagens deste guia específico, filtradas das viagens já carregadas.
  const trips = viagens.filter((v) => v.guideId === id);

  // Redes de contato que o guia realmente preencheu no site
  // (cada uma vira um botão com o link já montado).
  const contatos = REDES_SOCIAIS.flatMap((rede) => {
    const valor = guide?.contatos?.[rede.chave] ?? "";
    const link = valor.trim() ? rede.montarLink(valor) : null;
    return link ? [{ rede, link }] : [];
  });

  if (carregando) {
    return <Loading label={t.guia.carregando} />;
  }

  if (!guide) {
    return (
      <EmptyState
        icon="person-outline"
        title={t.guia.naoEncontrado}
        message={erroDireto ? `Motivo: ${erroDireto}` : (erro ?? undefined)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>

        {/* ====================================================
            CABEÇALHO: foto, nome, local e avaliação
            ==================================================== */}
        <View style={styles.header}>
          <Image source={{ uri: guide.photo }} style={styles.avatar} />

          <Text style={[typography.h1, styles.centro]}>{guide.name}</Text>

          <Text style={typography.bodyMuted}>
            {t.guia.guiaTuristico}{guide.location ? ` • ${guide.location}` : ""}
          </Text>

          <View style={{ marginTop: spacing.xs }}>
            <Rating rating={guide.rating} reviewCount={guide.reviewCount} size={16} />
          </View>
        </View>

        {/* ====================================================
            ESTATÍSTICAS
            ==================================================== */}
        <View style={styles.statsRow}>
          <Stat label={t.guia.viagensRealizadas} value={String(guide.tripsCompleted)} />
          <Stat label={t.guia.clientesAtendidos} value={String(guide.clientsServed ?? 0)} />
        </View>

        {/* ====================================================
            CONTATOS / REDES (só as que o guia preencheu)
            ==================================================== */}
        {contatos.length > 0 && (
          <Section title={t.guia.redes}>
            <View style={styles.contatos}>
              {contatos.map(({ rede, link }) => (
                <TouchableOpacity
                  key={rede.chave}
                  style={styles.botaoContato}
                  onPress={() => Linking.openURL(link).catch(() => {})}
                  accessibilityRole="link"
                >
                  <Ionicons name={rede.icone as keyof typeof Ionicons.glyphMap} size={20} color={colors.primary} />
                  <Text style={styles.textoContato}>{t.guia[rede.chave]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>
        )}

        {/* ====================================================
            SOBRE, IDIOMAS, ESPECIALIDADES (só se houver conteúdo)
            ==================================================== */}
        {!!guide.bio && (
          <Section title={t.guia.sobre}>
            <Text style={typography.body}>{guide.bio}</Text>
          </Section>
        )}

        {guide.languages.length > 0 && (
          <Section title={t.guia.idiomas}>
            <View style={styles.tagsRow}>
              {guide.languages.map((lang) => (
                <View key={lang} style={styles.tag}>
                  <Text style={styles.tagText}>{lang}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {guide.specialties.length > 0 && (
          <Section title={t.guia.especialidades}>
            <View style={styles.tagsRow}>
              {guide.specialties.map((s) => (
                <View key={s} style={styles.tag}>
                  <Text style={styles.tagText}>{s}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* ====================================================
            VIAGENS DO GUIA
            ==================================================== */}
        <Section title={t.guia.minhasViagens}>
          {trips.length === 0 ? (
            <Text style={typography.bodyMuted}>{t.guia.nenhumaViagem}</Text>
          ) : (
            <FlatList
              horizontal
              data={trips}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => <TripCard trip={item} />}
            />
          )}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// COMPONENTE DE ESTATÍSTICA
// ------------------------------------------------------------
// Componente reutilizável para exibir um número acompanhado
// de sua descrição.
// ============================================================
function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={typography.h2}>
        {value}
      </Text>

      <Text style={typography.caption}>
        {label}
      </Text>
    </View>
  );
}

// ============================================================
// COMPONENTE DE SEÇÃO
// ------------------------------------------------------------
// Padroniza o título e o espaçamento das diferentes seções
// presentes no perfil do guia.
// ============================================================
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginTop: spacing.xl }}>
      <Text style={typography.h2}>
        {title}
      </Text>

      <View style={{ marginTop: spacing.sm }}>
        {children}
      </View>
    </View>
  );
}

// ============================================================
// ESTILOS DA TELA
// ============================================================
const styles = StyleSheet.create({

  centro: { textAlign: "center" },

  // Linha de botões de contato (WhatsApp, Instagram...)
  contatos: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  botaoContato: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  textoContato: { color: colors.primary, fontWeight: "700", fontSize: 14 },

  // Container principal da tela
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Área com as informações principais do guia
  header: {
    alignItems: "center",
  },

  // Foto de perfil do guia
  avatar: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },

  // Área que organiza as estatísticas lado a lado
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: spacing.xl,
    backgroundColor: colors.backgroundMuted,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },

  // Cada estatística individual
  stat: {
    alignItems: "center",
  },

  // Container das especialidades
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  // Estilo de cada tag de especialidade
  tag: {
    backgroundColor: colors.backgroundMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },

  // Texto dentro da tag
  tagText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },
});
