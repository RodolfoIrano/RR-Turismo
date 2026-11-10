// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Configura a BARRA DE ABAS lá embaixo (Início/Explorar/
// Carrinho/Perfil) - cores, ícones e nomes de cada aba.
//
// ✏️ ONDE MUDAR O QUÊ:
//   - Adicionar/remover uma aba ... um bloco <Tabs.Screen name="..."> por aba.
//     "name" é o nome do arquivo em app/(tabs)/. Com href: null a tela
//     existe, mas NÃO aparece na barra (é o caso de Favoritos).
//   - Ícone e nome de cada aba .... dentro de options → title / tabBarIcon
//   - Cor da barra e dos ícones ... screenOptions → tabBarStyle / tabBarActiveTintColor
// ============================================================
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { useCart } from "../../contexts/CartContext";
import { useTraducao } from "../../traducoes/TraducaoContext";

// ============================================================
// NAVEGAÇÃO INFERIOR (BOTTOM TABS)
// ------------------------------------------------------------
// Define as principais telas que aparecem na barra inferior:
// Início, Explorar, Carrinho e Perfil (Favoritos fica no cabeçalho).
//
// O Carrinho também possui um badge mostrando a quantidade
// de itens adicionados.
// ============================================================
export default function TabsLayout() {

  // Pega a quantidade total de itens do carrinho
  const { itemCount } = useCart();

  // Textos das abas de acordo com o idioma selecionado
  const { t, traduzir } = useTraducao();

  return (
    <Tabs
      screenOptions={{
        // Remove o cabeçalho padrão das telas
        headerShown: false,

        // Cor do ícone/texto da aba selecionada (branco, se destaca no fundo azul)
        tabBarActiveTintColor: colors.textInverse,

        // Cor das abas que não estão selecionadas (azul mais claro/acinzentado)
        tabBarInactiveTintColor: colors.primaryMuted,

        // Fundo azul institucional, igual ao cabeçalho e ao site.
        tabBarStyle: {
          backgroundColor: colors.primary,
          borderTopColor: colors.primaryDark,
        },
      }}
    >

      {/* ======================================================
          INÍCIO
          ====================================================== */}
      <Tabs.Screen
        name="index"
        options={{
          title: traduzir(t.abas.inicio),

          // Ícone de casa
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="home-outline"
              size={size}
              color={String(color)}
            />
          ),
        }}
      />


      {/* ======================================================
          EXPLORAR
          ====================================================== */}
      <Tabs.Screen
        name="explore"
        options={{
          title: traduzir(t.abas.explorar),

          // Ícone de pesquisa
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="search-outline"
              size={size}
              color={String(color)}
            />
          ),
        }}
      />


      {/* ======================================================
          FAVORITOS
          ------------------------------------------------------
          Não aparece mais na barra de baixo: o atalho (coração)
          fica no cabeçalho da tela Início. A tela de verdade agora
          é app/favoritos/index.tsx (telas escondidas com href: null
          não abrem por router.push); este item só esconde o arquivo
          antigo, que apenas redireciona para lá.
          ====================================================== */}
      <Tabs.Screen
        name="favorites"
        options={{
          href: null,
        }}
      />


      {/* ======================================================
          CARRINHO
          ====================================================== */}
      <Tabs.Screen
        name="cart"
        options={{
          title: traduzir(t.abas.carrinho),

          // Mostra a quantidade de itens no carrinho.
          // Se não houver itens, o badge não aparece.
          tabBarBadge: itemCount > 0 ? itemCount : undefined,

          // Ícone do carrinho
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="cart-outline"
              size={size}
              color={String(color)}
            />
          ),
        }}
      />


      {/* ======================================================
          PERFIL
          ====================================================== */}
      <Tabs.Screen
        name="profile"
        options={{
          title: traduzir(t.abas.perfil),

          // Ícone de usuário
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-outline"
              size={size}
              color={String(color)}
            />
          ),
        }}
      />


      {/* Atalhos antigos (só redirecionam para as telas novas
          Fale conosco e Sobre nós) - não aparecem na barra. */}
      <Tabs.Screen name="contato" options={{ href: null }} />
      <Tabs.Screen name="sobre" options={{ href: null }} />

    </Tabs>
  );
}
