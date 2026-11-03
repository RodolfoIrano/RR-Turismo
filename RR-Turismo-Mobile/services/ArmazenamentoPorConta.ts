// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Guarda listas no celular SEPARADAS POR CONTA. Cada usuário tem a
// sua própria "gaveta": o carrinho, os favoritos e as reservas de
// uma conta nunca aparecem em outra.
//
// Quem NÃO está logado usa a gaveta "visitante". Quando a pessoa
// faz login, o que ela juntou como visitante (ex: itens no carrinho
// antes de logar para comprar) é passado para a gaveta da conta.
//
// Exemplo de chave gravada:  @rr_turismo:carrinho:12   (usuário 12)
//                            @rr_turismo:carrinho:visitante
// ============================================================
import AsyncStorage from "@react-native-async-storage/async-storage";

// "Dono" dos dados quando ninguém está logado.
export const VISITANTE = "visitante";

export class ArmazenamentoPorConta<T> {
  constructor(private readonly nome: string) {}

  private chave(dono: string): string {
    return `@rr_turismo:${this.nome}:${dono}`;
  }

  async ler(dono: string): Promise<T[]> {
    try {
      const bruto = await AsyncStorage.getItem(this.chave(dono));
      return bruto ? (JSON.parse(bruto) as T[]) : [];
    } catch {
      return [];
    }
  }

  async gravar(dono: string, lista: T[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.chave(dono), JSON.stringify(lista));
    } catch {
      // sem espaço/permissão: o app continua funcionando só em memória
    }
  }

  async apagar(dono: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.chave(dono));
    } catch {
      // ignora
    }
  }
}

// Remove as chaves da versão antiga (que eram compartilhadas entre
// todas as contas). Roda uma vez ao abrir o app e é inofensivo depois.
export async function apagarChavesAntigas(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      "@rr_turismo:cart",
      "@rr_turismo:favorites",
      "@rr_turismo:bookings",
    ]);
  } catch {
    // ignora
  }
}
