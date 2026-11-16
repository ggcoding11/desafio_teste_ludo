const { Partida } = require('../src/partida');
const { ErroDeRegra } = require('../src/erros');
const { CORES, POSICOES } = require('../src/constantes');
const { criarDadoQueTira } = require('./helpers/geradores');
const {
  TODAS_AS_PECAS_NA_BASE,
  VERMELHO_VENCE_TIRANDO_UM,
  VERMELHO_VENCE_TIRANDO_SEIS,
  VERMELHO_SO_PODE_MOVER_A_PECA_2_SEM_TIRAR_SEIS,
  PECA_1_VERMELHA_PASSA_DA_CHEGADA_TIRANDO_TRES,
  PECA_1_VERMELHA_JA_CHEGOU,
  VERMELHO_SEM_MOVIMENTO_POSSIVEL_TIRANDO_SEIS,
  PECAS_VERMELHAS_1_E_2_SE_ENCONTRAM_TIRANDO_TRES,
  VERMELHA_CAPTURA_AMARELA_TIRANDO_TRES,
  VERMELHA_CAPTURA_DUAS_AMARELAS_TIRANDO_TRES,
  AMARELA_PROTEGIDA_NA_ESTRELA_ONDE_A_VERMELHA_CAI_TIRANDO_TRES,
  AMARELA_PROTEGIDA_NA_PROPRIA_SAIDA_ONDE_A_VERMELHA_CAI_TIRANDO_TRES,
  AMARELA_PROTEGIDA_NA_SAIDA_VERMELHA,
  VERMELHA_ENTRA_NO_CORREDOR_TIRANDO_CINCO_SEM_CAPTURAR_A_AMARELA,
  AMARELA_NAO_ALCANCA_VERMELHA_NO_CORREDOR_DEPOIS_QUE_O_VERMELHO_PASSA_A_VEZ,
  AMARELA_CAPTURA_VERMELHA_DEPOIS_QUE_ELA_ANDA_DOIS,
} = require('./helpers/cenarios');

const { VERMELHO, AMARELO } = CORES;
const { BASE, SAIDA, CHEGADA } = POSICOES;
const LIMITE_DE_LANCAMENTOS_DE_UMA_PARTIDA_ALEATORIA = 100000;

function criarPartida(posicoesIniciais, ...valoresDoDado) {
  return new Partida({ posicoesIniciais, lancarDado: criarDadoQueTira(...valoresDoDado) });
}

function fotografarEstado(partida) {
  return {
    jogadorDaVez: partida.jogadorDaVez,
    valorDoDado: partida.valorDoDado,
    vencedor: partida.vencedor,
    encerrada: partida.encerrada,
    pecasQuePodemSerMovidas: partida.pecasQuePodemSerMovidas(),
    vermelho: partida.posicoesDasPecas(VERMELHO),
    amarelo: partida.posicoesDasPecas(AMARELO),
  };
}

describe('início da partida', () => {
  test('começa com o vermelho na vez, todas as peças na base e o dado por lançar', () => {
    const partida = new Partida();

    expect(fotografarEstado(partida)).toEqual({
      jogadorDaVez: VERMELHO,
      valorDoDado: null,
      vencedor: null,
      encerrada: false,
      pecasQuePodemSerMovidas: [],
      vermelho: [BASE, BASE, BASE, BASE],
      amarelo: [BASE, BASE, BASE, BASE],
    });
  });

  test('aceita posições iniciais montadas à mão', () => {
    const partida = criarPartida(VERMELHO_SO_PODE_MOVER_A_PECA_2_SEM_TIRAR_SEIS);

    expect(partida.posicoesDasPecas(VERMELHO)).toEqual([BASE, 10, BASE, BASE]);
    expect(partida.posicoesDasPecas(AMARELO)).toEqual([BASE, BASE, BASE, BASE]);
  });

  test('não chama o dado ao ser criada', () => {
    const lancarDado = jest.fn(criarDadoQueTira(6));

    new Partida({ lancarDado });

    expect(lancarDado).not.toHaveBeenCalled();
  });
});

