const {
  CORES,
  ORDEM_DE_JOGO,
  PECAS_POR_JOGADOR,
  TOTAL_DE_CASAS_DA_TRILHA,
  CASA_DE_SAIDA_POR_COR,
  CASAS_SEGURAS,
  POSICOES,
  DADO,
} = require('../src/constantes');

describe('constantes do jogo', () => {
  test.each([
    ['CORES', CORES],
    ['ORDEM_DE_JOGO', ORDEM_DE_JOGO],
    ['CASA_DE_SAIDA_POR_COR', CASA_DE_SAIDA_POR_COR],
    ['CASAS_SEGURAS', CASAS_SEGURAS],
    ['POSICOES', POSICOES],
    ['DADO', DADO],
  ])('%s está congelada e não pode ser alterada', (_nome, constante) => {
    expect(Object.isFrozen(constante)).toBe(true);
  });

  test('a partida é para dois jogadores e o vermelho joga primeiro', () => {
    expect(ORDEM_DE_JOGO).toEqual([CORES.VERMELHO, CORES.AMARELO]);
  });

  test('cada jogador tem quatro peças', () => {
    expect(PECAS_POR_JOGADOR).toBe(4);
  });

  test('os dois jogadores saem de lados opostos da trilha', () => {
    const distanciaEntreAsSaidas =
      CASA_DE_SAIDA_POR_COR[CORES.AMARELO] - CASA_DE_SAIDA_POR_COR[CORES.VERMELHO];

    expect(distanciaEntreAsSaidas).toBe(TOTAL_DE_CASAS_DA_TRILHA / 2);
  });

  test('as casas de saída das duas cores são casas seguras', () => {
    expect(CASAS_SEGURAS).toContain(CASA_DE_SAIDA_POR_COR[CORES.VERMELHO]);
    expect(CASAS_SEGURAS).toContain(CASA_DE_SAIDA_POR_COR[CORES.AMARELO]);
  });

  test('todas as casas seguras ficam dentro da trilha comum', () => {
    for (const casa of CASAS_SEGURAS) {
      expect(casa).toBeGreaterThanOrEqual(0);
      expect(casa).toBeLessThan(TOTAL_DE_CASAS_DA_TRILHA);
    }
  });

  test('a peça percorre 51 casas da trilha, 5 do corredor final e a chegada', () => {
    const casasNaTrilha = POSICOES.ULTIMA_DA_TRILHA - POSICOES.SAIDA + 1;
    const casasNoCorredor = POSICOES.CHEGADA - POSICOES.ULTIMA_DA_TRILHA - 1;

    expect(casasNaTrilha).toBe(TOTAL_DE_CASAS_DA_TRILHA - 1);
    expect(casasNoCorredor).toBe(5);
  });

  test('o dado tem seis faces e o seis tira da base e dá jogada extra', () => {
    expect(DADO.MAIOR_VALOR - DADO.MENOR_VALOR + 1).toBe(6);
    expect(DADO.VALOR_PARA_SAIR_DA_BASE).toBe(6);
    expect(DADO.VALOR_QUE_DA_JOGADA_EXTRA).toBe(6);
  });
});
