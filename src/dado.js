const { DADO } = require('./constantes');
const { validarInteiroNoIntervalo } = require('./validacoes');

const QUANTIDADE_DE_FACES = DADO.MAIOR_VALOR - DADO.MENOR_VALOR + 1;

function validarValorDoDado(valor) {
  validarInteiroNoIntervalo(valor, DADO.MENOR_VALOR, DADO.MAIOR_VALOR, 'O valor do dado');
}

function validarNumeroAleatorio(numeroAleatorio) {
  if (typeof numeroAleatorio !== 'number') {
    throw new TypeError('O gerador de números aleatórios precisa devolver um número');
  }
  const estaNoIntervalo = numeroAleatorio >= 0 && numeroAleatorio < 1;
  if (!estaNoIntervalo) {
    throw new RangeError('O gerador de números aleatórios precisa devolver um número em [0, 1)');
  }
}

function lancarDado(gerarNumeroAleatorio = Math.random) {
  if (typeof gerarNumeroAleatorio !== 'function') {
    throw new TypeError('O gerador de números aleatórios precisa ser uma função');
  }
  const numeroAleatorio = gerarNumeroAleatorio();
  validarNumeroAleatorio(numeroAleatorio);
  return Math.floor(numeroAleatorio * QUANTIDADE_DE_FACES) + DADO.MENOR_VALOR;
}

module.exports = { lancarDado, validarValorDoDado };