describe('argumentos inválidos na criação da partida', () => {
  test('recusa opções nulas com TypeError', () => {
    expect(() => new Partida(null)).toThrow(TypeError);
  });

  test.each([
    ['um número', 6],
    ['um texto', 'dado'],
    ['nulo', null],
  ])('recusa lançador de dado que é %s com TypeError', (_descricao, lancarDado) => {
    expect(() => new Partida({ lancarDado })).toThrow(
      new TypeError('O lançador de dado precisa ser uma função'),
    );
  });

  test.each([
    ['nulas', null],
    ['um texto', 'base'],
  ])('recusa posições iniciais que são %s com TypeError', (_descricao, posicoesIniciais) => {
    expect(() => new Partida({ posicoesIniciais })).toThrow(
      new TypeError('As posições iniciais precisam ser um objeto com as posições de cada cor'),
    );
  });

  test('recusa posições iniciais com uma cor que não joga, com RangeError', () => {
    const posicoesIniciais = { ...TODAS_AS_PECAS_NA_BASE, verde: [BASE, BASE, BASE, BASE] };

    expect(() => new Partida({ posicoesIniciais })).toThrow(
      new RangeError('As posições iniciais têm cores que não jogam nesta partida: verde'),
    );
  });

  test('recusa posições iniciais sem uma das cores, com TypeError', () => {
    const posicoesIniciais = { vermelho: [BASE, BASE, BASE, BASE] };

    expect(() => new Partida({ posicoesIniciais })).toThrow(
      new TypeError('As posições iniciais da cor amarelo precisam ser uma lista'),
    );
  });

  test.each([
    ['três', [BASE, BASE, BASE]],
    ['cinco', [BASE, BASE, BASE, BASE, BASE]],
  ])('recusa cor com %s peças, com RangeError', (_descricao, posicoesDoVermelho) => {
    const posicoesIniciais = { ...TODAS_AS_PECAS_NA_BASE, vermelho: posicoesDoVermelho };

    expect(() => new Partida({ posicoesIniciais })).toThrow(
      new RangeError('A cor vermelho precisa ter exatamente 4 peças'),
    );
  });

  test.each([
    ['não inteira', 2.5, TypeError],
    ['antes da base', -2, RangeError],
    ['depois da chegada', 57, RangeError],
  ])('recusa posição de peça %s', (_descricao, posicaoInvalida, TipoDeErro) => {
    const posicoesIniciais = { ...TODAS_AS_PECAS_NA_BASE, amarelo: [BASE, posicaoInvalida, BASE, BASE] };

    expect(() => new Partida({ posicoesIniciais })).toThrow(TipoDeErro);
  });

  test('recusa começar uma partida em que uma cor já venceu, com RangeError', () => {
    const posicoesIniciais = {
      ...TODAS_AS_PECAS_NA_BASE,
      amarelo: [CHEGADA, CHEGADA, CHEGADA, CHEGADA],
    };

    expect(() => new Partida({ posicoesIniciais })).toThrow(
      new RangeError('A partida não pode começar com a cor amarelo já vencedora'),
    );
  });
});

