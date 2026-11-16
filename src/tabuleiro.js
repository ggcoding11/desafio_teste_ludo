const {
  ORDEM_DE_JOGO,
  TOTAL_DE_CASAS_DA_TRILHA,
  CASA_DE_SAIDA_POR_COR,
  CASAS_SEGURAS,
  POSICOES,
  DADO,
} = require('./constantes');
const { ErroDeRegra } = require('./erros');
const { validarInteiroNoIntervalo } = require('./validacoes');
const { validarValorDoDado } = require('./dado');

function validarCor(cor) {
  if (typeof cor !== 'string') {
    throw new TypeError('A cor precisa ser um texto');
  }
  if (!ORDEM_DE_JOGO.includes(cor)) {
    throw new RangeError(`A cor precisa ser uma destas: ${ORDEM_DE_JOGO.join(', ')}`);
  }
}

function validarPosicao(posicao) {
  validarInteiroNoIntervalo(posicao, POSICOES.BASE, POSICOES.CHEGADA, 'A posição da peça');
}

function estaNaTrilha(posicao) {
  validarPosicao(posicao);
  return posicao >= POSICOES.SAIDA && posicao <= POSICOES.ULTIMA_DA_TRILHA;
}

function calcularCasaDaTrilha(cor, posicao) {
  validarCor(cor);
  if (!estaNaTrilha(posicao)) {
    throw new RangeError(`A posição ${posicao} não fica na trilha comum`);
  }
  return (CASA_DE_SAIDA_POR_COR[cor] + posicao) % TOTAL_DE_CASAS_DA_TRILHA;
}

function ehCasaSegura(casaDaTrilha) {
  validarInteiroNoIntervalo(casaDaTrilha, 0, TOTAL_DE_CASAS_DA_TRILHA - 1, 'A casa da trilha');
  return CASAS_SEGURAS.includes(casaDaTrilha);
}

function encontrarImpedimentoDoMovimento(posicao, valorDoDado) {
  validarPosicao(posicao);
  validarValorDoDado(valorDoDado);
  if (posicao === POSICOES.CHEGADA) {
    return 'A peça já chegou e não pode mais se mover';
  }
  if (posicao === POSICOES.BASE) {
    return valorDoDado === DADO.VALOR_PARA_SAIR_DA_BASE
      ? null
      : `A peça só sai da base com ${DADO.VALOR_PARA_SAIR_DA_BASE}`;
  }
  if (posicao + valorDoDado > POSICOES.CHEGADA) {
    return 'A peça precisa do valor exato para chegar e não pode passar da chegada';
  }
  return null;
}

function podeMover(posicao, valorDoDado) {
  return encontrarImpedimentoDoMovimento(posicao, valorDoDado) === null;
}

function calcularDestino(posicao, valorDoDado) {
  const impedimento = encontrarImpedimentoDoMovimento(posicao, valorDoDado);
  if (impedimento !== null) {
    throw new ErroDeRegra(impedimento);
  }
  if (posicao === POSICOES.BASE) {
    return POSICOES.SAIDA;
  }
  return posicao + valorDoDado;
}

module.exports = {
  validarCor,
  validarPosicao,
  estaNaTrilha,
  calcularCasaDaTrilha,
  ehCasaSegura,
  podeMover,
  calcularDestino,
};
