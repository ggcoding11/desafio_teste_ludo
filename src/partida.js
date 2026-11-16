const { ORDEM_DE_JOGO, PECAS_POR_JOGADOR, POSICOES, DADO } = require('./constantes');
const { ErroDeRegra } = require('./erros');
const { validarInteiroNoIntervalo } = require('./validacoes');
const { lancarDado: lancarDadoComMathRandom, validarValorDoDado } = require('./dado');
const { validarCor, validarPosicao, podeMover, calcularDestino } = require('./tabuleiro');

function criarPosicoesNaBase() {
  const posicoes = {};
  for (const cor of ORDEM_DE_JOGO) {
    posicoes[cor] = Array(PECAS_POR_JOGADOR).fill(POSICOES.BASE);
  }
  return posicoes;
}

function copiarPosicoes(posicoes) {
  const copia = {};
  for (const cor of ORDEM_DE_JOGO) {
    copia[cor] = [...posicoes[cor]];
  }
  return copia;
}

function todasAsPecasChegaram(posicoesDaCor) {
  return posicoesDaCor.every((posicao) => posicao === POSICOES.CHEGADA);
}

function validarPosicoesDaCor(cor, posicoesDaCor) {
  if (!Array.isArray(posicoesDaCor)) {
    throw new TypeError(`As posições iniciais da cor ${cor} precisam ser uma lista`);
  }
  if (posicoesDaCor.length !== PECAS_POR_JOGADOR) {
    throw new RangeError(`A cor ${cor} precisa ter exatamente ${PECAS_POR_JOGADOR} peças`);
  }
  for (const posicao of posicoesDaCor) {
    validarPosicao(posicao);
  }
  if (todasAsPecasChegaram(posicoesDaCor)) {
    throw new RangeError(`A partida não pode começar com a cor ${cor} já vencedora`);
  }
}

function validarPosicoesIniciais(posicoesIniciais) {
  if (typeof posicoesIniciais !== 'object' || posicoesIniciais === null) {
    throw new TypeError('As posições iniciais precisam ser um objeto com as posições de cada cor');
  }
  const coresQueNaoJogam = Object.keys(posicoesIniciais).filter(
    (cor) => !ORDEM_DE_JOGO.includes(cor),
  );
  if (coresQueNaoJogam.length > 0) {
    throw new RangeError(
      `As posições iniciais têm cores que não jogam nesta partida: ${coresQueNaoJogam.join(', ')}`,
    );
  }
  for (const cor of ORDEM_DE_JOGO) {
    validarPosicoesDaCor(cor, posicoesIniciais[cor]);
  }
}

function validarNumeroDaPeca(numeroDaPeca) {
  validarInteiroNoIntervalo(numeroDaPeca, 1, PECAS_POR_JOGADOR, 'O número da peça');
}

class Partida {
  #lancarDado;
  #posicoes;
  #indiceDoJogadorDaVez = 0;
  #valorDoDado = null;
  #vencedor = null;

  constructor({
    lancarDado = lancarDadoComMathRandom,
    posicoesIniciais = criarPosicoesNaBase(),
  } = {}) {
    if (typeof lancarDado !== 'function') {
      throw new TypeError('O lançador de dado precisa ser uma função');
    }
    validarPosicoesIniciais(posicoesIniciais);
    this.#lancarDado = lancarDado;
    this.#posicoes = copiarPosicoes(posicoesIniciais);
  }

  get jogadorDaVez() {
    return this.encerrada ? null : this.#corDaVez();
  }

  get valorDoDado() {
    return this.#valorDoDado;
  }

  get vencedor() {
    return this.#vencedor;
  }

  get encerrada() {
    return this.#vencedor !== null;
  }

  posicoesDasPecas(cor) {
    validarCor(cor);
    return [...this.#posicoes[cor]];
  }

  pecasQuePodemSerMovidas() {
    if (this.#valorDoDado === null) {
      return [];
    }
    return this.#numerosDasPecasQuePodemMover(this.#valorDoDado);
  }

  lancarDado() {
    this.#garantirQueAPartidaNaoTerminou();
    if (this.#valorDoDado !== null) {
      throw new ErroDeRegra('O dado já foi lançado; mova uma peça antes de lançar de novo');
    }
    const valorDoDado = this.#lancarDado();
    validarValorDoDado(valorDoDado);
    if (this.#numerosDasPecasQuePodemMover(valorDoDado).length === 0) {
      this.#passarAVez();
    } else {
      this.#valorDoDado = valorDoDado;
    }
    return valorDoDado;
  }

  moverPeca(numeroDaPeca) {
    validarNumeroDaPeca(numeroDaPeca);
    this.#garantirQueAPartidaNaoTerminou();
    if (this.#valorDoDado === null) {
      throw new ErroDeRegra('Lance o dado antes de mover uma peça');
    }
    const cor = this.#corDaVez();
    const indiceDaPeca = numeroDaPeca - 1;
    const destino = calcularDestino(this.#posicoes[cor][indiceDaPeca], this.#valorDoDado);
    this.#posicoes[cor][indiceDaPeca] = destino;
    this.#concluirJogada(cor);
  }

  #corDaVez() {
    return ORDEM_DE_JOGO[this.#indiceDoJogadorDaVez];
  }

  #numerosDasPecasQuePodemMover(valorDoDado) {
    const numerosDasPecas = [];
    this.#posicoes[this.#corDaVez()].forEach((posicao, indiceDaPeca) => {
      if (podeMover(posicao, valorDoDado)) {
        numerosDasPecas.push(indiceDaPeca + 1);
      }
    });
    return numerosDasPecas;
  }

  #concluirJogada(cor) {
    const ganhouJogadaExtra = this.#valorDoDado === DADO.VALOR_QUE_DA_JOGADA_EXTRA;
    this.#valorDoDado = null;
    if (todasAsPecasChegaram(this.#posicoes[cor])) {
      this.#vencedor = cor;
      return;
    }
    if (!ganhouJogadaExtra) {
      this.#passarAVez();
    }
  }

  #passarAVez() {
    this.#indiceDoJogadorDaVez = (this.#indiceDoJogadorDaVez + 1) % ORDEM_DE_JOGO.length;
  }

  #garantirQueAPartidaNaoTerminou() {
    if (this.encerrada) {
      throw new ErroDeRegra('A partida já terminou');
    }
  }
}

module.exports = { Partida };