describe('lançamento do dado', () => {
  test('chama o dado injetado uma vez por lançamento e devolve o valor', () => {
    const lancarDado = jest.fn(criarDadoQueTira(6));
    const partida = new Partida({ lancarDado });

    expect(partida.lancarDado()).toBe(6);
    expect(lancarDado).toHaveBeenCalledTimes(1);
  });

  test('com 6 e peças na base, o jogador da vez guarda o valor e pode mover qualquer peça', () => {
    const partida = criarPartida(TODAS_AS_PECAS_NA_BASE, 6);

    partida.lancarDado();

    expect(partida.jogadorDaVez).toBe(VERMELHO);
    expect(partida.valorDoDado).toBe(6);
    expect(partida.pecasQuePodemSerMovidas()).toEqual([1, 2, 3, 4]);
  });

  test.each([1, 2, 3, 4, 5])(
    'com todas as peças na base, tirar %p passa a vez automaticamente',
    (valorDoDado) => {
      const partida = criarPartida(TODAS_AS_PECAS_NA_BASE, valorDoDado);

      expect(partida.lancarDado()).toBe(valorDoDado);

      expect(partida.jogadorDaVez).toBe(AMARELO);
      expect(partida.valorDoDado).toBeNull();
      expect(partida.posicoesDasPecas(VERMELHO)).toEqual([BASE, BASE, BASE, BASE]);
    },
  );

  test('tirar 6 sem nenhum movimento possível passa a vez, sem jogada extra', () => {
    const partida = criarPartida(VERMELHO_SEM_MOVIMENTO_POSSIVEL_TIRANDO_SEIS, 6);

    partida.lancarDado();

    expect(partida.jogadorDaVez).toBe(AMARELO);
    expect(partida.valorDoDado).toBeNull();
    expect(partida.posicoesDasPecas(VERMELHO)).toEqual([51, CHEGADA, CHEGADA, CHEGADA]);
  });

  test('lista só as peças que o valor do dado permite mover', () => {
    const partida = criarPartida(PECA_1_VERMELHA_PASSA_DA_CHEGADA_TIRANDO_TRES, 3);

    partida.lancarDado();

    expect(partida.pecasQuePodemSerMovidas()).toEqual([2]);
  });

  test('lançar de novo antes de mover é proibido, não chama o dado e não muda nada', () => {
    const lancarDado = jest.fn(criarDadoQueTira(6, 6));
    const partida = new Partida({ lancarDado });
    partida.lancarDado();
    const estadoAntes = fotografarEstado(partida);

    expect(() => partida.lancarDado()).toThrow(
      new ErroDeRegra('O dado já foi lançado; mova uma peça antes de lançar de novo'),
    );
    expect(lancarDado).toHaveBeenCalledTimes(1);
    expect(fotografarEstado(partida)).toEqual(estadoAntes);
  });

  test.each([
    ['não inteiro', 2.5, TypeError],
    ['um texto', '6', TypeError],
    ['zero', 0, RangeError],
    ['sete', 7, RangeError],
  ])('recusa dado injetado que devolve %s e não muda nada', (_descricao, valorInvalido, TipoDeErro) => {
    const partida = criarPartida(TODAS_AS_PECAS_NA_BASE, valorInvalido);
    const estadoAntes = fotografarEstado(partida);

    expect(() => partida.lancarDado()).toThrow(TipoDeErro);
    expect(fotografarEstado(partida)).toEqual(estadoAntes);
  });
});

