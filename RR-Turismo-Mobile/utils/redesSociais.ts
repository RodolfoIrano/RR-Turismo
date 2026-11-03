// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Transforma o que o guia digitou no perfil do site (ex: "@maria",
// "11 99999-0000", "instagram.com/maria") num LINK que abre no
// celular (WhatsApp, Instagram, Facebook, X, site).
//
// ORIENTAÇÃO A OBJETOS: cada rede é uma classe que implementa a
// interface "RedeSocial" (mesmos métodos, comportamento próprio).
// Para suportar uma rede nova, basta criar mais uma classe.
// ============================================================

export interface RedeSocial {
  readonly chave: "whatsapp" | "instagram" | "facebook" | "twitter" | "site";
  readonly icone: string;       // nome do ícone (Ionicons)
  // Devolve o link pronto, ou null se o valor estiver vazio/inválido.
  montarLink(valor: string): string | null;
}

// Se o texto já é um link completo, usa como está.
function jaELink(valor: string): boolean {
  return /^https?:\/\//i.test(valor);
}

// Tira "@" e espaços de um nome de usuário.
function usuarioLimpo(valor: string): string {
  return valor.trim().replace(/^@/, "").replace(/\s+/g, "");
}

class WhatsApp implements RedeSocial {
  readonly chave = "whatsapp" as const;
  readonly icone = "logo-whatsapp";
  montarLink(valor: string): string | null {
    if (jaELink(valor)) return valor;
    let numero = valor.replace(/\D/g, "");
    if (numero.length < 8) return null;
    // Números brasileiros sem DDI (10 ou 11 dígitos) ganham o 55.
    if (numero.length <= 11) numero = `55${numero}`;
    return `https://wa.me/${numero}`;
  }
}

class Instagram implements RedeSocial {
  readonly chave = "instagram" as const;
  readonly icone = "logo-instagram";
  montarLink(valor: string): string | null {
    if (jaELink(valor)) return valor;
    const usuario = usuarioLimpo(valor.replace(/^.*instagram\.com\//i, ""));
    return usuario ? `https://instagram.com/${usuario}` : null;
  }
}

class Facebook implements RedeSocial {
  readonly chave = "facebook" as const;
  readonly icone = "logo-facebook";
  montarLink(valor: string): string | null {
    if (jaELink(valor)) return valor;
    const usuario = usuarioLimpo(valor.replace(/^.*facebook\.com\//i, ""));
    return usuario ? `https://facebook.com/${usuario}` : null;
  }
}

class Twitter implements RedeSocial {
  readonly chave = "twitter" as const;
  readonly icone = "logo-twitter";
  montarLink(valor: string): string | null {
    if (jaELink(valor)) return valor;
    const usuario = usuarioLimpo(valor.replace(/^.*(twitter|x)\.com\//i, ""));
    return usuario ? `https://x.com/${usuario}` : null;
  }
}

class SitePessoal implements RedeSocial {
  readonly chave = "site" as const;
  readonly icone = "globe-outline";
  montarLink(valor: string): string | null {
    const v = valor.trim();
    if (!v) return null;
    return jaELink(v) ? v : `https://${v}`;
  }
}

// Lista de todas as redes suportadas (a ordem é a ordem na tela).
export const REDES_SOCIAIS: RedeSocial[] = [
  new WhatsApp(),
  new Instagram(),
  new Facebook(),
  new Twitter(),
  new SitePessoal(),
];
