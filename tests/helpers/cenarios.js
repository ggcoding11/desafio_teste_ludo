const { POSICOES } = require('../../src/constantes');

const { BASE, CHEGADA } = POSICOES;

function criarCenario({ vermelho, amarelo }) {
  return Object.freeze({
    vermelho: Object.freeze([...vermelho]),
    amarelo: Object.freeze([...amarelo]),
  });
}

const TODAS_AS_PECAS_NA_BASE = criarCenario({
  vermelho: [BASE, BASE, BASE, BASE],
  amarelo: [BASE, BASE, BASE, BASE],
});

const VERMELHO_VENCE_TIRANDO_UM = criarCenario({
  vermelho: [CHEGADA, CHEGADA, CHEGADA, 55],
  amarelo: [BASE, BASE, BASE, BASE],
});

const VERMELHO_VENCE_TIRANDO_SEIS = criarCenario({
  vermelho: [CHEGADA, CHEGADA, CHEGADA, 50],
  amarelo: [BASE, BASE, BASE, BASE],
});

const VERMELHO_SO_PODE_MOVER_A_PECA_2_SEM_TIRAR_SEIS = criarCenario({
  vermelho: [BASE, 10, BASE, BASE],
  amarelo: [BASE, BASE, BASE, BASE],
});

const PECA_1_VERMELHA_PASSA_DA_CHEGADA_TIRANDO_TRES = criarCenario({
  vermelho: [54, 10, BASE, BASE],
  amarelo: [BASE, BASE, BASE, BASE],
});

const PECA_1_VERMELHA_JA_CHEGOU = criarCenario({
  vermelho: [CHEGADA, 10, BASE, BASE],
  amarelo: [BASE, BASE, BASE, BASE],
});

const VERMELHO_SEM_MOVIMENTO_POSSIVEL_TIRANDO_SEIS = criarCenario({
  vermelho: [51, CHEGADA, CHEGADA, CHEGADA],
  amarelo: [BASE, BASE, BASE, BASE],
});

const PECAS_VERMELHAS_1_E_2_SE_ENCONTRAM_TIRANDO_TRES = criarCenario({
  vermelho: [7, 10, BASE, BASE],
  amarelo: [BASE, BASE, BASE, BASE],
});

module.exports = {
  TODAS_AS_PECAS_NA_BASE,
  VERMELHO_VENCE_TIRANDO_UM,
  VERMELHO_VENCE_TIRANDO_SEIS,
  VERMELHO_SO_PODE_MOVER_A_PECA_2_SEM_TIRAR_SEIS,
  PECA_1_VERMELHA_PASSA_DA_CHEGADA_TIRANDO_TRES,
  PECA_1_VERMELHA_JA_CHEGOU,
  VERMELHO_SEM_MOVIMENTO_POSSIVEL_TIRANDO_SEIS,
  PECAS_VERMELHAS_1_E_2_SE_ENCONTRAM_TIRANDO_TRES,
};
