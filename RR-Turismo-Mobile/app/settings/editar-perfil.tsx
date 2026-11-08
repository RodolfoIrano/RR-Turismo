// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela EDITAR PERFIL: trocar a foto de perfil, a capa e o NOME.
// (O e-mail aparece só para consulta - ele é o login da conta.)
// ============================================================
import React, { useEffect, useRef, useState } from "react";
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View,
} from "react-native";
import { Text } from "../../components/TextoTraduzido";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

import { useAuth } from "../../contexts/AuthContext";
import { usePerfilImagens } from "../../hooks/usePerfilImagens";
import { atualizarNomePerfil } from "../../services/authService";
import CabecalhoDoPerfil from "../../components/perfil/CabecalhoDoPerfil";
import PrimaryButton from "../../components/PrimaryButton";

export default function EditarPerfil() {
  const { user, atualizarUsuario } = useAuth();
  const imagens = usePerfilImagens();

  const [nome, setNome] = useState(user?.name ?? "");
  // Se o usuário ainda estava sendo carregado quando a tela abriu, preenche o
  // nome assim que ele chegar (sem apagar o que a pessoa já tiver digitado).
  const digitou = useRef(false);
  useEffect(() => {
    if (!digitou.current) setNome(user?.name ?? "");
  }, [user?.name]);
  const [salvando, setSalvando] = useState(false);
  const mudou = nome.trim() !== (user?.name ?? "") && nome.trim().length >= 2;

  async function salvar() {
    setSalvando(true);
    try {
      const atualizado = await atualizarNomePerfil(nome);
      atualizarUsuario(atualizado);
      digitou.current = false;
      setNome(atualizado.name);
      Alert.alert("Perfil", "Nome atualizado!");
    } catch (erro) {
      Alert.alert("Erro", erro instanceof Error ? erro.message : "Não foi possível salvar o nome.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
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

          <View style={styles.formulario}>
            <Text style={styles.rotulo}>Nome</Text>
            <TextInput
              value={nome}
              onChangeText={(v) => { digitou.current = true; setNome(v); }}
              placeholder="Seu nome"
              placeholderTextColor={colors.textMuted}
              maxLength={80}
              autoCapitalize="words"
              style={styles.campo}
            />

            <Text style={styles.rotulo}>E-mail</Text>
            <View style={[styles.campo, styles.campoBloqueado]}>
              <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
              <Text style={[typography.body, { color: colors.textSecondary, flex: 1 }]} numberOfLines={1}>
                {user?.email}
              </Text>
            </View>
            <Text style={typography.caption}>O e-mail é o seu login e não pode ser alterado aqui.</Text>

            <View style={{ marginTop: spacing.xl }}>
              <PrimaryButton
                label="Salvar alterações"
                onPress={salvar}
                loading={salvando}
                disabled={!mudou}
                style={{ borderRadius: radius.lg }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  formulario: { paddingHorizontal: spacing.xl, marginTop: spacing.xl },
  rotulo: { fontSize: 13, fontWeight: "800", color: colors.primary, marginBottom: 6, marginTop: spacing.lg },
  campo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.backgroundMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    fontSize: 15,
    color: colors.text,
  },
  campoBloqueado: { opacity: 0.8 },
});
