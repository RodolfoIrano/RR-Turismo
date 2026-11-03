// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Classe que concentra a REGRA DE SENHA do app. A única regra é o
// TAMANHO MÍNIMO de 8 caracteres (igual ao Web/Spring): sem exigir
// letra, número ou símbolo. Para mudar, altere SO o número abaixo.
// ============================================================

export class ValidadorDeSenha {
  // Tamanho mínimo (igual ao do Web).
  static readonly TAMANHO_MINIMO = 8;

  // Texto curto para mostrar abaixo do campo de senha.
  static readonly DICA = `Mínimo de ${ValidadorDeSenha.TAMANHO_MINIMO} caracteres`;

  // Devolve a mensagem de erro, ou null se a senha estiver válida.
  // (nome e email ficam como parâmetros opcionais só por compatibilidade)
  static validar(senha: string, _nome?: string, _email?: string): string | null {
    if (senha.length < ValidadorDeSenha.TAMANHO_MINIMO) {
      return `A senha deve ter ao menos ${ValidadorDeSenha.TAMANHO_MINIMO} caracteres.`;
    }
    return null;
  }
}
