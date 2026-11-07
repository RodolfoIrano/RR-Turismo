import { Stack } from "expo-router";

// Layout do grupo de autenticação: Login e Cadastro sem header,
// já que cada tela cuida da própria identidade visual.
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
