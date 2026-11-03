// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// É o ÍCONE DE CARRINHO que fica no cabeçalho de algumas telas,
// com a animação de "pulo" quando um item é adicionado.
// ============================================================
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View, type HostInstance } from "react-native";
import { Text } from "./TextoTraduzido";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { radius, spacing } from "../constants/spacing";

// ============================================================
// CART HEADER BUTTON
// ------------------------------------------------------------
// Ícone de carrinho com badge de quantidade, usado no header
// de /trip/[id]. Serve como "pouso" da animação FlyToCart e dá
// um pequeno bounce quando o item chega.
// ============================================================

export interface CartHeaderButtonHandle {
  /** Retorna o centro do botão em coordenadas de janela (measureInWindow). */
  measureCenter: (cb: (x: number, y: number) => void) => void;
  /** Dispara o efeito de "pulo" quando um item chega ao carrinho. */
  bump: () => void;
}

interface Props {
  itemCount: number; // quantidade de itens no carrinho (exibida no selo)
  onPress: () => void;
}

const CartHeaderButton = forwardRef<CartHeaderButtonHandle, Props>(
  ({ itemCount, onPress }, ref) => {
    // Referência à View real do botão, usada para descobrir sua
    // posição exata na tela (necessário para a animação FlyToCart
    // saber até onde "voar").
    const touchableRef = useRef<HostInstance>(null);

    // Controla a escala do ícone, usada no efeito de "pulo" (bump).
    const scale = useRef(new Animated.Value(1)).current;

    // Expõe funções para o componente pai (trip/[id].tsx) chamar
    // através de uma ref, já que a posição do botão e a animação
    // de "pulo" só podem ser controladas de dentro deste componente.
    useImperativeHandle(ref, () => ({
      // Descobre onde o botão está na tela (coordenadas absolutas),
      // para saber até onde a animação de "voar para o carrinho" deve ir.
      measureCenter(cb) {
        touchableRef.current?.measureInWindow((x, y, width, height) => {
          cb(x + width / 2, y + height / 2);
        });
      },
      // Anima o ícone crescendo e voltando ao tamanho normal
      // rapidamente - dá a sensação de "o item chegou aqui".
      bump() {
        scale.setValue(1);
        Animated.sequence([
          Animated.spring(scale, { toValue: 1.4, useNativeDriver: true, speed: 40, bounciness: 12 }),
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }),
        ]).start();
      },
    }));

    return (
      <TouchableOpacity
        ref={touchableRef as unknown as React.Ref<View>}
        onPress={onPress}
        style={styles.button}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        // "collapsable={false}" impede o Android de "otimizar" essa
        // View removendo-a da árvore nativa - isso é necessário
        // para o measureInWindow() (usado acima) funcionar direito.
        // O tipo do TouchableOpacity nesta versão do RN não inclui
        // essa prop (falha na definição de tipos, não no funcionamento).
        {...({ collapsable: false } as any)}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="cart-outline" size={24} color={colors.text} />
          {itemCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{itemCount > 9 ? "9+" : itemCount}</Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  }
);

export default CartHeaderButton;

const styles = StyleSheet.create({
  button: { padding: spacing.xs, marginRight: spacing.sm },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: colors.textInverse, fontSize: 10, fontWeight: "700" },
});
