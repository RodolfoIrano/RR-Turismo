// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela de CADASTRO (criar conta nova). Acessada pelo link
// "Cadastre-se" da tela de login.
// ============================================================
import React, { useState } from "react";
import { View, Image, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { Text } from "../../components/TextoTraduzido";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import Input from "../../components/Input";
import PrimaryButton from "../../components/PrimaryButton";
import { useAuth } from "../../contexts/AuthContext";
import { ValidadorDeSenha } from "../../validacoes/ValidadorDeSenha";

// ============================================================
// TELA DE CADASTRO
// ------------------------------------------------------------
// Tela responsável por criar uma nova conta de usuário.
//
// Campos:
// - Nome completo
// - E-mail
// - Senha
// - Confirmação da senha
//
// O cadastro é realizado através do AuthContext.
// ============================================================
export default function Register() {

  // Permite navegar para outras telas do aplicativo
  const router = useRouter();
  // Rota para voltar depois do cadastro (ex.: "/checkout").
  const { retornarPara } = useLocalSearchParams<{ retornarPara?: string }>();

  // Função de cadastro e estado de carregamento
  const { signUp, loading } = useAuth();

  // ==========================================================
  // ESTADOS DO FORMULÁRIO
  // ----------------------------------------------------------
  // Cada estado guarda o valor digitado pelo usuário em
  // cada campo do formulário.
  // ==========================================================
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Guarda uma possível mensagem de erro
  const [error, setError] = useState<string | null>(null);


  // ==========================================================
  // FUNÇÃO DE CADASTRO
  // ==========================================================
  async function handleRegister() {

    // Limpa qualquer erro que tenha aparecido anteriormente
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

    // Verifica se a senha e a confirmação são iguais
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {

      // Envia os dados preenchidos para o sistema de cadastro
      await signUp(name.trim(), email.trim(), password);

      // Se o cadastro for realizado com sucesso,
      // o usuário é levado para a tela principal
      router.replace(retornarPara ? (retornarPara as any) : "/(tabs)");

    } catch (err) {

      // Caso aconteça algum erro, mostra uma mensagem
      // amigável para o usuário
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível criar sua conta."
      );
    }
  }


  // ==========================================================
  // INTERFACE DA TELA
  // ==========================================================
  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}

      // No iOS, ajusta a tela quando o teclado aparece
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >

      {/* Permite rolar a tela quando o conteúdo não couber */}
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >

        {/* ====================================================
            CABEÇALHO
            Logo, título e descrição da tela
            ==================================================== */}
        <View style={styles.header}>

          {/* Logo da RR Turismo, com círculo de fundo (mesmo
              estilo usado na tela de Login, pra ficar consistente). */}
          <View style={styles.logoCirculo}>
            <Image
              source={require("../../assets/images/RRTurismoEscuro.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Título da tela */}
          <Text style={typography.h1}>
            Criar conta
          </Text>

          {/* Texto explicativo */}
          <Text style={[typography.bodyMuted, styles.subtitle]}>
            Comece a planejar sua próxima viagem com a RR TURISMO.
          </Text>

        </View>


        {/* ====================================================
            FORMULÁRIO
            Campos necessários para criar a conta
            ==================================================== */}
        <View style={styles.form}>

          {/* Campo para o nome completo */}
          <Input
            label="Nome completo"
            placeholder="Informe seu nome completo..."
            value={name}
            onChangeText={setName}
          />


          {/* Campo de e-mail */}
          <Input
            label="E-mail"
            placeholder="seuemail@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />


          {/* Campo de senha */}
          {/* secureTextEntry esconde o conteúdo digitado */}
          <Input
            label="Senha"
            placeholder="Mínimo de 8 caracteres"
            dicaNoRotulo={`(${ValidadorDeSenha.DICA.toLowerCase()})`}
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />


          {/* Campo para confirmar a senha */}
          {/* Aqui também mostramos possíveis mensagens de erro */}
          <Input
            label="Confirmar senha"
            dicaNoRotulo={`(${ValidadorDeSenha.DICA.toLowerCase()})`}
            placeholder="Confirme sua senha..."
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={error}
          />


          {/* ==================================================
              BOTÃO DE CADASTRO
              --------------------------------------------------
              Ao clicar, chama a função handleRegister().
              O loading indica que o cadastro está sendo
              processado.
              ================================================== */}
          <PrimaryButton
            label="CRIAR CONTA"
            onPress={handleRegister}
            loading={loading}
          />


          {/* ==================================================
              RODAPÉ
              --------------------------------------------------
              Link para quem já possui uma conta voltar
              para a tela de login.
              ================================================== */}
          <View style={styles.footer}>

            <Text style={typography.bodyMuted}>
              Já possui uma conta?{" "}
            </Text>

            {/* Link para a tela de login (envolvido num
                TouchableOpacity, igual a tela de Login, pra ter
                uma área de toque melhor e feedback visual ao tocar). */}
            <Link href={{ pathname: "/(auth)/login", params: retornarPara ? { retornarPara } : undefined }} asChild>
              <TouchableOpacity>
                <Text style={styles.link}>
                  Entrar
                </Text>
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
// ------------------------------------------------------------
// Define o posicionamento, espaçamento e aparência dos
// elementos utilizados no cadastro.
// ============================================================
const styles = StyleSheet.create({

  // Container principal da tela
  container: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: "center",
  },

  // Área do cabeçalho
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
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

  // Espaçamento e alinhamento do subtítulo
  subtitle: {
    marginTop: spacing.xs,
    textAlign: "center",
  },

  // Formulário ocupa toda a largura disponível
  form: {
    width: "100%",
  },

  // Organiza o texto do rodapé lado a lado
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.lg,
  },

  // Estilo utilizado nos links
  link: {
    color: colors.secondary,
    fontWeight: "700",
  },
});
