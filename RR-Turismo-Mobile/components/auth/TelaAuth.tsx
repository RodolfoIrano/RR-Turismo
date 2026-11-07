// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// É o "MOLDE" visual das telas de LOGIN e CADASTRO: fundo com
// círculos coloridos flutuando, a logo e um CARTÃO moderno (cantos
// arredondados + sombra) que sobe animado. Dentro do cartão tem as
// abas "Entrar | Criar conta" (com um marcador que desliza) e o
// conteúdo de cada tela.
//
// Só cuida da APARÊNCIA e da animação. Quem faz o login/cadastro
// continua sendo cada tela (login.tsx e register.tsx).
// ============================================================
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text } from "../TextoTraduzido";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { shadows } from "../../constants/shadows";

type Aba = "entrar" | "cadastrar";

interface Props {
  aba: Aba;
  retornarPara?: string;
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
}

// ---------- Círculos decorativos que flutuam devagar ----------
function CirculoFlutuante({ tamanho, cor, estilo, duracao }: { tamanho: number; cor: string; estilo: object; duracao: number }) {
  const vai = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const laco = Animated.loop(
      Animated.sequence([
        Animated.timing(vai, { toValue: 1, duration: duracao, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(vai, { toValue: 0, duration: duracao, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    laco.start();
    return () => laco.stop();
  }, [duracao, vai]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          width: tamanho,
          height: tamanho,
          borderRadius: tamanho / 2,
          backgroundColor: cor,
          transform: [{ translateY: vai.interpolate({ inputRange: [0, 1], outputRange: [-12, 12] }) }],
        },
        estilo,
      ]}
    />
  );
}

// ---------- Abas "Entrar | Criar conta" com marcador deslizante ----------
function AbasDoCartao({ aba, retornarPara }: { aba: Aba; retornarPara?: string }) {
  const router = useRouter();
  const posicao = useRef(new Animated.Value(aba === "entrar" ? 1 : 0)).current; // começa na aba "de onde veio"
  const [larguraTotal, setLarguraTotal] = React.useState(0);

  useEffect(() => {
    // Ao abrir a tela, o marcador desliza até a aba atual (efeito de troca suave).
    Animated.timing(posicao, {
      toValue: aba === "entrar" ? 0 : 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [aba, posicao]);

  function ir(destino: Aba) {
    if (destino === aba) return;
    const params = retornarPara ? { retornarPara } : undefined;
    router.replace({ pathname: destino === "entrar" ? "/(auth)/login" : "/(auth)/register", params } as any);
  }

  const metade = Math.max((larguraTotal - 8) / 2, 0);

  return (
    <View style={styles.abas} onLayout={(e) => setLarguraTotal(e.nativeEvent.layout.width)}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.marcador,
          { width: metade, transform: [{ translateX: posicao.interpolate({ inputRange: [0, 1], outputRange: [0, metade] }) }] },
        ]}
      />
      <Pressable style={styles.aba} onPress={() => ir("entrar")} accessibilityRole="tab">
        <Text style={[styles.abaTexto, aba === "entrar" && styles.abaTextoAtiva]}>Entrar</Text>
      </Pressable>
      <Pressable style={styles.aba} onPress={() => ir("cadastrar")} accessibilityRole="tab">
        <Text style={[styles.abaTexto, aba === "cadastrar" && styles.abaTextoAtiva]}>Criar conta</Text>
      </Pressable>
    </View>
  );
}

// ---------- Caixa de erro (balança quando aparece) ----------
export function CaixaDeErro({ mensagem }: { mensagem: string | null }) {
  const balanco = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!mensagem) return;
    Animated.sequence([
      Animated.timing(balanco, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(balanco, { toValue: -1, duration: 90, useNativeDriver: true }),
      Animated.timing(balanco, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.timing(balanco, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [mensagem, balanco]);

  if (!mensagem) return null;
  return (
    <Animated.View
      style={[styles.erro, { transform: [{ translateX: balanco.interpolate({ inputRange: [-1, 1], outputRange: [-7, 7] }) }] }]}
      accessibilityRole="alert"
    >
      <Ionicons name="alert-circle" size={18} color={colors.danger} />
      <Text style={styles.erroTexto}>{mensagem}</Text>
    </Animated.View>
  );
}

// ---------- A tela em si ----------
export default function TelaAuth({ aba, retornarPara, titulo, subtitulo, children }: Props) {
  const entrada = useRef(new Animated.Value(0)).current;
  const entradaLogo = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entradaLogo, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(entrada, { toValue: 1, delay: 120, useNativeDriver: true, speed: 9, bounciness: 7 }),
    ]).start();
  }, [entrada, entradaLogo]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F4F8FB" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Fundo decorativo */}
      <CirculoFlutuante tamanho={280} cor="rgba(44,177,188,0.16)" estilo={{ top: -90, right: -90 }} duracao={4200} />
      <CirculoFlutuante tamanho={220} cor="rgba(255,122,61,0.12)" estilo={{ bottom: 40, left: -80 }} duracao={5000} />
      <CirculoFlutuante tamanho={150} cor="rgba(11,61,92,0.08)" estilo={{ top: 260, left: -40 }} duracao={3800} />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo (tamanho definido pelo próprio usuário - não mexer) */}
        <Animated.View style={[styles.logoArea, { opacity: entradaLogo }]}>
          <Image
            source={require("../../assets/images/RRTurismoEscuro.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Cartão */}
        <Animated.View
          style={[
            styles.cartao,
            {
              opacity: entrada,
              transform: [
                { translateY: entrada.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) },
                { scale: entrada.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
              ],
            },
          ]}
        >
          <AbasDoCartao aba={aba} retornarPara={retornarPara} />

          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.subtitulo}>{subtitulo}</Text>

          {children}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 56, // espaço no topo: a logo tem margem negativa e senão ficaria cortada
    paddingBottom: spacing.xxl,
    justifyContent: "center",
    alignItems: "center",
  },

  logoArea: { alignItems: "center", justifyContent: "center" },
  // ⭐ TAMANHO DA LOGO (mesmos valores que o usuário definiu; só o espaço
  // de baixo foi reduzido porque agora o cartão vem logo depois da logo).
  logo: {
    width: 200,
    height: 200,
    marginTop: -64,
    marginBottom: 0,
  },

  cartao: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(11,61,92,0.06)",
    ...shadows.elevated,
  },

  // Abas
  abas: {
    flexDirection: "row",
    backgroundColor: "#EEF3F7",
    borderRadius: 16,
    padding: 4,
    marginBottom: spacing.xl,
  },
  marcador: {
    position: "absolute",
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    ...shadows.card,
  },
  aba: { flex: 1, paddingVertical: 11, alignItems: "center", justifyContent: "center" },
  abaTexto: { fontSize: 14, fontWeight: "700", color: colors.textSecondary },
  abaTextoAtiva: { color: colors.primary },

  titulo: { fontSize: 24, fontWeight: "800", color: colors.primary },
  subtitulo: { fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.xl },

  erro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.dangerSuave,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: spacing.lg,
  },
  erroTexto: { flex: 1, color: colors.danger, fontSize: 13, fontWeight: "600" },
});
