// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Gera os códigos de TESTE usados na tela de pagamento do app:
//   - Pix "copia e cola" (formato BR Code do Banco Central, com o
//     dígito verificador CRC16) - é o texto que vira o QR Code;
//   - linha digitável de boleto (só números, sem valor bancário).
// Nada aqui cobra de verdade: a chave é falsa de propósito.
//
// ✏️ ONDE MUDAR O QUÊ:
//   - Identificação do recebedor de teste ... constantes logo abaixo
//   - Dias para o boleto vencer .............. DIAS_BOLETO
// ============================================================
const CHAVE_PIX_TESTE = "TESTE-NAO-PAGAR";
const NOME_RECEBEDOR = "RR TURISMO TESTE";
const CIDADE_RECEBEDOR = "TAQUARITINGA";
export const DIAS_BOLETO = 3;

// Monta um campo "id + tamanho (2 dígitos) + valor".
function tlv(id: string, valor: string): string {
  return id + String(valor.length).padStart(2, "0") + valor;
}

// CRC16-CCITT (polinômio 0x1021, início 0xFFFF): exigido pelo Pix.
export function crc16(texto: string): string {
  let crc = 0xffff;
  for (let i = 0; i < texto.length; i++) {
    crc ^= texto.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function gerarPixCopiaECola(valor: number): string {
  const conta = tlv("00", "br.gov.bcb.pix") + tlv("01", CHAVE_PIX_TESTE);
  const corpo =
    tlv("00", "01") +
    tlv("26", conta) +
    tlv("52", "0000") +
    tlv("53", "986") +
    tlv("54", valor.toFixed(2)) +
    tlv("58", "BR") +
    tlv("59", NOME_RECEBEDOR) +
    tlv("60", CIDADE_RECEBEDOR) +
    tlv("62", tlv("05", "RRTESTE")) +
    "6304";
  return corpo + crc16(corpo);
}

function digitosAleatorios(qtd: number): string {
  let s = "";
  for (let i = 0; i < qtd; i++) s += Math.floor(Math.random() * 10);
  return s;
}

export function gerarLinhaDigitavelBoleto(valor: number): string {
  const centavos = String(Math.round(valor * 100)).padStart(10, "0");
  return (
    `${digitosAleatorios(5)}.${digitosAleatorios(5)} ` +
    `${digitosAleatorios(5)}.${digitosAleatorios(6)} ` +
    `${digitosAleatorios(5)}.${digitosAleatorios(6)} ` +
    `${digitosAleatorios(1)} ${digitosAleatorios(4)}${centavos}`
  );
}

export function vencimentoDoBoleto(): string {
  const d = new Date();
  d.setDate(d.getDate() + DIAS_BOLETO);
  return d.toLocaleDateString("pt-BR");
}
