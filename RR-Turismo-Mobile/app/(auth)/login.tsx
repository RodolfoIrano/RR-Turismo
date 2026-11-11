// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela de LOGIN (e-mail e senha). É a primeira tela que o
// usuário vê se ainda não estiver logado.
//
// O visual (fundo, logo e cartão animado) vem do componente
// TelaAuth; os campos e o botão são CampoCartao e BotaoCartao.
// A lógica de entrar continua a mesma de sempre (AuthContext).
// ============================================================
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
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
import { useTraducao } from "../../traducoes/TraducaoContext";

export default function Login() {
  // useRouter permite navegar entre as telas
  const router = useRouter();
  // Rota para voltar depois do login (ex.: "/checkout"). Vazia = Home.
  const { retornarPara } = useLocalSearchParams<{ retornarPara?: string }>();

  // Função de login e estado de carregamento (AuthContext)
  const { signIn, loading } = useAuth();

  // Textos traduzidos de acordo com o idioma selecionado
  const { t } = useTraducao();

  // Valores digitados e possível mensagem de erro
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // ==========================================================
  // FUNÇÃO DE LOGIN (mesma lógica de antes)
  // ==========================================================
  async function handleLogin() {
    setError(null);
    try {
      await signIn(email, password);
      router.replace(retornarPara ? (retornarPara as any) : "/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar. Tente novamente.");
    }
  }

  return (
    <TelaAuth
      aba="entrar"
      retornarPara={retornarPara}
      titulo="Bem-vindo de volta"
      subtitulo="Entre para continuar sua próxima aventura."
    >
      <CaixaDeErro mensagem={error} />

      <Aparece atraso={220}>
        <CampoCartao
          label={t.autenticacao.email}
          icone="mail-outline"
          placeholder="seuemail@exemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          temErro={!!error}
        />
      </Aparece>

      <Aparece atraso={320}>
        <CampoCartao
          label={t.autenticacao.senha}
          icone="lock-closed-outline"
          placeholder="Sua senha"
          dicaNoRotulo={`(${ValidadorDeSenha.DICA.toLowerCase()})`}
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
          temErro={!!error}
          // Igual ao cadastro: vermelho até 8 caracteres, verde a partir de 8.
          estado={password.length === 0 ? undefined : password.length >= 8 ? "ok" : "erro"}
        />
      </Aparece>

      {/* Recuperação de senha: ainda não existe fluxo pronto, então só avisa. */}
      <Aparece atraso={380}>
        <TouchableOpacity
          style={styles.forgotLink}
          onPress={() =>
            Alert.alert(
              "Em breve",
              "A recuperação de senha ainda não está disponível. Entre em contato com o suporte, se precisar."
            )
          }
        >
          <Text style={styles.link}>Esqueceu sua senha?</Text>
        </TouchableOpacity>
      </Aparece>

      <Aparece atraso={440}>
        <BotaoCartao label={t.autenticacao.botaoEntrar.toUpperCase()} onPress={handleLogin} loading={loading} />
      </Aparece>

      <Aparece atraso={520}>
        <View style={styles.footer}>
          <Text style={styles.footerTexto}>{t.autenticacao.naoTemConta} </Text>
          <TouchableOpacity
            onPress={() =>
              router.replace({ pathname: "/(auth)/register", params: retornarPara ? { retornarPara } : undefined } as any)
            }
          >
            <Text style={styles.link}>{t.autenticacao.cadastreSe}</Text>
          </TouchableOpacity>
        </View>
      </Aparece>
    </TelaAuth>
  );
}

const styles = StyleSheet.create({
  forgotLink: { alignSelf: "flex-end", marginTop: -spacing.xs, marginBottom: spacing.xl },
  link: { color: colors.secondary, fontWeight: "700", fontSize: 14 },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: spacing.xl },
  footerTexto: { color: colors.textSecondary, fontSize: 14 },
});
