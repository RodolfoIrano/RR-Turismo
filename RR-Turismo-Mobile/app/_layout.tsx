// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// É o "esqueleto" de todo o app: registra todas as telas que
// existem, e envolve tudo com os Providers (login, carrinho,
// favoritos, catálogo de viagens, idioma). Praticamente tudo
// passa por aqui primeiro quando o app abre.
// ============================================================
import { View } from "react-native";
import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { FavoritesProvider } from "../contexts/FavoritesContext";
import { CartProvider } from "../contexts/CartContext";
import { CatalogoProvider } from "../contexts/CatalogoContext";
import { TraducaoProvider, useTraducao } from "../traducoes/TraducaoContext";
import AssistenteFlutuante from "../components/chat/AssistenteFlutuante";

// ============================================================
// LAYOUT RAIZ
// ------------------------------------------------------------
// Define a estrutura principal de navegação do aplicativo.
// Aqui ficam registrados os principais grupos e telas do Expo
// Router, além dos Providers responsáveis pelos estados globais.
// ============================================================
// Âncora do Expo Router: a PRIMEIRA tela do app é sempre a Home (abas).
// Login e cadastro só abrem quando o usuário precisar (ex: finalizar compra).
export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  return (
    // Provider responsável pelo idioma do app (item 2 da solicitação).
    // Fica no nível mais externo para que qualquer tela, inclusive
    // as de autenticação, já tenha acesso à tradução.
    <TraducaoProvider>

    {/* Provider responsável pelo estado de autenticação do usuário.
        Permite acessar login, usuário atual e logout em qualquer tela. */}
    <AuthProvider>

      {/* Provider que carrega as viagens e guias REAIS do backend
          (cadastrados no site) e deixa disponíveis para todo o app. */}
      <CatalogoProvider>

      {/* Provider responsável pelo gerenciamento dos favoritos.
          Mantém as viagens favoritas disponíveis para todo o aplicativo. */}
      <FavoritesProvider>

        {/* Provider responsável pelo carrinho de compras.
            Permite adicionar, remover e consultar viagens no carrinho. */}
        <CartProvider>

          {/* 
            Stack principal de navegação do aplicativo.
            O header fica oculto por padrão e é ativado individualmente
            nas telas que precisam exibir uma barra de navegação.
          */}
          <View style={{ flex: 1 }}>
            <PilhaDeTelas />

            {/* Bolinha flutuante do assistente de ajuda (logo do RR Turismo).
                Aparece por cima de todas as telas, menos login/cadastro. */}
            <AssistenteFlutuante />
          </View>
        </CartProvider>
      </FavoritesProvider>
      </CatalogoProvider>
    </AuthProvider>

    </TraducaoProvider>
  );
}

// ============================================================
// PILHA DE TELAS
// ------------------------------------------------------------
// Fica num componente à parte para poder usar o tradutor: os
// títulos do cabeçalho (ex: "Minhas reservas") são textos nativos
// da navegação e precisam ser traduzidos "na mão" com traduzir().
// ============================================================
function PilhaDeTelas() {
  const { traduzir } = useTraducao();
  return (
    <Stack screenOptions={{ headerShown: false }}>

            {/* 
              Grupo principal do aplicativo.
              Contém as telas organizadas pelas abas de navegação.
            */}
            <Stack.Screen name="(tabs)" />

            {/* 
              Grupo de telas relacionadas à autenticação,
              como login e cadastro.
            */}
            <Stack.Screen name="(auth)" />


            {/* 
              Tela de detalhes de uma viagem.
              O [id] é um parâmetro dinâmico utilizado para
              identificar qual viagem será exibida.
            */}
            <Stack.Screen
              name="trip/[id]"
              options={{
                headerShown: true,
                title: "",
              }}
            />

            {/* 
              Tela de perfil de um guia.
              O [id] identifica dinamicamente o guia selecionado.
            */}
            <Stack.Screen
              name="guide/[id]"
              options={{
                headerShown: true,
                title: "Perfil do guia",
              }}
            />

            {/* 
              Tela de checkout/pagamento.
              Exibe o resumo da reserva e os dados necessários
              para finalizar a compra simulada.
            */}
            <Stack.Screen
              name="checkout/index"
              options={{
                headerShown: true,
                title: "Pagamento",
              }}
            />

            {/* 
              Tela exibida após a conclusão bem-sucedida da reserva.
              O header fica oculto para apresentar uma tela de
              confirmação mais limpa.
            */}
            <Stack.Screen
              name="booking/success"
              options={{
                headerShown: false,
              }}
            />

            {/* 
              Tela que apresenta as reservas realizadas pelo usuário.
            */}
            <Stack.Screen
              name="bookings/index"
              options={{
                headerShown: true,
                title: traduzir("Minhas reservas"),
              }}
            />

            {/*
              Tela nova de configurações (item 2 da solicitação):
              permite trocar o idioma do app manualmente.
            */}
            {/* Viagem ao vivo: cliente (minha-viagem) e guia (modo-guia). */}
            <Stack.Screen name="tradutor/index" options={{ headerShown: true, title: "" }} />
            <Stack.Screen name="minha-viagem/[id]" options={{ headerShown: true, title: "" }} />
            <Stack.Screen name="modo-guia/index" options={{ headerShown: true, title: "" }} />
            <Stack.Screen name="modo-guia/[id]" options={{ headerShown: true, title: "" }} />

            <Stack.Screen
              name="settings/index"
              options={{
                headerShown: true,
                title: traduzir("Configurações"),
              }}
            />
            <Stack.Screen name="settings/idioma" options={{ headerShown: true, title: traduzir("Idioma") }} />
            <Stack.Screen name="settings/editar-perfil" options={{ headerShown: true, title: traduzir("Editar perfil") }} />
            <Stack.Screen name="ajuda/index" options={{ headerShown: true, title: traduzir("Assistente de ajuda") }} />
            <Stack.Screen name="favoritos/index" options={{ headerShown: false }} />
            <Stack.Screen name="fale-conosco/index" options={{ headerShown: true, title: traduzir("Fale conosco") }} />
            <Stack.Screen name="sobre-nos/index" options={{ headerShown: true, title: traduzir("Sobre nós") }} />
    </Stack>
  );
}
