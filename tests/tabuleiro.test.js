const {
  validarCor,
  validarPosicao,
  estaNaTrilha,
  calcularCasaDaTrilha,
  ehCasaSegura,
  podeMover,
  calcularDestino,
} = require('../src/tabuleiro');
const { CORES, POSICOES } = require('../src/constantes');
const { ErroDeRegra } = require('../src/erros');

const { BASE, SAIDA, ULTIMA_DA_TRILHA, CHEGADA } = POSICOES;

describe('validarCor', () => {
  test.each([CORES.VERMELHO, CORES.AMARELO])('aceita a cor %p', (cor) => {
    expect(() => validarCor(cor)).not.toThrow();
  });

  test.each([undefined, 1, null])('recusa %p, que não é texto, com TypeError', (cor) => {
    expect(() => validarCor(cor)).toThrow(new TypeError('A cor precisa ser um texto'));
  });

  test.each(['verde', 'azul', 'VERMELHO', ''])(
    'recusa %p, que não joga nesta partida, com RangeError',
    (cor) => {
      expect(() => validarCor(cor)).toThrow(
        new RangeError('A cor precisa ser uma destas: vermelho, amarelo'),
      );
    },
  );
});

describe('validarPosicao', () => {
  test.each([BASE, SAIDA, ULTIMA_DA_TRILHA, 53, CHEGADA])('aceita a posição %p', (posicao) => {
    expect(() => validarPosicao(posicao)).not.toThrow();
  });

  test('recusa posição não inteira com TypeError', () => {
    expect(() => validarPosicao(1.5)).toThrow(
      new TypeError('A posição da peça precisa ser um número inteiro'),
    );
  });

  test.each([-2, 57])('recusa a posição %p, fora do caminho da peça, com RangeError', (posicao) => {
    expect(() => validarPosicao(posicao)).toThrow(
      new RangeError('A posição da peça precisa estar entre -1 e 56'),
    );
  });
});

describe('estaNaTrilha', () => {
  test.each([
    ['a base', BASE, false],
    ['a casa de saída', SAIDA, true],
    ['a última casa da trilha', ULTIMA_DA_TRILHA, true],
    ['a primeira casa do corredor final', ULTIMA_DA_TRILHA + 1, false],
    ['a chegada', CHEGADA, false],
  ])('%s (posição %p) está na trilha comum? %p', (_descricao, posicao, esperado) => {
    expect(estaNaTrilha(posicao)).toBe(esperado);
  });

  test('recusa posição inválida', () => {
    expect(() => estaNaTrilha(99)).toThrow(RangeError);
  });
});

describe('calcularCasaDaTrilha', () => {
  test.each([
    [CORES.VERMELHO, SAIDA, 0],
    [CORES.VERMELHO, 25, 25],
    [CORES.VERMELHO, ULTIMA_DA_TRILHA, 50],
    [CORES.AMARELO, SAIDA, 26],
    [CORES.AMARELO, 25, 51],
    [CORES.AMARELO, 26, 0],
    [CORES.AMARELO, ULTIMA_DA_TRILHA, 24],
  ])('a peça %s na posição %p ocupa a casa %p da trilha', (cor, posicao, casaEsperada) => {
    expect(calcularCasaDaTrilha(cor, posicao)).toBe(casaEsperada);
  });

  test('a peça amarela dá a volta pelo fim da trilha e nunca passa pela casa anterior à própria saída', () => {
    const casasPercorridas = [];
    for (let posicao = SAIDA; posicao <= ULTIMA_DA_TRILHA; posicao += 1) {
      casasPercorridas.push(calcularCasaDaTrilha(CORES.AMARELO, posicao));
    }

    expect(new Set(casasPercorridas).size).toBe(51);
    expect(casasPercorridas).not.toContain(25);
  });

  test.each([
    ['na base', BASE],
    ['no corredor final', 51],
    ['na chegada', CHEGADA],
  ])('recusa peça %s, que não está na trilha comum, com RangeError', (_descricao, posicao) => {
    expect(() => calcularCasaDaTrilha(CORES.VERMELHO, posicao)).toThrow(
      new RangeError(`A posição ${posicao} não fica na trilha comum`),
    );
  });

  test('valida a cor antes da posição', () => {
    expect(() => calcularCasaDaTrilha('verde', BASE)).toThrow(RangeError);
    expect(() => calcularCasaDaTrilha(undefined, SAIDA)).toThrow(TypeError);
  });
});

describe('ehCasaSegura', () => {
  test.each([0, 8, 13, 21, 26, 34, 39, 47])('a casa %p é segura', (casa) => {
    expect(ehCasaSegura(casa)).toBe(true);
  });

  test.each([1, 4, 25, 51])('a casa %p não é segura', (casa) => {
    expect(ehCasaSegura(casa)).toBe(false);
  });

  test('recusa casa não inteira com TypeError', () => {
    expect(() => ehCasaSegura('8')).toThrow(
      new TypeError('A casa da trilha precisa ser um número inteiro'),
    );
  });

  test.each([-1, 52])('recusa a casa %p, fora da trilha, com RangeError', (casa) => {
    expect(() => ehCasaSegura(casa)).toThrow(
      new RangeError('A casa da trilha precisa estar entre 0 e 51'),
    );
  });
});

describe('calcularDestino e podeMover', () => {
  test.each([
    ['sai da base com 6 para a casa de saída', BASE, 6, SAIDA],
    ['anda na trilha', 10, 4, 14],
    ['entra no corredor final', ULTIMA_DA_TRILHA, 3, 53],
    ['chega com o valor exato', 50, 6, CHEGADA],
    ['chega a partir do corredor', 55, 1, CHEGADA],
  ])('a peça %s', (_descricao, posicao, valorDoDado, destinoEsperado) => {
    expect(podeMover(posicao, valorDoDado)).toBe(true);
    expect(calcularDestino(posicao, valorDoDado)).toBe(destinoEsperado);
  });

  test.each([1, 2, 3, 4, 5])('a peça na base não sai com %p', (valorDoDado) => {
    expect(podeMover(BASE, valorDoDado)).toBe(false);
    expect(() => calcularDestino(BASE, valorDoDado)).toThrow(
      new ErroDeRegra('A peça só sai da base com 6'),
    );
  });

  test.each([
    [52, 5],
    [55, 2],
    [55, 6],
  ])('a peça na posição %p não pode passar da chegada com %p', (posicao, valorDoDado) => {
    expect(podeMover(posicao, valorDoDado)).toBe(false);
    expect(() => calcularDestino(posicao, valorDoDado)).toThrow(
      new ErroDeRegra('A peça precisa do valor exato para chegar e não pode passar da chegada'),
    );
  });

  test.each([1, 6])('a peça que já chegou não se move com %p', (valorDoDado) => {
    expect(podeMover(CHEGADA, valorDoDado)).toBe(false);
    expect(() => calcularDestino(CHEGADA, valorDoDado)).toThrow(
      new ErroDeRegra('A peça já chegou e não pode mais se mover'),
    );
  });

  test('valida os argumentos antes de aplicar as regras', () => {
    expect(() => podeMover(57, 6)).toThrow(RangeError);
    expect(() => calcularDestino(BASE, 0)).toThrow(RangeError);
    expect(() => calcularDestino(BASE, 6.5)).toThrow(TypeError);
  });
});
