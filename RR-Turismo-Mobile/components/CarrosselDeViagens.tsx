// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// CARROSSEL de viagens: uma fileira horizontal de cartões que se
// move sozinha a cada poucos segundos e também pode ser arrastada
// com o dedo (ao tocar, o movimento automático para). Usado na tela
// da viagem para mostrar "Outras viagens do guia".
// ============================================================
import React, { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Trip } from "../types";
import { spacing } from "../constants/spacing";
import TripCard from "./TripCard";

const LARGURA_CARTAO = 240;   // mesma largura do TripCard vertical
const ESPACO = spacing.md;
const INTERVALO_MS = 4000;    // troca de cartão a cada 4 s

export default function CarrosselDeViagens({ trips }: { trips: Trip[] }) {
  const lista = useRef<FlatList<Trip>>(null);
  const indice = useRef(0);
  const [automatico, setAutomatico] = useState(true);

  // Passa sozinho para o próximo cartão (e volta ao primeiro no fim).
  useEffect(() => {
    if (!automatico || trips.length < 2) return;
    const id = setInterval(() => {
      indice.current = (indice.current + 1) % trips.length;
      lista.current?.scrollToIndex({ index: indice.current, animated: true });
    }, INTERVALO_MS);
    return () => clearInterval(id);
  }, [automatico, trips.length]);

  return (
    <FlatList
      ref={lista}
      data={trips}
      keyExtractor={(t) => t.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={LARGURA_CARTAO + ESPACO}
      decelerationRate="fast"
      ItemSeparatorComponent={() => <View style={{ width: ESPACO }} />}
      onScrollBeginDrag={() => setAutomatico(false)} // o usuário assumiu o controle
      onMomentumScrollEnd={(e) => {
        indice.current = Math.round(e.nativeEvent.contentOffset.x / (LARGURA_CARTAO + ESPACO));
      }}
      getItemLayout={(_, i) => ({ length: LARGURA_CARTAO + ESPACO, offset: (LARGURA_CARTAO + ESPACO) * i, index: i })}
      renderItem={({ item }) => <TripCard trip={item} />}
      contentContainerStyle={styles.conteudo}
    />
  );
}

const styles = StyleSheet.create({
  conteudo: { paddingVertical: spacing.xs, paddingRight: spacing.lg },
});
