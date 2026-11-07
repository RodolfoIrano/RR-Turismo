// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Galeria de FOTOS da viagem (carrossel). Quando a viagem tem mais
// de uma foto, ela mostra de forma BEM CLARA que dá para arrastar:
//   - setinhas ‹ › nas laterais (tocar troca de foto);
//   - bolinhas embaixo (a da foto atual "estica");
//   - contador "2/5";
//   - um aviso "Deslize para ver mais fotos" que some sozinho.
// Se uma foto não carregar, mostra um espaço reservado em vez de
// deixar um vazio feio.
// ============================================================
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, FlatList, StyleSheet, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./TextoTraduzido";
import { colors } from "../constants/colors";
import { radius, spacing } from "../constants/spacing";

interface Props {
  fotos: string[]; // endereços completos das imagens (a 1ª é a capa)
  altura?: number;
}

export default function GaleriaDeFotos({ fotos, altura = 330 }: Props) {
  const { width } = useWindowDimensions();
  const listaRef = useRef<FlatList<string>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [indice, setIndice] = useState(0);
  const [comErro, setComErro] = useState<Set<string>>(new Set());
  const [mostrarDica, setMostrarDica] = useState(fotos.length > 1);

  const varias = fotos.length > 1;

  // ---- Aviso "deslize": o ícone balança de lado e o aviso some em ~5 s ----
  const balanco = useRef(new Animated.Value(0)).current;
  const opacidadeDica = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!varias) return;
    const laco = Animated.loop(
      Animated.sequence([
        Animated.timing(balanco, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(balanco, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    laco.start();
    const relogio = setTimeout(esconderDica, 5000);
    return () => {
      laco.stop();
      clearTimeout(relogio);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [varias]);

  function esconderDica() {
    Animated.timing(opacidadeDica, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => setMostrarDica(false));
  }

  function irPara(novo: number) {
    if (novo < 0 || novo > fotos.length - 1) return;
    listaRef.current?.scrollToIndex({ index: novo, animated: true });
    setIndice(novo);
    if (mostrarDica) esconderDica();
  }

  return (
    <View style={{ height: altura }}>
      <Animated.FlatList
        ref={listaRef as any}
        data={fotos}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
          listener: (e: any) => {
            const novo = Math.round(e.nativeEvent.contentOffset.x / width);
            if (novo !== indice) {
              setIndice(novo);
              if (mostrarDica && novo > 0) esconderDica();
            }
          },
        })}
        renderItem={({ item }) =>
          comErro.has(item) ? (
            <View style={[styles.fallback, { width, height: altura }]}>
              <Ionicons name="image-outline" size={40} color={colors.textMuted} />
              <Text style={styles.fallbackTexto}>Foto indisponível</Text>
            </View>
          ) : (
            <Image
              source={{ uri: item }}
              style={{ width, height: altura, backgroundColor: colors.backgroundMuted }}
              contentFit="cover"
              transition={250}
              onError={() => setComErro((atual) => new Set(atual).add(item))}
            />
          )
        }
      />

      {varias && (
        <>
          {/* Setas laterais (a da esquerda some na 1ª foto; a da direita some na última) */}
          {indice > 0 && (
            <TouchableOpacity
              style={[styles.seta, { left: spacing.md, top: altura / 2 - 24 }]}
              onPress={() => irPara(indice - 1)}
              accessibilityLabel="Foto anterior"
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={22} color={colors.textInverse} />
            </TouchableOpacity>
          )}
          {indice < fotos.length - 1 && (
            <TouchableOpacity
              style={[styles.seta, { right: spacing.md, top: altura / 2 - 24 }]}
              onPress={() => irPara(indice + 1)}
              accessibilityLabel="Próxima foto"
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-forward" size={22} color={colors.textInverse} />
            </TouchableOpacity>
          )}

          {/* Bolinhas: a da foto atual "estica" */}
          <View style={styles.pontos} pointerEvents="none">
            {fotos.map((_, i) => {
              const entrada = [(i - 1) * width, i * width, (i + 1) * width];
              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.ponto,
                    {
                      width: scrollX.interpolate({ inputRange: entrada, outputRange: [7, 22, 7], extrapolate: "clamp" }),
                      opacity: scrollX.interpolate({ inputRange: entrada, outputRange: [0.55, 1, 0.55], extrapolate: "clamp" }),
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Contador */}
          <View style={styles.contador} pointerEvents="none">
            <Ionicons name="images-outline" size={13} color={colors.textInverse} />
            <Text style={styles.contadorTexto}>
              {indice + 1}/{fotos.length}
            </Text>
          </View>

          {/* Aviso "deslize" (some sozinho) */}
          {mostrarDica && (
            <Animated.View style={[styles.dica, { opacity: opacidadeDica }]} pointerEvents="none">
              <Animated.View
                style={{ transform: [{ translateX: balanco.interpolate({ inputRange: [0, 1], outputRange: [-4, 4] }) }] }}
              >
                <Ionicons name="swap-horizontal" size={16} color={colors.textInverse} />
              </Animated.View>
              <Text style={styles.dicaTexto}>Deslize para ver mais fotos</Text>
            </Animated.View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { backgroundColor: colors.backgroundMuted, alignItems: "center", justifyContent: "center", gap: spacing.xs },
  fallbackTexto: { fontSize: 12, color: colors.textMuted },

  seta: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(11,31,42,0.55)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },

  pontos: {
    position: "absolute",
    bottom: 46,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  ponto: { height: 7, borderRadius: 4, backgroundColor: colors.textInverse },

  contador: {
    position: "absolute",
    bottom: 40,
    right: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.overlayEscuro,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  contadorTexto: { color: colors.textInverse, fontSize: 12, fontWeight: "700" },

  dica: {
    position: "absolute",
    bottom: 84,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(11,31,42,0.7)",
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  dicaTexto: { color: colors.textInverse, fontSize: 12, fontWeight: "600" },
});
