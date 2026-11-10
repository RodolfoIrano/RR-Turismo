// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela FALE CONOSCO. A pessoa preenche nome, e-mail, telefone,
// assunto e mensagem (tudo validado) e aceita o uso dos dados. Ao
// enviar, o app abre o WhatsApp da equipe com a mensagem pronta (ou o
// e-mail). Também tem botões diretos de WhatsApp/e-mail e perguntas
// frequentes.
//
// ✏️ ONDE MUDAR O QUÊ:
//   - Número do WhatsApp e e-mail ........ constants/contato.ts
//   - Lista de assuntos (botões) ......... ASSUNTOS, logo abaixo
//   - Tamanho mínimo/máximo da mensagem .. MENSAGEM_MINIMO / MENSAGEM_MAXIMO
//   - Tempo de espera entre envios ....... ESPERA_ENTRE_ENVIOS_MS
//   - Perguntas frequentes mostradas ..... vêm de FAQ em
//                                          services/assistenteDeAjuda.ts
// IMPORTANTE: esta tela NÃO guarda a mensagem em nenhum banco; ela só
// monta o texto e entrega ao WhatsApp/e-mail do celular da pessoa.
// ============================================================
import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Text } from "../../components/TextoTraduzido";
import CampoCartao from "../../components/auth/CampoCartao";
import BotaoCartao from "../../components/auth/BotaoCartao";
import Aparece from "../../components/auth/Aparece";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import {
  EMAIL_CONTATO,
  emailConfigurado,
  linkDoEmail,
  linkDoWhatsapp,
  whatsappConfigurado,
} from "../../constants/contato";
import { FAQ } from "../../services/assistenteDeAjuda";
import { useAuth } from "../../contexts/AuthContext";
import { Mascara } from "../../utils/mascaras";

const ASSUNTOS = [
  "Dúvida",
  "Elogio",
  "Sugestão",
  "Reclamação",
  "Problema no app",
  "Parceria",
  "Outro",
];

const MENSAGEM_MINIMO = 10;
const MENSAGEM_MAXIMO = 500;
// Depois de enviar, espera um pouco antes de poder enviar outra (evita spam).
const ESPERA_ENTRE_ENVIOS_MS = 30_000;