describe('movimento das peças', () => {
  test('com 6, a peça sai da base para a casa de saída e o jogador ganha jogada extra', () => {
    const partida = criarPartida(TODAS_AS_PECAS_NA_BASE, 6);
    partida.lancarDado();

    partida.moverPeca(3);

    expect(partida.posicoesDasPecas(VERMELHO)).toEqual([BASE, BASE, SAIDA, BASE]);
    expect(partida.jogadorDaVez).toBe(VERMELHO);
    expect(partida.valorDoDado).toBeNull();
  });

  test('com valor diferente de 6, a peça anda e a vez passa', () => {
    const partida = criarPartida(VERMELHO_SO_PODE_MOVER_A_PECA_2_SEM_TIRAR_SEIS, 4);
    partida.lancarDado();

    partida.moverPeca(2);

    expect(partida.posicoesDasPecas(VERMELHO)).toEqual([BASE, 14, BASE, BASE]);
    expect(partida.jogadorDaVez).toBe(AMARELO);
  });

  test('com 6, uma peça que já está na trilha também anda seis casas e dá jogada extra', () => {
    const partida = criarPartida(VERMELHO_SO_PODE_MOVER_A_PECA_2_SEM_TIRAR_SEIS, 6);
    partida.lancarDado();

    partida.moverPeca(2);

    expect(partida.posicoesDasPecas(VERMELHO)).toEqual([BASE, 16, BASE, BASE]);
    expect(partida.jogadorDaVez).toBe(VERMELHO);
  });

  test('duas peças da mesma cor podem dividir a mesma casa', () => {
    const partida = criarPartida(PECAS_VERMELHAS_1_E_2_SE_ENCONTRAM_TIRANDO_TRES, 3);
    partida.lancarDado();

    partida.moverPeca(1);

    expect(partida.posicoesDasPecas(VERMELHO)).toEqual([10, 10, BASE, BASE]);
  });

  test('mover sem ter lançado o dado é proibido e não muda nada', () => {
    const partida = new Partida();
    const estadoAntes = fotografarEstado(partida);

    expect(() => partida.moverPeca(1)).toThrow(
      new ErroDeRegra('Lance o dado antes de mover uma peça'),
    );
    expect(fotografarEstado(partida)).toEqual(estadoAntes);
  });

  test.each([
    [
      'tirar da base sem 6',
      VERMELHO_SO_PODE_MOVER_A_PECA_2_SEM_TIRAR_SEIS,
      3,
      1,
      'A peça só sai da base com 6',
    ],
    [
      'passar da chegada',
      PECA_1_VERMELHA_PASSA_DA_CHEGADA_TIRANDO_TRES,
      3,
      1,
      'A peça precisa do valor exato para chegar e não pode passar da chegada',
    ],
    [
      'mover uma peça que já chegou',
      PECA_1_VERMELHA_JA_CHEGOU,
      3,
      1,
      'A peça já chegou e não pode mais se mover',
    ],
  ])('%s é proibido e não muda nada', (_regra, cenario, valorDoDado, numeroDaPeca, mensagem) => {
    const partida = criarPartida(cenario, valorDoDado);
    partida.lancarDado();
    const estadoAntes = fotografarEstado(partida);

    expect(() => partida.moverPeca(numeroDaPeca)).toThrow(new ErroDeRegra(mensagem));
    expect(fotografarEstado(partida)).toEqual(estadoAntes);
  });

  test('depois de uma jogada recusada, o jogador ainda pode mover uma peça válida', () => {
    const partida = criarPartida(VERMELHO_SO_PODE_MOVER_A_PECA_2_SEM_TIRAR_SEIS, 3);
    partida.lancarDado();
    expect(() => partida.moverPeca(1)).toThrow(ErroDeRegra);

    partida.moverPeca(2);

    expect(partida.posicoesDasPecas(VERMELHO)).toEqual([BASE, 13, BASE, BASE]);
  });

  test.each([
    ['não inteiro', 1.5, new TypeError('O número da peça precisa ser um número inteiro')],
    ['um texto', '1', new TypeError('O número da peça precisa ser um número inteiro')],
    ['zero', 0, new RangeError('O número da peça precisa estar entre 1 e 4')],
    ['cinco', 5, new RangeError('O número da peça precisa estar entre 1 e 4')],
  ])('recusa número de peça %s e não muda nada', (_descricao, numeroDaPeca, erroEsperado) => {
    const partida = criarPartida(TODAS_AS_PECAS_NA_BASE, 6);
    partida.lancarDado();
    const estadoAntes = fotografarEstado(partida);

    expect(() => partida.moverPeca(numeroDaPeca)).toThrow(erroEsperado);
    expect(fotografarEstado(partida)).toEqual(estadoAntes);
  });

  test('o argumento é validado antes da regra', () => {
    const partida = new Partida();

    expect(() => partida.moverPeca(0)).toThrow(RangeError);
  });
});

