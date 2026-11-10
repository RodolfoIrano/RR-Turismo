// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela SOBRE NÓS: mostra a foto da dupla (Rafael e Rodolfo), quem
// somos, o que é o RR Turismo, o que ele oferece para quem viaja e
// para guias/empresas, as tecnologias e os valores. Tem um botão que
// leva para o Fale conosco.
//
// ✏️ ONDE MUDAR O QUÊ:
//   - Foto da dupla ............ assets/images/RR-Fundadores.jpg (troque o
//                                arquivo mantendo o mesmo nome)
//   - Nomes e curso na foto .... texto "Rafael & Rodolfo" e a linha do curso,
//                                dentro de <View style={styles.fotoLegenda}>
//   - Textos "Quem somos" e "O que é" ... <Text style={styles.texto}> de cada Cartao
//   - Listas "Para quem viaja" / "Para guias e empresas" ... PARA_VIAJANTES e PARA_GUIAS
//   - Tecnologias .............. TECNOLOGIAS
//   - Valores (ícone + nome) ... VALORES
// ============================================================
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "../../components/TextoTraduzido";
import PrimaryButton from "../../components/PrimaryButton";
import Aparece from "../../components/auth/Aparece";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";

type Icone = keyof typeof Ionicons.glyphMap;

const PARA_VIAJANTES: string[] = [
  "Descobrir viagens por categoria, busca e destino",
  "Salvar as favoritas e reservar com poucos toques",
  "Acompanhar a viagem ao vivo, com mapa e avisos do guia",
  "Usar o app no idioma que preferir",
];

const PARA_GUIAS: string[] = [
  "Criar e divulgar viagens e excursões, com várias fotos",
  "Gerenciar as reservas pelo site",
  "Usar o Modo Guia: grupo no mapa e avisos em tempo real",
  "Ganhar audiência com uma vitrine feita para turismo",
];

const TECNOLOGIAS: string[] = ["Spring Boot", "MySQL", "React Native", "Expo", "TypeScript"];

const VALORES: { icone: Icone; nome: string }[] = [
  { icone: "heart-outline", nome: "Paixão" },
  { icone: "star-outline", nome: "Excelência" },
  { icone: "bulb-outline", nome: "Inovação" },
  { icone: "leaf-outline", nome: "Sustentabilidade" },
];

export default function SobreNos() {
  const router = useRouter();

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
      {/* Foto da dupla, com os nomes e o curso por cima. */}
      <Aparece atraso={0}>
        <View style={styles.foto}>
          <Image
            source={require("../../assets/images/RR-Fundadores.jpg")}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition="top"
            accessibilityLabel="Rafael e Rodolfo, criadores do RR Turismo, com o site aberto no notebook"
          />
          <View style={styles.fotoLegenda}>
            <Text style={styles.fotoNomes}>Rafael &amp; Rodolfo</Text>
            <Text style={styles.fotoCurso}>Fatec Taquaritinga · Sistemas para Internet</Text>
          </View>
        </View>
      </Aparece>

      <Aparece atraso={80}>
        <Cartao icone="people-outline" titulo="Quem somos">
          <Text style={styles.texto}>
            Somos Rafael e Rodolfo, dois amigos que cursam Sistemas para Internet na Fatec Taquaritinga. O RR Turismo nasceu como projeto do curso, com a vontade de ajudar quem trabalha com turismo a divulgar e vender as suas viagens e excursões.
          </Text>
        </Cartao>
      </Aparece>

      <Aparece atraso={140}>
        <Cartao icone="airplane-outline" titulo="O que é o RR Turismo">
          <Text style={styles.texto}>
            É uma plataforma que conecta guias e empresas de turismo a quem quer viajar. Quem organiza as viagens publica tudo pelo site; quem viaja descobre, reserva e acompanha a viagem pelo aplicativo, com mapa ao vivo, avisos do guia e o idioma que preferir.
          </Text>
          <View style={styles.selos}>
            <Selo texto="Site + App" />
            <Selo texto="Mapa ao vivo" />
            <Selo texto="Vários idiomas" />
          </View>
        </Cartao>
      </Aparece>

      <Aparece atraso={200}>
        <Cartao icone="happy-outline" titulo="Para quem viaja">
          <Lista itens={PARA_VIAJANTES} />
        </Cartao>
      </Aparece>

      <Aparece atraso={260}>
        <Cartao icone="briefcase-outline" titulo="Para guias e empresas">
          <Lista itens={PARA_GUIAS} />
        </Cartao>
      </Aparece>

      <Aparece atraso={320}>
        <View style={styles.destaque}>
          <Text style={styles.destaqueTexto}>
            Cada viagem é uma nova história, e estamos aqui para ajudar a escrever a sua. ✈️
          </Text>
        </View>
      </Aparece>

      <Aparece atraso={380}>
        <Cartao icone="construct-outline" titulo="Como foi feito">
          <View style={styles.selos}>
            {TECNOLOGIAS.map((tec) => (
              <Selo key={tec} texto={tec} />
            ))}
          </View>
        </Cartao>
      </Aparece>

      <Aparece atraso={440}>
        <Text style={styles.secaoTitulo}>Nossos valores</Text>
        <View style={styles.valores}>
          {VALORES.map((v) => (
            <View key={v.nome} style={styles.valor}>
              <Ionicons name={v.icone} size={26} color={colors.secondary} />
              <Text style={styles.valorNome}>{v.nome}</Text>
            </View>
          ))}
        </View>
      </Aparece>

      <Aparece atraso={500}>
        <View style={{ marginTop: spacing.xl }}>
          <PrimaryButton label="Fale conosco" onPress={() => router.push("/fale-conosco")} />
        </View>
      </Aparece>
    </ScrollView>
  );
}

