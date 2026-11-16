const CORES = Object.freeze({
  VERMELHO: 'vermelho',
  AMARELO: 'amarelo',
});

const ORDEM_DE_JOGO = Object.freeze([CORES.VERMELHO, CORES.AMARELO]);

const PECAS_POR_JOGADOR = 4;

const TOTAL_DE_CASAS_DA_TRILHA = 52;

const CASA_DE_SAIDA_POR_COR = Object.freeze({
  [CORES.VERMELHO]: 0,
  [CORES.AMARELO]: 26,
});

const CASAS_SEGURAS = Object.freeze([0, 8, 13, 21, 26, 34, 39, 47]);

const POSICOES = Object.freeze({
  BASE: -1,
  SAIDA: 0,
  ULTIMA_DA_TRILHA: 50,
  CHEGADA: 56,
});

const DADO = Object.freeze({
  MENOR_VALOR: 1,
  MAIOR_VALOR: 6,
  VALOR_PARA_SAIR_DA_BASE: 6,
  VALOR_QUE_DA_JOGADA_EXTRA: 6,
});

module.exports = {
  CORES,
  ORDEM_DE_JOGO,
  PECAS_POR_JOGADOR,
  TOTAL_DE_CASAS_DA_TRILHA,
  CASA_DE_SAIDA_POR_COR,
  CASAS_SEGURAS,
  POSICOES,
  DADO,
};
