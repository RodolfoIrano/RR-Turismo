// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// A ANIMAÇÃO de "voar pro carrinho" quando o usuário adiciona
// uma viagem (o efeito da imagem indo até o ícone do carrinho).
// ============================================================
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

// ============================================================
// FLY TO CART
// ------------------------------------------------------------
// Overlay imperativo que anima uma miniatura da viagem voando
// do botão "Adicionar ao carrinho" até o ícone do carrinho no
// header, em um arco, encolhendo e sumindo ao "pousar".
//
// Uso: renderize <FlyToCart ref={flyRef} /> uma vez na tela
// (por cima de tudo) e chame flyRef.current.fly({ ... }) no
// onPress do botão.
// ============================================================

const ITEM_SIZE = 64;

interface Point {
  x: number;
  y: number;
}

interface Rect extends Point {
  width: number;
  height: number;
}

export interface FlyToCartHandle {
  fly: (params: {
    imageUri: string;
    from: Rect;
    to: Point;
    onLand?: () => void;
  }) => void;
}

interface Flight {
  imageUri: string;
  from: Rect;
  to: Point;
}

const FlyToCart = forwardRef<FlyToCartHandle>((_, ref) => {
  // "progress" vai de 0 (início do voo) a 1 (pousou no carrinho).
  // Todas as animações abaixo (posição, tamanho, rotação, opacidade)
  // são calculadas a partir desse único valor.
  const progress = useRef(new Animated.Value(0)).current;

  // Guarda os dados do "voo" atual (de onde saiu, para onde vai, e
  // qual imagem mostrar). Fica null quando não há animação rolando.
  const [flight, setFlight] = useState<Flight | null>(null);

  // Guarda a função a ser chamada quando o item "pousar" no carrinho.
  const onLandRef = useRef<(() => void) | undefined>(undefined);

  useImperativeHandle(ref, () => ({
    // Inicia a animação de voo, do ponto "from" até o ponto "to".
    fly({ imageUri, from, to, onLand }) {
      onLandRef.current = onLand;
      setFlight({ imageUri, from, to });
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 750,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        // Ao terminar, esconde a miniatura e avisa quem chamou
        // (normalmente para disparar o "bump" no ícone do carrinho).
        setFlight(null);
        if (finished) onLandRef.current?.();
      });
    },
  }));

  // Sem voo em andamento, não renderiza nada.
  if (!flight) return null;

  const { from, to, imageUri } = flight;

  // Calcula o ponto inicial (centro do botão de origem) e final
  // (centro do ícone do carrinho), já descontando metade do
  // tamanho da miniatura para ela ficar centralizada nesses pontos.
  const startX = from.x + from.width / 2 - ITEM_SIZE / 2;
  const startY = from.y + from.height / 2 - ITEM_SIZE / 2;
  const endX = to.x - ITEM_SIZE / 2;
  const endY = to.y - ITEM_SIZE / 2;

  // Ponto de controle acima da reta start->end, para dar
  // curvatura de arco (sobe e depois desce até o carrinho).
  const midX = (startX + endX) / 2;
  const midY = Math.min(startY, endY) - 140;

  // Interpolações: convertem o valor único de "progress" (0 a 1)
  // em posição/escala/rotação/opacidade em cada instante da animação.
  // outputRange com 3 valores (em 0, 0.5 e 1) faz o movimento passar
  // pelo ponto do meio (midX/midY), formando o arco.
  const translateX = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [startX, midX, endX],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [startY, midY, endY],
  });
  // Encolhe bem no final, para dar a sensação de "entrando" no carrinho.
  const scale = progress.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [1, 0.85, 0.15],
  });
  // Gira levemente durante o voo, só por estilo.
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "20deg"],
  });
  // Fica totalmente visível até quase o fim, e só então desaparece rápido.
  const opacity = progress.interpolate({
    inputRange: [0, 0.85, 1],
    outputRange: [1, 1, 0],
  });

  return (
    <Animated.Image
      source={{ uri: imageUri }}
      // "pointerEvents" existe de verdade no componente Image, mas o
      // tipo do Animated.Image nesta versão do React Native não o
      // inclui (é só uma falha na definição de tipos, não afeta o
      // funcionamento) - por isso o "as any" aqui.
      {...({ pointerEvents: "none" } as any)}
      style={[
        styles.image,
        {
          opacity,
          transform: [{ translateX }, { translateY }, { scale }, { rotate }],
        },
      ]}
    />
  );
});

export default FlyToCart;

const styles = StyleSheet.create({
  image: {
    position: "absolute",
    top: 0,
    left: 0,
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: ITEM_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.textInverse,
    zIndex: 999,
    elevation: 999,
  },
});