type Erros = Partial<Record<"nome" | "email" | "telefone" | "assunto" | "mensagem" | "aceite", string>>;

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function FaleConosco() {
  const router = useRouter();
  const { user } = useAuth();
  const rolagem = useRef<ScrollViewInstance>(null);

  const [nome, setNome] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [telefone, setTelefone] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [aceite, setAceite] = useState(false);
  const [erros, setErros] = useState<Erros>({});
  const [enviadoEm, setEnviadoEm] = useState<number | null>(null);
  const [faqAberta, setFaqAberta] = useState<string | null>(null);

  const perguntas = useMemo(() => FAQ.slice(0, 6), []);

  // ----------------------------------------------------------
  // VALIDAÇÃO: devolve os erros de cada campo (vazio = tudo certo).
  // ----------------------------------------------------------
  function validar(): Erros {
    const e: Erros = {};
    if (nome.trim().length < 3) e.nome = "Digite seu nome completo.";
    if (!REGEX_EMAIL.test(email.trim())) e.email = "Digite um e-mail válido, como nome@email.com.";
    const digitosTel = Mascara.digitos(telefone);
    if (digitosTel.length > 0 && (digitosTel.length < 10 || digitosTel.length > 11)) {
      e.telefone = "Telefone com DDD, ex: (16) 99999-9999.";
    }
    if (!assunto) e.assunto = "Escolha um assunto.";
    if (mensagem.trim().length < MENSAGEM_MINIMO) {
      e.mensagem = `Escreva pelo menos ${MENSAGEM_MINIMO} caracteres.`;
    }
    if (!aceite) e.aceite = "É preciso concordar para enviar.";
    return e;
  }

  // Monta o texto que vai para o WhatsApp / e-mail.
  function montarTexto(): string {
    const linhas = [
      "Olá, equipe RR Turismo!",
      "",
      `*Assunto:* ${assunto}`,
      `*Nome:* ${nome.trim()}`,
      `*E-mail:* ${email.trim()}`,
    ];
    if (telefone.trim()) linhas.push(`*Telefone:* ${telefone.trim()}`);
    linhas.push("", "*Mensagem:*", mensagem.trim(), "", "Enviado pelo app RR Turismo");
    return linhas.join("\n");
  }

  // Confere tudo e, se estiver certo, abre o canal escolhido.
  async function enviar(canal: "whatsapp" | "email") {
    if (enviadoEm && Date.now() - enviadoEm < ESPERA_ENTRE_ENVIOS_MS) {
      Alert.alert("Calma aí", "Sua mensagem acabou de ser enviada. Aguarde alguns segundos para enviar outra.");
      return;
    }

    const e = validar();
    setErros(e);
    if (Object.keys(e).length > 0) {
      rolagem.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    if (canal === "whatsapp" && !whatsappConfigurado()) {
      Alert.alert(
        "WhatsApp ainda não configurado",
        "O número da equipe ainda não foi colocado no app (arquivo constants/contato.ts). Enquanto isso, envie por e-mail.",
      );
      return;
    }

    const link =
      canal === "whatsapp"
        ? linkDoWhatsapp(montarTexto())
        : linkDoEmail(`[RR Turismo] ${assunto}`, montarTexto().replace(/\*/g, ""));

    try {
      await Linking.openURL(link);
      setEnviadoEm(Date.now());
    } catch {
      Alert.alert("Não foi possível abrir", "Confira se o WhatsApp ou um app de e-mail está instalado no celular.");
    }
  }

  function novaMensagem() {
    setEnviadoEm(null);
    setAssunto("");
    setMensagem("");
    setAceite(false);
    setErros({});
  }

  async function abrirDireto(canal: "whatsapp" | "email") {
    if (canal === "whatsapp") {
      if (!whatsappConfigurado()) {
        Alert.alert("WhatsApp ainda não configurado", "O número da equipe ainda não foi colocado no app.");
        return;
      }
      Linking.openURL(linkDoWhatsapp("Olá, equipe RR Turismo! Gostaria de tirar uma dúvida.")).catch(() => {});
    } else {
      Linking.openURL(`mailto:${EMAIL_CONTATO}`).catch(() => {});
    }
  }

  const enviado = enviadoEm !== null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        ref={rolagem}
        style={styles.tela}
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Topo */}
        <Aparece atraso={0}>
          <View style={styles.topo}>
            <View style={styles.topoIcone}>
              <Ionicons name="chatbubbles" size={26} color={colors.textInverse} />
            </View>
            <Text style={styles.topoTitulo}>Fale com a gente</Text>
            <Text style={styles.topoTexto}>
              Dúvida, elogio, sugestão ou problema? Escreva abaixo e a mensagem chega direto na nossa equipe.
            </Text>
          </View>
        </Aparece>

        {/* Canais diretos */}
        <Aparece atraso={80}>
          <View style={styles.canais}>
            <TouchableOpacity style={[styles.canal, styles.canalZap]} onPress={() => abrirDireto("whatsapp")} accessibilityRole="button">
              <Ionicons name="logo-whatsapp" size={24} color="#FFFFFF" />
              <View style={{ flex: 1 }}>
                <Text style={styles.canalTitulo}>WhatsApp</Text>
                <Text style={styles.canalSub}>Resposta mais rápida</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            {emailConfigurado() && (
              <TouchableOpacity style={[styles.canal, styles.canalEmail]} onPress={() => abrirDireto("email")} accessibilityRole="button">
                <Ionicons name="mail" size={24} color={colors.secondary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.canalTitulo, { color: colors.primary }]}>E-mail</Text>
                  <Text style={[styles.canalSub, { color: colors.textSecondary }]}>{EMAIL_CONTATO}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </Aparece>

        {/* Formulário ou tela de "enviado" */}
        <Aparece atraso={140}>
          {enviado ? (
            <View style={styles.cartao}>
              <View style={styles.sucessoIcone}>
                <Ionicons name="checkmark" size={34} color={colors.textInverse} />
              </View>
              <Text style={styles.sucessoTitulo}>Quase lá!</Text>
              <Text style={styles.sucessoTexto}>
                Abrimos o aplicativo com a sua mensagem pronta. Toque em “enviar” lá para concluir. Se não abriu, confira se o app está instalado e tente de novo.
              </Text>
              <BotaoCartao label="Escrever outra mensagem" onPress={novaMensagem} />
            </View>
          ) : (
            <View style={styles.cartao}>
              <Text style={styles.cartaoTitulo}>Envie uma mensagem</Text>

              {Object.keys(erros).length > 0 && (
                <View style={styles.avisoErros}>
                  <Ionicons name="alert-circle" size={18} color={colors.danger} />
                  <Text style={styles.avisoErrosTexto}>
                    Confira os campos em vermelho antes de enviar.
                  </Text>
                </View>
              )}

              <CampoCartao
                label="Nome completo"
                icone="person-outline"
                value={nome}
                onChangeText={setNome}
                placeholder="Seu nome"
                autoCapitalize="words"
                temErro={!!erros.nome}
              />
              {!!erros.nome && <Erro texto={erros.nome} />}

              <CampoCartao
                label="E-mail"
                icone="mail-outline"
                value={email}
                onChangeText={setEmail}
                placeholder="nome@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                temErro={!!erros.email}
              />
              {!!erros.email && <Erro texto={erros.email} />}

              <CampoCartao
                label="Telefone"
                dicaNoRotulo="(opcional)"
                icone="call-outline"
                value={telefone}
                onChangeText={(v) => setTelefone(Mascara.telefone(v))}
                placeholder="(16) 99999-9999"
                keyboardType="phone-pad"
                temErro={!!erros.telefone}
              />
              {!!erros.telefone && <Erro texto={erros.telefone} />}

              <Text style={styles.rotulo}>Assunto</Text>
              <View style={styles.chips}>
                {ASSUNTOS.map((a) => (
                  <TouchableOpacity
                    key={a}
                    style={[styles.chip, assunto === a && styles.chipAtivo]}
                    onPress={() => setAssunto(a)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: assunto === a }}
                  >
                    <Text style={[styles.chipTexto, assunto === a && { color: colors.textInverse }]}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {!!erros.assunto && <Erro texto={erros.assunto} />}

              <CampoCartao
                label="Mensagem"
                icone="create-outline"
                value={mensagem}
                onChangeText={(v) => setMensagem(v.slice(0, MENSAGEM_MAXIMO))}
                placeholder="Conte como podemos ajudar..."
                multiline
                textAlignVertical="top"
                style={{ minHeight: 96 }}
                temErro={!!erros.mensagem}
              />
              <Text style={styles.contador}>
                {mensagem.length}/{MENSAGEM_MAXIMO}
              </Text>
              {!!erros.mensagem && <Erro texto={erros.mensagem} />}

              {/* Concordância */}
              <TouchableOpacity style={styles.aceite} onPress={() => setAceite(!aceite)} accessibilityRole="checkbox" accessibilityState={{ checked: aceite }}>
                <Ionicons
                  name={aceite ? "checkbox" : "square-outline"}
                  size={24}
                  color={erros.aceite ? colors.danger : aceite ? colors.secondary : colors.textMuted}
                />
                <Text style={styles.aceiteTexto}>
                  Concordo em compartilhar estes dados com a equipe do RR Turismo apenas para responder à minha mensagem.
                </Text>
              </TouchableOpacity>
              {!!erros.aceite && <Erro texto={erros.aceite} />}

              <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
                <BotaoCartao label="Enviar pelo WhatsApp" onPress={() => enviar("whatsapp")} />
                {emailConfigurado() && (
                  <TouchableOpacity style={styles.botaoEmail} onPress={() => enviar("email")} accessibilityRole="button">
                    <Ionicons name="mail-outline" size={18} color={colors.secondary} />
                    <Text style={styles.botaoEmailTexto}>Enviar por e-mail</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </Aparece>

        {/* Perguntas frequentes */}
        <Aparece atraso={200}>
          <Text style={styles.secao}>Perguntas frequentes</Text>
          <View style={styles.cartaoFaq}>
            {perguntas.map((p, i) => {
              const aberta = faqAberta === p.titulo;
              return (
                <View key={p.titulo} style={[i > 0 && styles.faqDivisor]}>
                  <TouchableOpacity
                    style={styles.faqLinha}
                    onPress={() => setFaqAberta(aberta ? null : p.titulo)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: aberta }}
                  >
                    <Text style={styles.faqPergunta}>{p.titulo}</Text>
                    <Ionicons name={aberta ? "chevron-up" : "chevron-down"} size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                  {aberta && <Text style={styles.faqResposta}>{p.resposta}</Text>}
                </View>
              );
            })}
          </View>

          <TouchableOpacity style={styles.linkSobre} onPress={() => router.push("/sobre-nos")} accessibilityRole="button">
            <Text style={styles.linkSobreTexto}>Conheça a nossa história</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.secondary} />
          </TouchableOpacity>
        </Aparece>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Mensagem de erro vermelha abaixo de um campo.
function Erro({ texto }: { texto: string }) {
  return (
    <View style={styles.erro}>
      <Ionicons name="alert-circle" size={14} color={colors.danger} />
      <Text style={styles.erroTexto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.backgroundMuted },
  conteudo: { padding: spacing.lg, paddingBottom: spacing.xxxl },

  topo: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  topoIcone: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  topoTitulo: { color: colors.textInverse, fontSize: 22, fontWeight: "800" },
  topoTexto: { color: colors.primaryMuted, fontSize: 14, lineHeight: 20, textAlign: "center" },

  canais: { gap: spacing.md, marginTop: spacing.lg },
  canal: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  canalZap: { backgroundColor: "#1FA855" },
  canalEmail: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  canalTitulo: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  canalSub: { color: "rgba(255,255,255,0.85)", fontSize: 13 },

  cartao: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cartaoTitulo: { fontSize: 18, fontWeight: "800", color: colors.primary, marginBottom: spacing.lg },
  avisoErros: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSuave,
    marginBottom: spacing.lg,
  },
  avisoErrosTexto: { flex: 1, fontSize: 13, fontWeight: "700", color: colors.danger },
  rotulo: { fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 6, marginLeft: 2 },

  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipAtivo: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  chipTexto: { fontSize: 13, fontWeight: "700", color: colors.primary },

  contador: { alignSelf: "flex-end", fontSize: 12, color: colors.textMuted, marginTop: -10, marginBottom: spacing.md },


  aceite: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginBottom: spacing.sm },
  aceiteTexto: { flex: 1, fontSize: 13, lineHeight: 19, color: colors.textSecondary },

  erro: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: -10, marginBottom: spacing.md },
  erroTexto: { fontSize: 12, color: colors.danger, flex: 1 },

  botaoEmail: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.secondary,
  },
  botaoEmailTexto: { color: colors.secondary, fontWeight: "800", fontSize: 15 },

  sucessoIcone: {
    alignSelf: "center",
    marginBottom: spacing.md,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  sucessoTitulo: { textAlign: "center", fontSize: 20, fontWeight: "800", color: colors.primary, marginBottom: spacing.sm },
  sucessoTexto: { textAlign: "center", fontSize: 14, lineHeight: 21, color: colors.textSecondary, marginBottom: spacing.lg },

  secao: { fontSize: 17, fontWeight: "800", color: colors.primary, marginTop: spacing.xl, marginBottom: spacing.md },
  cartaoFaq: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  faqDivisor: { borderTopWidth: 1, borderTopColor: colors.border },
  faqLinha: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md + 2 },
  faqPergunta: { flex: 1, fontSize: 15, fontWeight: "700", color: colors.text },
  faqResposta: { fontSize: 14, lineHeight: 21, color: colors.textSecondary, paddingBottom: spacing.md },

  linkSobre: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "center", marginTop: spacing.xl },
  linkSobreTexto: { color: colors.secondary, fontWeight: "800", fontSize: 14 },
});
