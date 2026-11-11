// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela de CADASTRO (criar conta nova). Acessada pela aba "Criar conta"
// (ou pelo link "Cadastre-se") da tela de login.
//
// O visual (fundo, logo e cartão animado) vem do componente
// TelaAuth. A lógica de criar a conta continua a mesma (AuthContext).
//
// Campos: nome completo, e-mail, senha e confirmação da senha.
// ============================================================
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "../../components/TextoTraduzido";
import { useLocalSearchParams, useRouter } from "expo-router";

import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";

import TelaAuth, { CaixaDeErro } from "../../components/auth/TelaAuth";
import CampoCartao from "../../components/auth/CampoCartao";
import BotaoCartao from "../../components/auth/BotaoCartao";
import Aparece from "../../components/auth/Aparece";

import { useAuth } from "../../contexts/AuthContext";
import { ValidadorDeSenha } from "../../validacoes/ValidadorDeSenha";

export default function Register() {
  const router = useRouter();
  // Rota para voltar depois do cadastro (ex.: "/checkout").
  const { retornarPara } = useLocalSearchParams<{ retornarPara?: string }>();

  // Função de cadastro e estado de carregamento
  const { signUp, loading } = useAuth();

  // Valores digitados em cada campo
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Possível mensagem de erro
  const [error, setError] = useState<string | null>(null);

  // ==========================================================
  // FUNÇÃO DE CADASTRO (mesma lógica de antes)
  // ==========================================================
  async function handleRegister() {
    setError(null);

    // Confere os campos antes de ir ao servidor
    if (name.trim().split(/\s+/).length < 2) {
      setError("Informe seu nome completo (nome e sobrenome).");
      return;
    }
    const erroSenha = ValidadorDeSenha.validar(password, name, email);
    if (erroSenha) {
      setError(erroSenha);
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      await signUp(name.trim(), email.trim(), password);
      router.replace(retornarPara ? (retornarPara as any) : "/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar sua conta.");
    }
  }

  return (
    <TelaAuth
      aba="cadastrar"
      retornarPara={retornarPara}
      titulo="Crie sua conta"
      subtitulo="Comece a planejar sua próxima viagem com a RR TURISMO."
    >
      <CaixaDeErro mensagem={error} />

      <Aparece atraso={200}>
        <CampoCartao
          label="Nome completo"
          icone="person-outline"
          placeholder="Informe seu nome completo..."
          autoCapitalize="words"
          value={name}
          onChangeText={setName}
        />
      </Aparece>

      <Aparece atraso={280}>
        <CampoCartao
          label="E-mail"
          icone="mail-outline"
          placeholder="seuemail@exemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />
      </Aparece>

      <Aparece atraso={360}>
        <CampoCartao
          label="Senha"
          icone="lock-closed-outline"
          placeholder="Mínimo de 8 caracteres"
          dicaNoRotulo={`(${ValidadorDeSenha.DICA.toLowerCase()})`}
          secureTextEntry
          autoCapitalize="none"
          estado={password.length === 0 ? undefined : password.length >= 8 ? "ok" : "erro"}
          value={password}
          onChangeText={setPassword}
        />
      </Aparece>

      <Aparece atraso={440}>
        <CampoCartao
          label="Confirmar senha"
          icone="shield-checkmark-outline"
          placeholder="Confirme sua senha..."
          dicaNoRotulo={`(${ValidadorDeSenha.DICA.toLowerCase()})`}
          secureTextEntry
          autoCapitalize="none"
          estado={
            confirmPassword.length === 0
              ? undefined
              : password.length >= 8 && password === confirmPassword
              ? "ok"
              : "erro"
          }
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </Aparece>

      <Aparece atraso={520}>
        <View style={{ marginTop: spacing.sm }}>
          <BotaoCartao label="CRIAR CONTA" onPress={handleRegister} loading={loading} />
        </View>
      </Aparece>

      <Aparece atraso={600}>
        <View style={styles.footer}>
          <Text style={styles.footerTexto}>Já possui uma conta? </Text>
          <TouchableOpacity
            onPress={() =>
              router.replace({ pathname: "/(auth)/login", params: retornarPara ? { retornarPara } : undefined } as any)
            }
          >
            <Text style={styles.link}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </Aparece>
    </TelaAuth>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.secondary, fontWeight: "700", fontSize: 14 },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: spacing.xl },
  footerTexto: { color: colors.textSecondary, fontSize: 14 },
});
