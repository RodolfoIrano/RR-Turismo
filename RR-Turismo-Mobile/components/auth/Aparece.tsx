// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Faz o conteúdo "aparecer" suavemente (some -> surge subindo um
// pouquinho). Usado no login e no cadastro para os campos
// entrarem um depois do outro, de forma elegante.
// Use "atraso" (em milissegundos) para escalonar a entrada.
// ============================================================
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleProp, ViewStyle } from "react-native";

interface Props {
  atraso?: number; // espera antes de começar a animação (ms)
  distancia?: number; // quantos pixels ele sobe ao aparecer
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export default function Aparece({ atraso = 0, distancia = 14, style, children }: Props) {
  const progresso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animacao = Animated.timing(progresso, {
      toValue: 1,
      duration: 420,
      delay: atraso,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animacao.start();
    return () => animacao.stop();
  }, [atraso, progresso]);

  return (
    <Animated.View
      style={[
        {
          opacity: progresso,
          transform: [{ translateY: progresso.interpolate({ inputRange: [0, 1], outputRange: [distancia, 0] }) }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
