const GERADOR_QUE_SEMPRE_TIRA_UM = () => 0;

const GERADOR_QUE_SEMPRE_TIRA_SEIS = () => 0.99;

function criarFuncaoQueDevolveEmSequencia(valores) {
  const copiaDosValores = [...valores];
  let proximoIndice = 0;
  return () => {
    if (proximoIndice >= copiaDosValores.length) {
      throw new Error('A sequência de teste ficou sem valores');
    }
    const valor = copiaDosValores[proximoIndice];
    proximoIndice += 1;
    return valor;
  };
}

function criarGeradorEmSequencia(...numerosAleatorios) {
  return criarFuncaoQueDevolveEmSequencia(numerosAleatorios);
}

function criarDadoQueTira(...valoresDoDado) {
  return criarFuncaoQueDevolveEmSequencia(valoresDoDado);
}

module.exports = {
  GERADOR_QUE_SEMPRE_TIRA_UM,
  GERADOR_QUE_SEMPRE_TIRA_SEIS,
  criarGeradorEmSequencia,
  criarDadoQueTira,
};
