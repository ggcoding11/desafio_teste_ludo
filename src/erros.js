class ErroDeRegra extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'ErroDeRegra';
  }
}

module.exports = { ErroDeRegra };
