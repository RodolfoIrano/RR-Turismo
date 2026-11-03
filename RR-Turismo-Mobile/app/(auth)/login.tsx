// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela de LOGIN (e-mail e senha). É a primeira tela que o
// usuário vê se ainda não estiver logado.
// ============================================================
import React, { useState } from "react";
import { View, Image, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Text } from "../../components/TextoTraduzido";
import { Link, useRouter, useLocalSearchParams } from "expo-router";

// Importação das configurações visuais do projeto
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

// Componentes reutilizáveis
import Input from "../../components/Input";
import PrimaryButton from "../../components/PrimaryButton";

// Contexto responsável pela autenticação
import { useAuth } from "../../contexts/AuthContext";
import { ValidadorDeSenha } from "../../validacoes/ValidadorDeSenha";

// Contexto responsável pela tradução (item 2 da solicitação)
import { useTraducao } from "../../traducoes/TraducaoContext";

// ============================================================
// TELA DE LOGIN
// ============================================================
// Esta tela permite que o usuário entre na conta.
// A função signIn vem do AuthContext e é responsável
// por realizar a autenticação.
// ============================================================
export default function Login() {
  // useRouter permite navegar entre as telas
  const router = useRouter();
  // Rota para voltar depois do login (ex.: "/checkout"). Vazia = Home.
  const { retornarPara } = useLocalSearchParams<{ retornarPara?: string }>();

  // Pegamos a função de login e o estado de carregamento
  // disponibilizados pelo contexto de autenticação
  const { signIn, loading } = useAuth();

  // Textos traduzidos de acordo com o idioma selecionado
  const { t } = useTraducao();

  // Estados que armazenam os valores digitados pelo usuário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Guarda uma possível mensagem de erro
  const [error, setError] = useState<string | null>(null);

  // ==========================================================
  // FUNÇÃO DE LOGIN
  // ==========================================================
  async function handleLogin() {
    // Limpa o erro anterior antes de tentar novamente
    setError(null);

    try {
      // Tenta realizar o login usando o AuthContext
      await signIn(email, password);

      // Se o login funcionar, vai para a tela principal
      router.replace(retornarPara ? (retornarPara as any) : "/(tabs)");
    } catch (err) {
      // Mostra uma mensagem amigável para o usuário
      // em vez de exibir detalhes técnicos do erro
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível entrar. Tente novamente."
      );
    }
  }

  // ==========================================================
  // INTERFACE DA TELA
  // ==========================================================
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      // No iOS, ajusta a tela quando o teclado aparece
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        // Permite tocar nos inputs mesmo com o teclado aberto
        keyboardShouldPersistTaps="handled"
      >

        {/* =====================================================
            CABEÇALHO
            Logo, nome do aplicativo e mensagem inicial
            ===================================================== */}
        <View style={styles.header}>

          {/* Logo da empresa, com um círculo de fundo suave atrás
              pra destacar mais (em vez da imagem "solta" no ar). */}
          <View style={styles.logoCirculo}>
            <Image
              source={require("../../assets/images/RRTurismoEscuro.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Nome do aplicativo */}
          <Text style={typography.h1}>RR TURISMO</Text>

          {/* Texto de apresentação */}
          <Text style={[typography.bodyMuted, styles.subtitle]}>
            Entre para continuar sua próxima aventura.
          </Text>
        </View>

        {/* =====================================================
            FORMULÁRIO
            Campos de login e botão de entrada
            ===================================================== */}
        <View style={styles.form}>

          {/* Campo de e-mail */}
          <Input
            label={t.autenticacao.email}
            placeholder="seuemail@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* Campo de senha */}
          <Input
            label={t.autenticacao.senha}
            placeholder="Sua senha"
            dicaNoRotulo={`(${ValidadorDeSenha.DICA.toLowerCase()})`}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={error}
          />

          {/* Link para recuperação de senha.
              OBS: ainda não existe uma tela/fluxo de recuperação
              de senha implementado (nem no Mobile, nem uma API
              pronta no Spring pra isso) - por enquanto, só avisa
              o usuário, em vez de fingir que algo aconteceu. */}
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

          {/* Botão de login */}
          <PrimaryButton
            label={t.autenticacao.botaoEntrar.toUpperCase()}
            onPress={handleLogin}
            loading={loading}
          />

          {/* ===================================================
              RODAPÉ
              Link para criar uma nova conta
              =================================================== */}
          <View style={styles.footer}>
            <Text style={typography.bodyMuted}>
              {t.autenticacao.naoTemConta}{" "}
            </Text>

            {/* Link que leva para a tela de cadastro */}
            <Link href={{ pathname: "/(auth)/register", params: retornarPara ? { retornarPara } : undefined }} asChild>
              <TouchableOpacity>
                <Text style={styles.link}>{t.autenticacao.cadastreSe}</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================================
// ESTILOS DA TELA
// ============================================================
// Centralizamos os estilos aqui para deixar o JSX mais limpo.
// ============================================================
const styles = StyleSheet.create({

  // Container principal da tela
  container: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: "center",
  },

  // Área do logo e textos iniciais
  header: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },

  // ⭐ TAMANHO DA LOGO — mude os números abaixo.
  // A imagem original tem margem em branco em volta; o marginTop
  // negativo "puxa" a logo para cima e compensa essa margem.
  logo: {
    width: 200,        // 👈 largura da logo
    height: 200,       // 👈 altura da logo
    marginTop: -100,   // 👈 sobe a logo (compensa a margem da imagem)
    marginBottom: 50,  // 👈 espaço entre a logo e o título
  },

  // Container da logo (sem círculo de fundo).
  logoCirculo: {
    alignItems: "center",
    justifyContent: "center",
  },

  // Espaçamento do subtítulo
  subtitle: {
    marginTop: spacing.xs,
    textAlign: "center",
  },

  // Formulário ocupa toda a largura disponível
  form: {
    width: "100%",
  },

  // Link "Esqueceu sua senha?"
  forgotLink: {
    alignSelf: "flex-end",
    marginBottom: spacing.lg,
  },

  // Estilo padrão dos links
  link: {
    color: colors.secondary,
    fontWeight: "700",
  },

  // Área inferior com o link "Criar conta"
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
});