describe('captura', () => {
  test('parar na casa de uma peça adversária fora de casa segura a manda de volta para a base', () => {
    const partida = criarPartida(VERMELHA_CAPTURA_AMARELA_TIRANDO_TRES, 3);
    partida.lancarDado();

    partida.moverPeca(1);

    expect(partida.posicoesDasPecas(VERMELHO)).toEqual([4, BASE, BASE, BASE]);
    expect(partida.posicoesDasPecas(AMARELO)).toEqual([BASE, BASE, BASE, BASE]);
  });

  test('a captura não dá jogada extra', () => {
    const partida = criarPartida(VERMELHA_CAPTURA_AMARELA_TIRANDO_TRES, 3);
    partida.lancarDado();

    partida.moverPeca(1);

    expect(partida.jogadorDaVez).toBe(AMARELO);
  });

  test('todas as peças adversárias da casa voltam para a base; as outras ficam onde estão', () => {
    const partida = criarPartida(VERMELHA_CAPTURA_DUAS_AMARELAS_TIRANDO_TRES, 3);
    partida.lancarDado();

    partida.moverPeca(1);

    expect(partida.posicoesDasPecas(AMARELO)).toEqual([BASE, BASE, 10, BASE]);
  });

  test('passar por cima de uma peça adversária não a captura', () => {
    const partida = criarPartida(VERMELHA_CAPTURA_AMARELA_TIRANDO_TRES, 5);
    partida.lancarDado();

    partida.moverPeca(1);

    expect(partida.posicoesDasPecas(VERMELHO)).toEqual([6, BASE, BASE, BASE]);
    expect(partida.posicoesDasPecas(AMARELO)).toEqual([30, BASE, BASE, BASE]);
  });

  test('a peça amarela também captura a vermelha', () => {
    const partida = criarPartida(AMARELA_CAPTURA_VERMELHA_DEPOIS_QUE_ELA_ANDA_DOIS, 2, 4);
    partida.lancarDado();
    partida.moverPeca(1);
    partida.lancarDado();

    partida.moverPeca(1);

    expect(partida.posicoesDasPecas(AMARELO)).toEqual([6, BASE, BASE, BASE]);
    expect(partida.posicoesDasPecas(VERMELHO)).toEqual([BASE, BASE, BASE, BASE]);
  });

  test.each([
    [
      'numa estrela',
      AMARELA_PROTEGIDA_NA_ESTRELA_ONDE_A_VERMELHA_CAI_TIRANDO_TRES,
      3,
      [8, BASE, BASE, BASE],
      [34, BASE, BASE, BASE],
    ],
    [
      'na própria casa de saída',
      AMARELA_PROTEGIDA_NA_PROPRIA_SAIDA_ONDE_A_VERMELHA_CAI_TIRANDO_TRES,
      3,
      [26, BASE, BASE, BASE],
      [SAIDA, BASE, BASE, BASE],
    ],
    [
      'na casa de saída do vermelho, quando a vermelha sai da base',
      AMARELA_PROTEGIDA_NA_SAIDA_VERMELHA,
      6,
      [SAIDA, BASE, BASE, BASE],
      [26, BASE, BASE, BASE],
    ],
  ])(
    'a peça adversária %s está protegida e as duas dividem a casa',
    (_casaSegura, cenario, valorDoDado, vermelhoEsperado, amareloEsperado) => {
      const partida = criarPartida(cenario, valorDoDado);
      partida.lancarDado();

      partida.moverPeca(1);

      expect(partida.posicoesDasPecas(VERMELHO)).toEqual(vermelhoEsperado);
      expect(partida.posicoesDasPecas(AMARELO)).toEqual(amareloEsperado);
    },
  );

  test('a peça que entra no próprio corredor final não captura ninguém na trilha', () => {
    const partida = criarPartida(VERMELHA_ENTRA_NO_CORREDOR_TIRANDO_CINCO_SEM_CAPTURAR_A_AMARELA, 5);
    partida.lancarDado();

    partida.moverPeca(1);

    expect(partida.posicoesDasPecas(VERMELHO)).toEqual([53, BASE, BASE, BASE]);
    expect(partida.posicoesDasPecas(AMARELO)).toEqual([27, BASE, BASE, BASE]);
  });

  test('a peça no corredor final não pode ser capturada', () => {
    const partida = criarPartida(
      AMARELA_NAO_ALCANCA_VERMELHA_NO_CORREDOR_DEPOIS_QUE_O_VERMELHO_PASSA_A_VEZ,
      6,
      3,
    );
    partida.lancarDado();
    partida.lancarDado();

    partida.moverPeca(1);

    expect(partida.posicoesDasPecas(AMARELO)).toEqual([25, BASE, BASE, BASE]);
    expect(partida.posicoesDasPecas(VERMELHO)).toEqual([51, CHEGADA, CHEGADA, CHEGADA]);
  });
});

