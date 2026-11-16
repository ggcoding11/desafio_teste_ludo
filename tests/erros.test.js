const { ErroDeRegra } = require('../src/erros');

describe('ErroDeRegra', () => {
  test('é um Error com nome próprio e a mensagem recebida', () => {
    const erro = new ErroDeRegra('Lance o dado antes de mover uma peça');

    expect(erro).toBeInstanceOf(Error);
    expect(erro).toBeInstanceOf(ErroDeRegra);
    expect(erro.name).toBe('ErroDeRegra');
    expect(erro.message).toBe('Lance o dado antes de mover uma peça');
  });

  test('é diferente dos erros de argumento', () => {
    const erro = new ErroDeRegra('qualquer regra');

    expect(erro).not.toBeInstanceOf(TypeError);
    expect(erro).not.toBeInstanceOf(RangeError);
  });
});
