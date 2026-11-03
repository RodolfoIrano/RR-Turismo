// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// É o CARTÃO DE VIAGEM (foto, título, preço, estrelinha) que
// aparece em várias listas pelo app - Home, Explorar, Favoritos.
// Provavelmente o componente mais usado no app inteiro.
// ============================================================
import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "./TextoTraduzido";
// Usamos o <Image> do expo-image em vez do padrão do React Native:
// tem melhor cache de imagens de rede e permite tratar erro de
// carregamento com "onError" (ajuda a diagnosticar problemas de
// imagem que não aparece).
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Trip } from "../types";
import { colors } from "../constants/colors";
import { radius, spacing } from "../constants/spacing";
import { shadows } from "../constants/shadows";
import { typography } from "../constants/typography";
import Rating from "./Rating";
import PriceDisplay from "./PriceDisplay";
import FavoriteButton from "./FavoriteButton";
import { useFavorites } from "../contexts/FavoritesContext";
import { useCatalogo } from "../contexts/CatalogoContext";

interface Props {
  trip: Trip; // Dados da viagem a ser exibida
  variant?: "vertical" | "horizontal"; // "vertical" = card estreito (carrossel); "horizontal" = ocupa a largura toda (listas)
}

// Card reutilizável de viagem, usado na Home, Busca, Favoritos e
// no perfil do guia. O nome do guia é clicável e navega para
// /guide/[id], conforme especificado no escopo do projeto.
export default function TripCard({ trip, variant = "vertical" }: Props) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  // Busca os dados do guia responsável (o usuário que criou a
  // viagem no site), já carregados pelo CatalogoContext.
  const { buscarGuia } = useCatalogo();
  const guide = buscarGuia(trip.guideId);
  const favorited = isFavorite(trip.id);

  // Controla se a foto de capa desta viagem falhou ao carregar,
  // pra mostrar um espaço reservado (ícone) em vez de ficar em
  // branco.
  const [fotoComErro, setFotoComErro] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/trip/${trip.id}`)}
      style={[styles.card, variant === "horizontal" && styles.cardHorizontal]}
    >
      <View style={styles.imageWrapper}>
        {fotoComErro ? (
          <View style={[styles.image, styles.imageFallback]}>
            <Ionicons name="image-outline" size={28} color={colors.textMuted} />
          </View>
        ) : (
          <Image
            source={{ uri: trip.images[0] }}
            style={styles.image}
            contentFit="cover"
            onError={(erro) => {
              console.warn(`[TripCard] Falha ao carregar imagem da viagem "${trip.title}":`, trip.images[0], erro);
              setFotoComErro(true);
            }}
          />
        )}
        {/* Botão de favoritar sobreposto no canto da imagem */}
        <View style={styles.favoriteOverlay}>
          <FavoriteButton active={favorited} onPress={() => toggleFavorite(trip.id)} />
        </View>
        {/* Selo "OFERTA", só aparece se a viagem estiver em promoção */}
        {trip.onOffer && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>OFERTA</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={typography.h3} numberOfLines={1}>
          {trip.title}
        </Text>

        <View style={styles.row}>
          <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
          <Text style={[typography.bodyMuted, styles.rowText]} numberOfLines={1}>
            {trip.location}
          </Text>
        </View>

        <Rating rating={trip.rating} reviewCount={trip.reviewCount} />

        {/* Nome do guia responsável pela viagem, clicável -> abre o perfil dele */}
        {guide && (
          <TouchableOpacity onPress={() => router.push(`/guide/${guide.id}`)} hitSlop={{ top: 4, bottom: 4 }}>
            <Text style={styles.guideLink}>Guia: {guide.name}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Text style={typography.bodyMuted}>{trip.duration} {trip.duration === 1 ? "dia" : "dias"}</Text>
          <PriceDisplay price={trip.price} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const CARD_WIDTH = 240;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    // Sombra leve (ver constants/shadows.ts) pra dar profundidade
    // ao card, em vez de ficar "chapado" só com a borda fina.
    // IMPORTANTE: não colocamos "overflow: hidden" aqui, porque
    // isso cortaria a sombra fora do card no iOS - quem corta a
    // imagem pros cantos arredondados é o "imageWrapper" abaixo.
    ...shadows.card,
  },
  cardHorizontal: {
    width: "100%",
    marginRight: 0,
    marginBottom: spacing.md,
  },
  // O corte dos cantos de cima da imagem acontece aqui (não mais
  // no card inteiro), pra não cortar a sombra do card junto.
  imageWrapper: {
    position: "relative",
    overflow: "hidden",
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  image: { width: "100%", height: 140, backgroundColor: colors.backgroundMuted },
  // Espaço reservado exibido quando a foto de capa falha ao carregar.
  imageFallback: { alignItems: "center", justifyContent: "center" },
  favoriteOverlay: { position: "absolute", top: spacing.sm, right: spacing.sm },
  badge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: { color: colors.textInverse, fontSize: 10, fontWeight: "700" },
  info: { padding: spacing.md },
  row: { flexDirection: "row", alignItems: "center", marginTop: 2, marginBottom: spacing.xs },
  rowText: { marginLeft: 2 },
  guideLink: { color: colors.secondary, fontSize: 13, fontWeight: "600", marginTop: spacing.xs },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
});
