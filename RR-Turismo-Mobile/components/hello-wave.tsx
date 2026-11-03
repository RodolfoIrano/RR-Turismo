// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ (SEM USO NO APP):
// Veio pronto do template do Expo, é um emoji de mão 👋 animado.
// Nenhuma tela do RR Turismo usa isso hoje.
// ============================================================
// ============================================================
// COMPONENTE DE EXEMPLO DO TEMPLATE EXPO - SEM USO NO APP
// ------------------------------------------------------------
// Nenhuma tela do RR Turismo usa este componente hoje (conferido:
// nada importa "HelloWave"). Veio pronto no template padrão do
// Expo Router como exemplo de animação.
// ============================================================
import Animated from 'react-native-reanimated';

export function HelloWave() {
  return (
    <Animated.Text
      style={{
        fontSize: 28,
        lineHeight: 32,
        marginTop: -6,
        // Gira a mão de -0° a 25° e volta, repetindo 4 vezes ao montar o componente.
        animationName: {
          '50%': { transform: [{ rotate: '25deg' }] },
        },
        animationIterationCount: 4,
        animationDuration: '300ms',
      }}>
      👋
    </Animated.Text>
  );
}