describe('fim da partida', () => {
  test('vence quem leva as quatro peças à chegada e a partida termina na hora', () => {
    const partida = criarPartida(VERMELHO_VENCE_TIRANDO_UM, 1);
    partida.lancarDado();

    partida.moverPeca(4);

    expect(fotografarEstado(partida)).toEqual({
      jogadorDaVez: null,
      valorDoDado: null,
      vencedor: VERMELHO,
      encerrada: true,
      pecasQuePodemSerMovidas: [],
      vermelho: [CHEGADA, CHEGADA, CHEGADA, CHEGADA],
      amarelo: [BASE, BASE, BASE, BASE],
    });
  });

  test('vencer com 6 não dá jogada extra: a partida termina', () => {
    const partida = criarPartida(VERMELHO_VENCE_TIRANDO_SEIS, 6);
    partida.lancarDado();

    partida.moverPeca(4);

    expect(partida.vencedor).toBe(VERMELHO);
    expect(partida.encerrada).toBe(true);
    expect(partida.jogadorDaVez).toBeNull();
  });

  test('depois do fim, lançar o dado é proibido, não chama o dado e não muda nada', () => {
    const lancarDado = jest.fn(criarDadoQueTira(1, 6));
    const partida = new Partida({ posicoesIniciais: VERMELHO_VENCE_TIRANDO_UM, lancarDado });
    partida.lancarDado();
    partida.moverPeca(4);
    const estadoAntes = fotografarEstado(partida);

    expect(() => partida.lancarDado()).toThrow(new ErroDeRegra('A partida já terminou'));
    expect(lancarDado).toHaveBeenCalledTimes(1);
    expect(fotografarEstado(partida)).toEqual(estadoAntes);
  });

  test('depois do fim, mover uma peça é proibido e não muda nada', () => {
    const partida = criarPartida(VERMELHO_VENCE_TIRANDO_UM, 1);
    partida.lancarDado();
    partida.moverPeca(4);
    const estadoAntes = fotografarEstado(partida);

    expect(() => partida.moverPeca(1)).toThrow(new ErroDeRegra('A partida já terminou'));
    expect(fotografarEstado(partida)).toEqual(estadoAntes);
  });
});

describe('determinismo', () => {
  function jogarAberturaRoteirizada(partida) {
    partida.lancarDado();
    partida.lancarDado();
    partida.moverPeca(1);
    partida.lancarDado();
    partida.moverPeca(1);
    partida.lancarDado();
    partida.moverPeca(2);
    partida.lancarDado();
    partida.moverPeca(2);
  }

  const DADOS_DA_ABERTURA = [3, 6, 2, 6, 5];

  test('uma abertura roteirizada leva exatamente ao estado esperado', () => {
    const partida = criarPartida(TODAS_AS_PECAS_NA_BASE, ...DADOS_DA_ABERTURA);

    jogarAberturaRoteirizada(partida);

    expect(partida.posicoesDasPecas(VERMELHO)).toEqual([BASE, 5, BASE, BASE]);
    expect(partida.posicoesDasPecas(AMARELO)).toEqual([2, BASE, BASE, BASE]);
    expect(partida.jogadorDaVez).toBe(AMARELO);
  });

  test('o mesmo dado roteirizado reproduz o mesmo estado', () => {
    const primeiraPartida = criarPartida(TODAS_AS_PECAS_NA_BASE, ...DADOS_DA_ABERTURA);
    const segundaPartida = criarPartida(TODAS_AS_PECAS_NA_BASE, ...DADOS_DA_ABERTURA);

    jogarAberturaRoteirizada(primeiraPartida);
    jogarAberturaRoteirizada(segundaPartida);

    expect(fotografarEstado(segundaPartida)).toEqual(fotografarEstado(primeiraPartida));
  });
});

