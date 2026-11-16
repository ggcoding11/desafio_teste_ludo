const { lancarDado, validarValorDoDado } = require('../src/dado');
const {
  GERADOR_QUE_SEMPRE_TIRA_UM,
  GERADOR_QUE_SEMPRE_TIRA_SEIS,
  criarGeradorEmSequencia,
} = require('./helpers/geradores');

describe('lancarDado', () => {
  test.each([
    [0, 1],
    [0.16, 1],
    [1 / 6, 2],
    [0.34, 3],
    [0.5, 4],
    [0.67, 5],
    [0.84, 6],
    [0.9999999999999999, 6],
  ])('o número aleatório %p vira a face %p', (numeroAleatorio, faceEsperada) => {
    expect(lancarDado(() => numeroAleatorio)).toBe(faceEsperada);
  });

  test('o gerador que sempre tira um sempre dá a face 1', () => {
    expect(lancarDado(GERADOR_QUE_SEMPRE_TIRA_UM)).toBe(1);
  });

  test('o gerador que sempre tira seis sempre dá a face 6', () => {
    expect(lancarDado(GERADOR_QUE_SEMPRE_TIRA_SEIS)).toBe(6);
  });

  test('o mesmo gerador em sequência reproduz os mesmos lançamentos', () => {
    const numeros = [0.1, 0.5, 0.99, 0.3];
    const primeiroGerador = criarGeradorEmSequencia(...numeros);
    const segundoGerador = criarGeradorEmSequencia(...numeros);

    const primeirosLancamentos = numeros.map(() => lancarDado(primeiroGerador));
    const segundosLancamentos = numeros.map(() => lancarDado(segundoGerador));

    expect(primeirosLancamentos).toEqual([1, 4, 6, 2]);
    expect(segundosLancamentos).toEqual(primeirosLancamentos);
  });

  test('chama o gerador injetado exatamente uma vez por lançamento, sem argumentos', () => {
    const gerador = jest.fn(GERADOR_QUE_SEMPRE_TIRA_UM);

    lancarDado(gerador);

    expect(gerador).toHaveBeenCalledTimes(1);
    expect(gerador).toHaveBeenCalledWith();
  });

  test('sem injeção, usa Math.random e sempre devolve uma face inteira entre 1 e 6', () => {
    for (let lancamento = 0; lancamento < 1000; lancamento += 1) {
      const face = lancarDado();
      expect(Number.isInteger(face)).toBe(true);
      expect(face).toBeGreaterThanOrEqual(1);
      expect(face).toBeLessThanOrEqual(6);
    }
  });

  test.each([
    ['um número', 0.5],
    ['um texto', 'Math.random'],
    ['nulo', null],
  ])('recusa gerador que é %s com TypeError', (_descricao, gerador) => {
    expect(() => lancarDado(gerador)).toThrow(
      new TypeError('O gerador de números aleatórios precisa ser uma função'),
    );
  });

  test.each([
    ['um texto', '0.5'],
    ['indefinido', undefined],
  ])('recusa gerador que devolve %s com TypeError', (_descricao, numeroDevolvido) => {
    expect(() => lancarDado(() => numeroDevolvido)).toThrow(
      new TypeError('O gerador de números aleatórios precisa devolver um número'),
    );
  });

  test.each([
    ['exatamente 1', 1],
    ['maior que 1', 1.5],
    ['negativo', -0.1],
    ['NaN', NaN],
  ])('recusa gerador que devolve número %s com RangeError', (_descricao, numeroDevolvido) => {
    expect(() => lancarDado(() => numeroDevolvido)).toThrow(
      new RangeError('O gerador de números aleatórios precisa devolver um número em [0, 1)'),
    );
  });
});

describe('validarValorDoDado', () => {
  test.each([1, 2, 3, 4, 5, 6])('aceita a face %p', (valor) => {
    expect(() => validarValorDoDado(valor)).not.toThrow();
  });

  test('recusa valor não inteiro com TypeError', () => {
    expect(() => validarValorDoDado(3.5)).toThrow(
      new TypeError('O valor do dado precisa ser um número inteiro'),
    );
  });

  test.each([0, 7])('recusa a face inexistente %p com RangeError', (valor) => {
    expect(() => validarValorDoDado(valor)).toThrow(
      new RangeError('O valor do dado precisa estar entre 1 e 6'),
    );
  });
});
