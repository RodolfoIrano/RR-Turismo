import { Image } from 'expo-image';
import { Platform, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { coresInstitucionaisFixas } from '@/constants/temaInstitucional';


// ============================================================
// TELA "SOBRE NÓS"
// ------------------------------------------------------------
// Apresenta informações sobre a RR Turismos, como sua história,
// missão, quem somos, valores e uma mensagem de destaque.
//
// A tela utiliza ScrollView para permitir que todo o conteúdo
// seja visualizado em telas menores.
// ============================================================
export default function SobreScreen() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}>

      {/* ======================================================
          ESPAÇO SUPERIOR
          ------------------------------------------------------
          Cria um espaço no topo da tela para evitar que o
          conteúdo fique muito próximo da barra de status.
          ====================================================== */}
      <ThemedView style={styles.topSpacer} />


      {/* ======================================================
          IMAGEM PRINCIPAL
          ------------------------------------------------------
          Exibe a imagem dos fundadores da RR Turismos.
          O wrapper aplica margem, bordas arredondadas e sombra.
          ====================================================== */}
      <ThemedView style={styles.heroWrapper}>
        <Image
          source={require('@/assets/images/RR-Fundadores.jpg')}
          style={styles.heroImage}
          contentFit="cover"
          contentPosition="top"
        />
      </ThemedView>


      {/* ======================================================
          CONTEÚDO PRINCIPAL
          ------------------------------------------------------
          Agrupa todas as informações apresentadas na tela.
          ====================================================== */}
      <ThemedView style={styles.body}>

        {/* ==================================================
            TÍTULO DA PÁGINA
            --------------------------------------------------
            Barra azul ao lado do título para destacar
            visualmente a seção.
            ================================================== */}
        <ThemedView style={styles.titleContainer}>
          <ThemedView style={styles.titleBar} />

          <ThemedText type="title" style={styles.titulo}>
            Sobre Nós
          </ThemedText>
        </ThemedView>


        {/* ==================================================
            APRESENTAÇÃO
            --------------------------------------------------
            Pequena introdução sobre a empresa e sua origem.
            ================================================== */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            🌍 Bem-vindo à RR Turismos!
          </ThemedText>

          <ThemedText style={styles.paragraph}>
            Fundada em 2024, nossa paixão é criar experiências de viagem
            inesquecíveis, conectando pessoas a destinos incríveis.
          </ThemedText>
        </ThemedView>


        {/* ==================================================
            MISSÃO
            --------------------------------------------------
            Explica o principal objetivo da RR Turismos e
            os princípios que orientam o trabalho da empresa.
            ================================================== */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            🎯 Nossa Missão
          </ThemedText>

          <ThemedText style={styles.paragraph}>
            Proporcionar viagens personalizadas e de alta qualidade. Acreditamos
            na transformação através do turismo, valorizando paixão, excelência,
            inovação e sustentabilidade.
          </ThemedText>
        </ThemedView>


        {/* ==================================================
            QUEM SOMOS
            --------------------------------------------------
            Apresenta a história e a ideia por trás da criação
            do projeto.
            ================================================== */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            👥 Quem Somos
          </ThemedText>

          <ThemedText style={styles.paragraph}>
            Somos dois amigos que, motivados pelo desejo de ajudar as pessoas a
            venderem suas viagens e excursões, desenvolvemos um projeto voltado
            para a criação de um site especializado nesse segmento.
          </ThemedText>
        </ThemedView>


        {/* ==================================================
            MENSAGEM DE DESTAQUE
            --------------------------------------------------
            Caixa azul utilizada para destacar uma mensagem
            importante e criar um ponto visual diferente
            dentro da página.
            ================================================== */}
        <ThemedView style={styles.highlightBox}>
          <ThemedText style={styles.highlightText}>
            ✈️ Venha explorar o mundo conosco e descubra como é viajar com a RR
            Turismos. Cada viagem é uma nova história, e estamos aqui para
            ajudar a escrever a sua!
          </ThemedText>
        </ThemedView>


        {/* ==================================================
            NOSSOS VALORES
            --------------------------------------------------
            Apresenta os principais valores da empresa em
            pequenos cards organizados em uma grade.
            ================================================== */}
        <ThemedView style={styles.valuesContainer}>

          <ThemedText
            type="subtitle"
            style={[styles.sectionTitle, { marginBottom: 12 }]}>
            💡 Nossos Valores
          </ThemedText>


          {/* Grade com os quatro valores da empresa */}
          <ThemedView style={styles.valuesGrid}>

            {[
              { icon: '❤️', label: 'Paixão' },
              { icon: '⭐', label: 'Excelência' },
              { icon: '💡', label: 'Inovação' },
              { icon: '🌱', label: 'Sustentabilidade' },
            ].map((item) => (

              // Cada valor possui um ícone e seu respectivo nome
              <ThemedView
                key={item.label}
                style={styles.valueItem}>

                <ThemedText style={styles.valueIcon}>
                  {item.icon}
                </ThemedText>

                <ThemedText style={styles.valueLabel}>
                  {item.label}
                </ThemedText>

              </ThemedView>
            ))}

          </ThemedView>
        </ThemedView>

      </ThemedView>
    </ScrollView>
  );
}


// ============================================================
// ESTILOS DA TELA
// ------------------------------------------------------------
// Reúne os estilos utilizados na página, incluindo espaçamento,
// cores, tamanhos, bordas e organização dos elementos.
// ============================================================
const styles = StyleSheet.create({

  // Container principal do ScrollView
  scroll: {
    flex: 1,
  },

  // Espaço inferior para evitar que o último conteúdo
  // fique encostado no final da tela.
  scrollContent: {
    paddingBottom: 40,
  },


  // ==========================================================
  // ESPAÇO DO TOPO
  // ==========================================================
  topSpacer: {
    height: Platform.OS === 'android' ? 48 : 60,
    backgroundColor: 'transparent',
  },


  // ==========================================================
  // IMAGEM PRINCIPAL
  // ==========================================================
  heroWrapper: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,

    // Sombra para dar destaque à imagem
    shadowColor: coresInstitucionaisFixas.sombra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,

    backgroundColor: 'transparent',
  },

  heroImage: {
    width: '100%',
    height: 240,
  },


  // ==========================================================
  // CORPO DA PÁGINA
  // ==========================================================
  body: {
    paddingHorizontal: 20,
    paddingTop: 0,
    gap: 0,
    backgroundColor: 'transparent',
  },


  // ==========================================================
  // TÍTULO
  // ==========================================================
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    backgroundColor: 'transparent',
  },

  // Barra azul ao lado do título
  titleBar: {
    width: 4,
    height: 32,
    borderRadius: 2,
    backgroundColor: coresInstitucionaisFixas.marca,
  },

  titulo: {
    fontSize: 28,
    fontWeight: '700',
  },


  // ==========================================================
  // SEÇÕES DE TEXTO
  // ==========================================================
  section: {
    marginBottom: 20,
    gap: 8,
    backgroundColor: 'transparent',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
  },

  paragraph: {
    fontSize: 15,
    lineHeight: 23,
    opacity: 0.85,
  },


  // ==========================================================
  // CAIXA DE DESTAQUE
  // ==========================================================
  highlightBox: {
    backgroundColor: coresInstitucionaisFixas.marca,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },

  highlightText: {
    color: coresInstitucionaisFixas.sobreMarca,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '500',
  },


  // ==========================================================
  // VALORES DA EMPRESA
  // ==========================================================
  valuesContainer: {
    marginBottom: 32,
    backgroundColor: 'transparent',
  },

  // Organiza os valores em linhas e permite quebra
  // quando não houver espaço suficiente na tela.
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: 'transparent',
  },

  // Card individual de cada valor
  valueItem: {
    flex: 1,
    minWidth: '40%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
    gap: 6,
  },

  // Ícone do valor
  valueIcon: {
    fontSize: 28,
  },

  // Nome do valor
  valueLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
