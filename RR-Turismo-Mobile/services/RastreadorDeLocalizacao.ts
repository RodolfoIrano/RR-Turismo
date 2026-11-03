// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Classe que cuida de pegar a localização do celular e enviar ao
// servidor DE TEMPOS EM TEMPOS (padrão: a cada 5 s, com GPS de alta precisão), para não
// pesar na bateria nem na rede. Só roda enquanto o app está
// aberto (em Expo Go não existe localização em segundo plano).
//
// ORIENTAÇÃO A OBJETOS: a classe guarda o estado (está rodando?)
// e expõe dois métodos simples: iniciar() e parar(). Quem usa não
// precisa saber como o expo-location funciona por dentro.
// ============================================================
import * as Location from "expo-location";

type AoReceberPosicao = (lat: number, lng: number) => void | Promise<void>;

export class RastreadorDeLocalizacao {
  private assinatura: Location.LocationSubscription | null = null;

  constructor(
    private readonly aoReceberPosicao: AoReceberPosicao,
    private readonly intervaloMs: number = 5_000,
  ) {}

  get rodando(): boolean {
    return this.assinatura !== null;
  }

  // Pede permissão (se precisar) e começa. Devolve false se negada.
  async iniciar(): Promise<boolean> {
    if (this.assinatura) return true;

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return false;

    // Envia a posição atual NA HORA (sem esperar o primeiro intervalo),
    // para o ponto aparecer logo no mapa/radar do guia.
    try {
      const agora = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      Promise.resolve(this.aoReceberPosicao(agora.coords.latitude, agora.coords.longitude)).catch(() => {});
    } catch {
      // GPS ainda sem sinal: o watchPositionAsync abaixo tenta de novo
    }

    this.assinatura = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High, // alta precisão: dá para saber a RUA (e a casa)
        timeInterval: this.intervaloMs,
        distanceInterval: 0,
      },
      (posicao) => {
        // Erros de rede ao enviar não derrubam o rastreador.
        Promise.resolve(this.aoReceberPosicao(posicao.coords.latitude, posicao.coords.longitude)).catch(() => {});
      },
    );
    return true;
  }

  parar(): void {
    this.assinatura?.remove();
    this.assinatura = null;
  }
}