describe('partida sem injeção (dado com Math.random)', () => {
  test('no primeiro lançamento, só o 6 mantém a vez; qualquer outro valor passa para o amarelo', () => {
    const partida = new Partida();

    const valorDoDado = partida.lancarDado();

    expect(valorDoDado).toBeGreaterThanOrEqual(1);
    expect(valorDoDado).toBeLessThanOrEqual(6);
    if (valorDoDado === 6) {
      expect(partida.jogadorDaVez).toBe(VERMELHO);
      expect(partida.valorDoDado).toBe(6);
    } else {
      expect(partida.jogadorDaVez).toBe(AMARELO);
      expect(partida.valorDoDado).toBeNull();
    }
  });

  test('uma partida completa sempre termina com um vencedor que levou as quatro peças', () => {
    const partida = new Partida();
    let lancamentos = 0;

    while (!partida.encerrada && lancamentos < LIMITE_DE_LANCAMENTOS_DE_UMA_PARTIDA_ALEATORIA) {
      partida.lancarDado();
      lancamentos += 1;
      if (partida.valorDoDado !== null) {
        partida.moverPeca(partida.pecasQuePodemSerMovidas()[0]);
      }
    }

    expect(partida.encerrada).toBe(true);
    expect([VERMELHO, AMARELO]).toContain(partida.vencedor);
    expect(partida.posicoesDasPecas(partida.vencedor)).toEqual([CHEGADA, CHEGADA, CHEGADA, CHEGADA]);
  });
});

describe('encapsulamento', () => {
  test('não expõe campos públicos', () => {
    const partida = new Partida();

    expect(Object.keys(partida)).toEqual([]);
  });

  test('alterar a lista devolvida não altera as peças da partida', () => {
    const partida = new Partida();

    const posicoes = partida.posicoesDasPecas(VERMELHO);
    posicoes[0] = CHEGADA;

    expect(partida.posicoesDasPecas(VERMELHO)).toEqual([BASE, BASE, BASE, BASE]);
  });

  test('alterar as posições iniciais depois de criar a partida não altera a partida', () => {
    const posicoesIniciais = {
      vermelho: [BASE, 10, BASE, BASE],
      amarelo: [BASE, BASE, BASE, BASE],
    };
    const partida = new Partida({ posicoesIniciais });

    posicoesIniciais.vermelho[1] = 40;

    expect(partida.posicoesDasPecas(VERMELHO)).toEqual([BASE, 10, BASE, BASE]);
  });

  test('a partida não altera os cenários congelados que recebe', () => {
    const partida = criarPartida(VERMELHO_VENCE_TIRANDO_UM, 1);
    partida.lancarDado();

    partida.moverPeca(4);

    expect(VERMELHO_VENCE_TIRANDO_UM.vermelho).toEqual([CHEGADA, CHEGADA, CHEGADA, 55]);
  });

  test.each([
    [undefined, TypeError],
    ['verde', RangeError],
  ])('consultar as peças da cor inválida %p é recusado', (cor, TipoDeErro) => {
    expect(() => new Partida().posicoesDasPecas(cor)).toThrow(TipoDeErro);
  });
});
