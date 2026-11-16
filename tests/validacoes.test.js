const { validarInteiroNoIntervalo } = require('../src/validacoes');

describe('validarInteiroNoIntervalo', () => {
  test.each([1, 3, 6])('aceita %p, que é inteiro e está entre 1 e 6', (numero) => {
    expect(() => validarInteiroNoIntervalo(numero, 1, 6, 'O valor')).not.toThrow();
  });

  test.each([
    ['texto', '3'],
    ['número quebrado', 2.5],
    ['NaN', NaN],
    ['infinito', Infinity],
    ['nulo', null],
    ['indefinido', undefined],
  ])('recusa %s com TypeError', (_descricao, numero) => {
    expect(() => validarInteiroNoIntervalo(numero, 1, 6, 'O valor')).toThrow(
      new TypeError('O valor precisa ser um número inteiro'),
    );
  });

  test.each([
    ['abaixo do mínimo', 0],
    ['acima do máximo', 7],
    ['negativo', -1],
  ])('recusa número %s com RangeError', (_descricao, numero) => {
    expect(() => validarInteiroNoIntervalo(numero, 1, 6, 'O valor')).toThrow(
      new RangeError('O valor precisa estar entre 1 e 6'),
    );
  });
});
