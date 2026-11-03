// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela "Perfil" (5ª aba). Mostra os dados do usuário logado,
// permite trocar foto/capa, e tem os atalhos pra Reservas,
// Favoritos, Configurações e Sair.
// ============================================================
import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Text } from "../../components/TextoTraduzido";
// IMPORTANTE: usamos o <Image> do pacote "expo-image" (não o
// <Image> padrão do react-native) porque a foto/banner do perfil
// vêm de uma rota PROTEGIDA do backend (precisa de
// "Authorization: Bearer <token>" no header). O <Image> padrão do
// React Native não tem como enviar headers customizados numa
// requisição de imagem - o do expo-image tem, através de
// "source={{ uri, headers }}".
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

import { useAuth } from "../../contexts/AuthContext";
import { useTraducao } from "../../traducoes/TraducaoContext";
import TabHeader from "../../components/TabHeader";
import PerfilVisitante from "../../components/PerfilVisitante";
import { atualizarFotoPerfil, atualizarBannerPerfil, fontePerfilFoto, fontePerfilBanner } from "../../services/authService";

// ============================================================
// PERFIL DO USUÁRIO
// ------------------------------------------------------------
// Tela responsável por mostrar as informações do usuário
// atualmente logado.
//
// Também disponibiliza atalhos para:
// - Minhas reservas
// - Favoritos
// - Configurações
// - Sair da conta
//
// ITEM 4 DA SOLICITAÇÃO - TROCA DE FOTO DE PERFIL:
// O usuário toca na foto (ou no ícone de câmera sobreposto) para
// escolher uma nova imagem do dispositivo. A imagem é enviada
// para o backend (POST /api/perfil/foto), que já reaproveita a
// mesma estrutura de armazenamento de foto usada pelo site
// (tabela PerfilUsuario, coluna "foto").
// ============================================================
export default function Profile() {
  const router = useRouter();

  // Recupera o usuário logado e a função responsável pelo logout
  const { user, signOut, isAuthenticated } = useAuth();

  // Textos traduzidos de acordo com o idioma selecionado
  const { t } = useTraducao();

  // Fonte (uri + headers de autenticação) da foto de perfil atual.
  // Fica em estado separado porque precisa ser buscada de forma
  // assíncrona (ver services/authService.ts -> fontePerfilFoto).
  const [fotoAtual, setFotoAtual] = useState<{ uri: string; headers: Record<string, string> } | null>(null);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  // Mesma ideia da foto, mas para o banner (imagem de capa/fundo).
  const [bannerAtual, setBannerAtual] = useState<{ uri: string; headers: Record<string, string> } | null>(null);
  const [enviandoBanner, setEnviandoBanner] = useState(false);

  const carregarFoto = useCallback(async () => {
    if (!user?.temFoto) {
      setFotoAtual(null);
      return;
    }
    const fonte = await fontePerfilFoto();
    setFotoAtual(fonte);
  }, [user?.temFoto]);

  const carregarBanner = useCallback(async () => {
    if (!user?.temBanner) {
      setBannerAtual(null);
      return;
    }
    const fonte = await fontePerfilBanner();
    setBannerAtual(fonte);
  }, [user?.temBanner]);

  useEffect(() => {
    carregarFoto();
  }, [carregarFoto]);

  useEffect(() => {
    carregarBanner();
  }, [carregarBanner]);

  // ==========================================================
  // ESCOLHER UMA IMAGEM DO DISPOSITIVO
  // ----------------------------------------------------------
  // Função comum usada tanto pela foto quanto pelo banner.
  // "proporcao" define o formato do recorte: quadrado [1,1] para
  // a foto de perfil, e retangular [16,9] para o banner.
  // Retorna a URI da imagem escolhida, ou null se o usuário
  // cancelar ou negar a permissão.
  // ==========================================================
  async function escolherImagem(proporcao: [number, number]): Promise<string | null> {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert(t.perfil.titulo, t.perfil.permissaoNegada);
      return null;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: proporcao,
      quality: 0.8,
    });

    if (resultado.canceled || !resultado.assets?.[0]) {
      return null;
    }

    return resultado.assets[0].uri;
  }

  // ==========================================================
  // TROCAR FOTO DE PERFIL
  // ----------------------------------------------------------
  // 1. Pede permissão para acessar as fotos do dispositivo.
  // 2. Abre o seletor de imagens.
  // 3. Envia a imagem escolhida para o backend.
  // 4. Recarrega a foto exibida na tela.
  // ==========================================================
  async function handleTrocarFoto() {
    const uri = await escolherImagem([1, 1]);
    if (!uri) return;

    setEnviandoFoto(true);
    try {
      await atualizarFotoPerfil(uri);
      // Mostra a imagem local imediatamente, sem esperar o
      // download da versão salva no servidor.
      setFotoAtual({ uri, headers: {} });
      Alert.alert(t.perfil.titulo, t.perfil.fotoAtualizada);
    } catch (erro) {
      Alert.alert(t.comum.erro, erro instanceof Error ? erro.message : t.perfil.erroFoto);
    } finally {
      setEnviandoFoto(false);
    }
  }

  // Mesma lógica da foto, mas para o banner (imagem de capa).
  async function handleTrocarBanner() {
    const uri = await escolherImagem([16, 9]);
    if (!uri) return;

    setEnviandoBanner(true);
    try {
      await atualizarBannerPerfil(uri);
      setBannerAtual({ uri, headers: {} });
      Alert.alert(t.perfil.titulo, t.perfil.bannerAtualizado);
    } catch (erro) {
      Alert.alert(t.comum.erro, erro instanceof Error ? erro.message : t.perfil.erroBanner);
    } finally {
      setEnviandoBanner(false);
    }
  }

  // ==========================================================
  // LOGOUT
  // ----------------------------------------------------------
  // Primeiro encerra a sessão através do AuthContext.
  // Depois redireciona o usuário para a tela de login.
  // ==========================================================
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

  // ==========================================================
  // INTERFACE DO PERFIL
  // ==========================================================
  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top"]}
    >

      {/* ====================================================
          CABEÇALHO (com botão de voltar)
          ==================================================== */}
      <TabHeader title={t.perfil.titulo} />


      {/* ====================================================
          INFORMAÇÕES DO USUÁRIO
          ----------------------------------------------------
          Exibe avatar, nome, e-mail e telefone.
          O telefone só aparece caso esteja cadastrado.
          ==================================================== */}
      <View style={styles.profileCard}>

        {/* ==================================================
            BANNER (imagem de capa/fundo do perfil)
            --------------------------------------------------
            Fica atrás da foto de perfil, igual ao site.
            Toque para trocar.
            ================================================== */}
        <TouchableOpacity
          style={styles.bannerWrapper}
          onPress={handleTrocarBanner}
          activeOpacity={0.8}
          disabled={enviandoBanner}
          accessibilityLabel={t.perfil.trocarBanner}
        >
          {bannerAtual ? (
            <Image source={bannerAtual} style={styles.banner} />
          ) : (
            <View style={[styles.banner, styles.bannerPlaceholder]} />
          )}

          <View style={styles.bannerBadge}>
            {enviandoBanner ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <>
                <Ionicons name="image-outline" size={14} color={colors.textInverse} />
                <Text style={styles.bannerBadgeText}>{t.perfil.trocarBanner}</Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={handleTrocarFoto}
          activeOpacity={0.8}
          disabled={enviandoFoto}
          accessibilityLabel={t.perfil.trocarFoto}
        >
          {fotoAtual ? (
            <Image source={fotoAtual} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={40} color={colors.textMuted} />
            </View>
          )}

          {/* Selo com ícone de câmera, indicando que a foto pode
              ser trocada - igual ao padrão usado em grandes apps. */}
          <View style={styles.avatarBadge}>
            {enviandoFoto ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <Ionicons name="camera" size={16} color={colors.textInverse} />
            )}
          </View>
        </TouchableOpacity>

        <Text style={typography.bodyMuted}>{t.perfil.trocarFoto}</Text>

        <Text style={[typography.h2, { marginTop: spacing.sm }]}>
          {user?.name}
        </Text>

        <Text style={typography.bodyMuted}>
          {user?.email}
        </Text>

        {user?.phone && (
          <Text style={typography.bodyMuted}>
            {user.phone}
          </Text>
        )}

      </View>


      {/* ====================================================
          MENU DE OPÇÕES
          ----------------------------------------------------
          Cada opção utiliza o componente MenuItem.
          Isso evita repetir a mesma estrutura de botão.
          ==================================================== */}
      <View style={styles.menu}>

        <MenuItem
          icon="briefcase-outline"
          label={t.perfil.minhasReservas}
          onPress={() => router.push("/bookings")}
        />

        {/* Modo Guia: só aparece para quem tem Cadastro.guia = true */}
        {user?.guia && (
          <MenuItem
            icon="radio-outline"
            label={t.aoVivo.modoGuia}
            onPress={() => router.push("/modo-guia")}
          />
        )}

        <MenuItem
          icon="mic-outline"
          label={t.voz.titulo}
          onPress={() => router.push("/tradutor")}
        />

        <MenuItem
          icon="heart-outline"
          label={t.perfil.favoritos}
          onPress={() =>
            router.push("/(tabs)/favorites")
          }
        />

        <MenuItem
          icon="settings-outline"
          label={t.perfil.configuracoes}
          onPress={() => router.push("/settings")}
        />

        {/* Botão de sair recebe a propriedade danger para
            utilizar a cor de alerta/perigo. */}
        <MenuItem
          icon="log-out-outline"
          label={t.perfil.sair}
          onPress={handleLogout}
          danger
        />

      </View>

    </SafeAreaView>
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
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {

  return (
    <TouchableOpacity
      style={styles.menuItem}
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

  // Container principal da tela
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Cabeçalho com o título
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },

  // Área central com as informações do usuário
  profileCard: {
    alignItems: "center",
    paddingBottom: spacing.xl,
  },

  // Banner (capa) do perfil, ocupa toda a largura da tela
  bannerWrapper: {
    width: "100%",
    marginBottom: -44, // faz a foto de perfil "subir" e sobrepor o banner
  },
  banner: {
    width: "100%",
    height: 130,
  },
  // Exibido quando o usuário ainda não escolheu um banner
  bannerPlaceholder: {
    backgroundColor: colors.primary,
  },
  // Selo "alterar capa" no canto do banner
  bannerBadge: {
    position: "absolute",
    right: spacing.md,
    top: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  bannerBadgeText: {
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: "600",
  },

  // Envolve a foto + o selo de câmera
  avatarWrapper: {
    marginBottom: spacing.sm,
  },

  // Foto de perfil circular
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    // Borda branca para a foto se destacar por cima do banner.
    borderWidth: 3,
    borderColor: colors.background,
  },

  // Exibido quando o usuário ainda não tem foto cadastrada
  avatarPlaceholder: {
    backgroundColor: colors.backgroundMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Selo com o ícone de câmera, no canto inferior direito da foto
  avatarBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },

  // Área que contém as opções do menu
  menu: {
    paddingHorizontal: spacing.lg,
  },

  // Cada item individual do menu
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,

    // Linha separadora entre as opções
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  // Texto do item.
  // flex: 1 faz o texto ocupar o espaço entre os ícones.
  menuLabel: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