// Cartão branco com ícone + título.
function Cartao({ icone, titulo, children }: { icone: Icone; titulo: string; children: React.ReactNode }) {
  return (
    <View style={styles.cartao}>
      <View style={styles.cartaoTopo}>
        <View style={styles.cartaoIcone}>
          <Ionicons name={icone} size={20} color={colors.secondary} />
        </View>
        <Text style={styles.cartaoTitulo}>{titulo}</Text>
      </View>
      {children}
    </View>
  );
}

function Lista({ itens }: { itens: string[] }) {
  return (
    <View style={{ gap: spacing.sm }}>
      {itens.map((item) => (
        <View key={item} style={styles.itemLista}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} style={{ marginTop: 2 }} />
          <Text style={[styles.texto, { flex: 1 }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function Selo({ texto }: { texto: string }) {
  return (
    <View style={styles.selo}>
      <Text style={styles.seloTexto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.backgroundMuted },
  conteudo: { padding: spacing.lg, paddingBottom: spacing.xxxl },

  foto: {
    height: 300,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.primary,
    justifyContent: "flex-end",
  },
  fotoLegenda: {
    padding: spacing.lg,
    backgroundColor: "rgba(0,17,70,0.72)",
  },
  fotoNomes: { color: colors.textInverse, fontSize: 22, fontWeight: "800" },
  fotoCurso: { color: colors.primaryMuted, fontSize: 13, marginTop: 2 },

  cartao: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cartaoTopo: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  cartaoIcone: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(26,86,219,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  cartaoTitulo: { fontSize: 17, fontWeight: "800", color: colors.primary },
  texto: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  itemLista: { flexDirection: "row", gap: spacing.sm },

  selos: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  selo: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: "rgba(26,86,219,0.1)",
  },
  seloTexto: { fontSize: 13, fontWeight: "700", color: colors.secondary },

  destaque: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  destaqueTexto: { color: colors.textInverse, fontSize: 16, lineHeight: 24, fontWeight: "600" },

  secaoTitulo: { fontSize: 17, fontWeight: "800", color: colors.primary, marginTop: spacing.xl, marginBottom: spacing.md },
  valores: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  valor: {
    flexGrow: 1,
    flexBasis: "45%",
    alignItems: "center",
    gap: 6,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  valorNome: { fontSize: 14, fontWeight: "700", color: colors.text },
});
