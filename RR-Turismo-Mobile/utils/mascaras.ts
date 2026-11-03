// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// MÁSCARAS de digitação (CPF, CNPJ, telefone, validade do cartão,
// CVV, CEP) e VALIDADORES de CPF/CNPJ. A máscara vai formatando
// enquanto a pessoa digita e CORTA os números que passam do
// tamanho certo - não dá para digitar dígito a mais.
//
// Como usar num campo:
//   <Input value={cpf} onChangeText={(v) => setCpf(Mascara.cpf(v))} />
//
// Os dígitos "puros" (sem pontos/traços) saem de Mascara.digitos().
// ============================================================

export class Mascara {
  // Só os números do texto.  "123.456" -> "123456"
  static digitos(texto: string): string {
    return texto.replace(/\D/g, "");
  }

  // CPF: 000.000.000-00 (11 dígitos)
  static cpf(texto: string): string {
    const d = Mascara.digitos(texto).slice(0, 11);
    return d
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }

  // CNPJ: 00.000.000/0000-00 (14 dígitos)
  static cnpj(texto: string): string {
    const d = Mascara.digitos(texto).slice(0, 14);
    return d
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  // Telefone brasileiro: (00) 0000-0000 (fixo) ou (00) 00000-0000 (celular).
  static telefone(texto: string): string {
    const d = Mascara.digitos(texto).slice(0, 11);
    if (d.length === 0) return "";
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  // CEP: 00000-000
  static cep(texto: string): string {
    const d = Mascara.digitos(texto).slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  }

  // Validade do cartão: MM/AA (o mês só pode ir de 01 a 12).
  static validade(texto: string): string {
    let d = Mascara.digitos(texto).slice(0, 4);
    if (d.length >= 1 && Number(d[0]) > 1) d = "0" + d; // "5" -> "05"
    if (d.length >= 2 && Number(d.slice(0, 2)) > 12) d = "12" + d.slice(2);
    if (d.length >= 2 && Number(d.slice(0, 2)) === 0) d = "01" + d.slice(2);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  }

  // CVV: 3 ou 4 dígitos.
  static cvv(texto: string): string {
    return Mascara.digitos(texto).slice(0, 4);
  }
}

// ------------------------------------------------------------
// VALIDADORES (conferem os dígitos verificadores de verdade)
// ------------------------------------------------------------
function todosIguais(d: string): boolean {
  return /^(\d)\1+$/.test(d);
}

export class Documento {
  // CPF válido? (rejeita 111.111.111-11 etc. e confere os 2 dígitos finais)
  static cpfValido(texto: string): boolean {
    const d = Mascara.digitos(texto);
    if (d.length !== 11 || todosIguais(d)) return false;
    for (const tamanho of [9, 10]) {
      let soma = 0;
      for (let i = 0; i < tamanho; i++) soma += Number(d[i]) * (tamanho + 1 - i);
      const digito = ((soma * 10) % 11) % 10;
      if (digito !== Number(d[tamanho])) return false;
    }
    return true;
  }

  // CNPJ válido?
  static cnpjValido(texto: string): boolean {
    const d = Mascara.digitos(texto);
    if (d.length !== 14 || todosIguais(d)) return false;
    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const pesos2 = [6, ...pesos1];
    const calcular = (pesos: number[]) => {
      const soma = pesos.reduce((acc, p, i) => acc + Number(d[i]) * p, 0);
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };
    return calcular(pesos1) === Number(d[12]) && calcular(pesos2) === Number(d[13]);
  }

  // Telefone com DDD: 10 (fixo) ou 11 (celular) dígitos.
  static telefoneValido(texto: string): boolean {
    const d = Mascara.digitos(texto);
    return (d.length === 10 || d.length === 11) && Number(d.slice(0, 2)) >= 11;
  }
}
