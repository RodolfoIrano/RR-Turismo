// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Transforma uma posição do GPS (latitude/longitude) no ENDEREÇO
// em texto: "Rua das Flores, 123 — Centro, Taquaritinga".
// É o que permite ao guia saber em que RUA (e número) cada pessoa
// está. Usa o serviço gratuito Nominatim (OpenStreetMap), sem chave.
//
// ORIENTAÇÃO A OBJETOS: a classe guarda um CACHE (para não perguntar
// duas vezes o mesmo lugar) e uma FILA (o serviço gratuito pede no
// máximo ~1 consulta por segundo, então as consultas saem em fila).
// ============================================================

interface RespostaNominatim {
  display_name?: string;
  address?: {
    road?: string;
    pedestrian?: string;
    house_number?: string;
    suburb?: string;
    neighbourhood?: string;
    city_district?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
  };
}

export class EnderecoPorCoordenada {
  private readonly cache = new Map<string, string>();
  private fila: Promise<unknown> = Promise.resolve();
  private readonly esperaEntreConsultasMs = 1100;

  // Arredonda para ~11 m: quem só andou 2-3 m reaproveita o mesmo endereço.
  private chave(lat: number, lng: number): string {
    return `${lat.toFixed(4)},${lng.toFixed(4)}`;
  }

  // Endereço já conhecido (sem fazer consulta), ou undefined.
  conhecido(lat: number, lng: number): string | undefined {
    return this.cache.get(this.chave(lat, lng));
  }

  // Busca o endereço (usa o cache; senão entra na fila de consultas).
  buscar(lat: number, lng: number): Promise<string | null> {
    const chave = this.chave(lat, lng);
    const guardado = this.cache.get(chave);
    if (guardado) return Promise.resolve(guardado);

    const tarefa = this.fila.then(async () => {
      const outraVez = this.cache.get(chave); // outro pedido pode ter resolvido enquanto esperava
      if (outraVez) return outraVez;
      const texto = await this.consultar(lat, lng);
      await new Promise((r) => setTimeout(r, this.esperaEntreConsultasMs));
      if (texto) this.cache.set(chave, texto);
      return texto;
    });
    this.fila = tarefa.catch(() => null);
    return tarefa.catch(() => null);
  }

  private async consultar(lat: number, lng: number): Promise<string | null> {
    const controle = new AbortController();
    const timer = setTimeout(() => controle.abort(), 8000);
    try {
      // zoom=18 = nível de rua/número da casa.
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&accept-language=pt-BR&lat=${lat}&lon=${lng}`;
      const resposta = await fetch(url, {
        headers: { "User-Agent": "RRTurismo/1.0 (projeto academico)", Accept: "application/json" },
        signal: controle.signal,
      });
      if (!resposta.ok) return null;
      return EnderecoPorCoordenada.formatar((await resposta.json()) as RespostaNominatim);
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  // "Rua X, 123 — Bairro, Cidade" (só com as partes que existirem).
  private static formatar(r: RespostaNominatim): string | null {
    const a = r.address;
    if (!a) return r.display_name ?? null;
    const rua = a.road ?? a.pedestrian;
    const ruaComNumero = rua ? (a.house_number ? `${rua}, ${a.house_number}` : rua) : null;
    const bairro = a.suburb ?? a.neighbourhood ?? a.city_district;
    const cidade = a.city ?? a.town ?? a.village ?? a.municipality;
    const resto = [bairro, cidade].filter(Boolean).join(", ");
    if (ruaComNumero && resto) return `${ruaComNumero} — ${resto}`;
    return ruaComNumero ?? (resto || r.display_name || null);
  }
}

// Uma instância só para o app inteiro (assim o cache e a fila são compartilhados).
export const enderecos = new EnderecoPorCoordenada();
