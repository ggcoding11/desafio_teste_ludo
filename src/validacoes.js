function validarInteiroNoIntervalo(numero, minimo, maximo, descricao) {
  if (!Number.isInteger(numero)) {
    throw new TypeError(`${descricao} precisa ser um número inteiro`);
  }
  if (numero < minimo || numero > maximo) {
    throw new RangeError(`${descricao} precisa estar entre ${minimo} e ${maximo}`);
  }
}

module.exports = { validarInteiroNoIntervalo };
