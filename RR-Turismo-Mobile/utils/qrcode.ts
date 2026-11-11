// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Transforma um texto em uma "matriz" de quadradinhos (true = preto)
// para desenhar o QR Code do Pix. Usa a biblioteca qrcodeGerador.js
// (qrcode-generator, licença MIT) que já está dentro do projeto,
// então não precisa instalar nada.
// ============================================================
type Qr = {
  addData: (texto: string) => void;
  make: () => void;
  getModuleCount: () => number;
  isDark: (linha: number, coluna: number) => boolean;
};

const criarQr: (tipo: number, nivelDeCorrecao: string) => Qr = require("./qrcodeGerador.js");

export function gerarMatrizQr(texto: string): boolean[][] {
  const qr = criarQr(0, "M");
  qr.addData(texto);
  qr.make();
  const total = qr.getModuleCount();
  const matriz: boolean[][] = [];
  for (let l = 0; l < total; l++) {
    const linha: boolean[] = [];
    for (let c = 0; c < total; c++) linha.push(qr.isDark(l, c));
    matriz.push(linha);
  }
  return matriz;
}
