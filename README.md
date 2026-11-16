# desafio_teste_ludo

Lógica de uma partida de **Ludo para dois jogadores**, escrita em JavaScript e coberta por casos de teste em Jest.

## Colaborador

- Gustavo de Almeida Gomes

## Especificação do desafio

O desafio foi proposto na disciplina de Teste de Software ([`aulas/SEMANA13-TORNADO/DESAFIOS.MD`](https://github.com/JoaoChoma/teste_software_2026/blob/main/aulas/SEMANA13-TORNADO/DESAFIOS.MD#ludo-by-vini)) e tem especificação de **Vini**:

> **Ludo (by Vini)**
>
> - casos de teste para testar uma partida para 02 jogadores;
> - casos de teste em Javascript para testar Javascript;

O projeto implementa só a lógica do jogo, sem interface (nem tela, nem CLI).

## Regras implementadas

O enunciado não detalha as regras do Ludo, e o jogo tem muitas variantes. Os itens marcados como **decisão adotada** foram definidos neste projeto e não vieram do enunciado.

### Jogadores e peças

- Dois jogadores: **vermelho** e **amarelo**. **Decisão adotada**
- O vermelho sempre começa, sem disputa no dado. **Decisão adotada**
- Cada jogador tem 4 peças, e todas começam na base.

### Tabuleiro

- A trilha comum tem 52 casas (0 a 51). O vermelho sai da casa **0** e o amarelo da casa **26**, em lados opostos. **Decisão adotada**
- Cada peça anda 56 passos a partir da própria saída: posições 0 a 50 na trilha comum, 51 a 55 no corredor final da sua cor e **56 é a chegada**. A base é representada pela posição −1.
- Casas seguras: as 4 casas de saída (0, 13, 26, 39) e as 4 estrelas (8, 21, 34, 47). As saídas 13 e 39 pertencem às cores que não jogam numa partida de dois, mas continuam seguras. **Decisão adotada**
- O corredor final é exclusivo da cor dona.

### Dado e turnos

- O dado tem faces de 1 a 6.
- Uma peça só sai da base com **6** e vai para a casa de saída da sua cor.
- Tirar 6 dá **jogada extra**, depois que a peça é movida. **Decisão adotada**
- Três 6 seguidos não têm regra especial: cada 6 dá mais uma jogada. **Decisão adotada**
- Se nenhuma peça pode se mover com o valor tirado, **a vez passa automaticamente**. Isso vale também para o 6, que nesse caso não dá jogada extra, porque não houve jogada. **Decisão adotada**

### Movimento e captura

- A peça precisa do **valor exato** para entrar na chegada, e um movimento que passaria da chegada é proibido. **Decisão adotada**
- Peças da mesma cor podem dividir uma casa. Não existe bloqueio: qualquer peça passa por cima de qualquer casa. **Decisão adotada**
- Parar numa casa da trilha com peça adversária, fora de casa segura, manda **todas** as peças adversárias daquela casa de volta para a base. Só passar por cima não captura. **Decisão adotada**
- A captura não dá jogada extra. **Decisão adotada**
- Nas casas seguras não há captura, e peças de cores diferentes convivem.
- No corredor final a peça não pode ser capturada.

### Fim da partida

- Vence quem levar as 4 peças à chegada primeiro, e a partida termina na hora, mesmo que a última jogada tenha sido um 6. **Decisão adotada**
- Depois do fim, qualquer ação lança `ErroDeRegra`, e `jogadorDaVez` passa a ser `null`. **Decisão adotada**

### Erros

- Nenhuma ação inválida é ignorada em silêncio: toda ação inválida lança um erro e deixa o estado como estava. **Decisão adotada**
- Lançar o dado duas vezes sem mover, mover sem ter lançado, tirar uma peça da base sem 6, mover uma peça que já chegou, passar da chegada e agir depois do fim lançam `ErroDeRegra`.
- Argumento de tipo errado lança `TypeError`; argumento com valor fora do permitido lança `RangeError`.

### Interface da partida

| Membro | O que faz |
|---|---|
| `new Partida({ lancarDado, posicoesIniciais })` | Cria a partida. As duas opções podem ser omitidas: por padrão, o dado usa `Math.random` e todas as peças começam na base |
| `lancarDado()` | Lança o dado e devolve o valor. Passa a vez se nenhuma peça puder se mover |
| `moverPeca(numeroDaPeca)` | Move a peça de número 1 a 4 do jogador da vez com o valor lançado |
| `pecasQuePodemSerMovidas()` | Números das peças que o valor atual do dado permite mover |
| `posicoesDasPecas(cor)` | Cópia das posições das 4 peças da cor |
| `jogadorDaVez`, `valorDoDado`, `vencedor`, `encerrada` | Consultas sobre o estado da partida |

As `posicoesIniciais` servem para montar cenários e são validadas como entrada externa: precisam ter exatamente as duas cores, 4 peças por cor e posições de −1 a 56, e nenhuma cor pode começar com todas as peças na chegada. A partida não verifica se o cenário poderia ter surgido de uma partida real (por exemplo, duas cores na mesma casa fora de casa segura). **Decisão adotada**

## Estrutura de pastas

```
src/
  constantes.js            cores, ordem de jogo, dimensões, casas seguras e valores do dado (Object.freeze)
  erros.js                 ErroDeRegra, para violações das regras do jogo
  validacoes.js            validação de inteiro dentro de uma faixa (TypeError/RangeError)
  dado.js                  lançamento do dado com gerador aleatório injetado e validação do valor
  tabuleiro.js             funções puras: cor, posição, casa da trilha, casa segura e destino do movimento
  partida.js               classe Partida: turnos, movimento, captura e fim de jogo
tests/
  constantes.test.js       coerência e imutabilidade das constantes
  erros.test.js            classe e nome do ErroDeRegra
  validacoes.test.js       aceitação e recusa de inteiros na faixa
  dado.test.js             conversão gerador → face, injeção, Math.random e validações
  tabuleiro.test.js        tabelas de regras do tabuleiro e validações de argumento
  partida.test.js          partida completa: início, dado, movimento, captura, fim, determinismo e encapsulamento
  helpers/
    geradores.js           geradores aleatórios previsíveis e dado que tira valores em sequência
    cenarios.js            posições iniciais montadas à mão e congeladas
```

## Como rodar

```bash
npm install
npm test
npm run test:coverage
```

Versões usadas: Node.js 26.1.0, npm 11.13.0 e Jest 30.5.2 (que suporta Node `>=24.0.0`). O projeto usa CommonJS.

**Resultado atual:** 6 suítes, **193 testes passando**, e cobertura de **100%** em `src/` (instruções 162/162, branches 78/78, funções 34/34 e linhas 160/160).

O `npm audit` acusa vulnerabilidades em dependências transitivas do Jest (como `deepmerge` e `glob`). A correção sugerida, `npm audit fix --force`, faria o Jest voltar para a versão 25, por isso não foi aplicada. Essas dependências só são usadas no ambiente de testes.

## Como funcionam os casos de teste

### Determinismo

Toda a aleatoriedade é injetada, sempre com um padrão de produção. `lancarDado(gerarNumeroAleatorio = Math.random)` recebe o gerador, e a `Partida` recebe `lancarDado` e `posicoesIniciais`. Com isso, cada cenário é reproduzido do mesmo jeito em toda execução.

| Cenário | Configuração | Para que serve |
|---|---|---|
| `GERADOR_QUE_SEMPRE_TIRA_UM` | gerador que devolve `0` | face mínima do dado |
| `GERADOR_QUE_SEMPRE_TIRA_SEIS` | gerador que devolve `0.99` | face máxima do dado |
| `criarGeradorEmSequencia(...)` | gerador que devolve números fixos em ordem | provar que o mesmo gerador reproduz os mesmos lançamentos |
| `criarDadoQueTira(...)` | dado da partida que devolve valores fixos em ordem | roteirizar jogadas; envolvido em `jest.fn`, prova quantas vezes o dado é chamado |
| `TODAS_AS_PECAS_NA_BASE` | as 8 peças na base | início da partida, saída com 6 e vez passada automaticamente |
| `VERMELHO_VENCE_TIRANDO_UM` | vermelho com 3 peças na chegada e 1 na posição 55 | vitória e ações recusadas depois do fim |
| `VERMELHO_VENCE_TIRANDO_SEIS` | vermelho com 3 peças na chegada e 1 na posição 50 | vencer com 6 não dá jogada extra |
| `VERMELHO_SO_PODE_MOVER_A_PECA_2_SEM_TIRAR_SEIS` | peça 2 na posição 10, demais na base | movimento simples e base sem 6 |
| `PECA_1_VERMELHA_PASSA_DA_CHEGADA_TIRANDO_TRES` | peça 1 na posição 54 | chegada exata |
| `PECA_1_VERMELHA_JA_CHEGOU` | peça 1 na chegada | peça que chegou não se move |
| `VERMELHO_SEM_MOVIMENTO_POSSIVEL_TIRANDO_SEIS` | peça na posição 51 e as outras na chegada | 6 sem movimento passa a vez |
| `PECAS_VERMELHAS_1_E_2_SE_ENCONTRAM_TIRANDO_TRES` | peças vermelhas nas posições 7 e 10 | peças da mesma cor dividem a casa |
| `VERMELHA_CAPTURA_AMARELA_TIRANDO_TRES` | vermelha na casa 1 e amarela na casa 4 da trilha | captura (com 3) e passar por cima sem capturar (com 5) |
| `VERMELHA_CAPTURA_DUAS_AMARELAS_TIRANDO_TRES` | duas amarelas na casa 4 e uma em outra casa | captura de todas as adversárias da casa |
| `AMARELA_CAPTURA_VERMELHA_DEPOIS_QUE_ELA_ANDA_DOIS` | vermelha e amarela que se encontram na casa 32 | captura pelo amarelo |
| `AMARELA_PROTEGIDA_NA_ESTRELA_...`, `..._NA_PROPRIA_SAIDA_...`, `..._NA_SAIDA_VERMELHA` | amarela parada numa casa segura | casas seguras impedem a captura |
| `VERMELHA_ENTRA_NO_CORREDOR_TIRANDO_CINCO_SEM_CAPTURAR_A_AMARELA` | vermelha entrando no corredor | o corredor não se confunde com a trilha |
| `AMARELA_NAO_ALCANCA_VERMELHA_NO_CORREDOR_...` | vermelha no corredor, amarela parando na casa equivalente | peça no corredor não é capturada |

Os cenários ficam congelados com `Object.freeze`, então qualquer tentativa da partida de alterá-los falharia. O caminho **sem injeção** (`Math.random`) também é testado, mas só com propriedades que as regras garantem: a face fica sempre entre 1 e 6, o primeiro lançamento só mantém a vez com 6, e uma partida aleatória completa termina com um vencedor que levou as 4 peças.

### Categorias de erro

As validações seguem uma ordem fixa: primeiro o argumento (`TypeError`/`RangeError`), depois a regra (`ErroDeRegra`) e só então a mutação. Os testes conferem classe e mensagem com `toThrow(new ErroDeRegra('mensagem'))`. Foi verificado na prática que, no Jest 30, esse matcher falha quando a classe do erro é diferente. Depois de cada ação recusada, os testes conferem que o estado não mudou.

| Categoria | Quando | Exemplos |
|---|---|---|
| `ErroDeRegra` | a ação viola uma regra do jogo | `'Lance o dado antes de mover uma peça'`, `'A peça só sai da base com 6'`, `'A peça precisa do valor exato para chegar e não pode passar da chegada'`, `'A partida já terminou'` |
| `TypeError` | argumento ou retorno de dependência com tipo errado | `moverPeca('1')`, `lancarDado` que não é função, gerador que devolve texto |
| `RangeError` | valor fora do permitido | `moverPeca(5)`, dado injetado que devolve 7, gerador que devolve 1, cor `'verde'` |

### Arquivos de teste

| Arquivo | Nº de testes | O que verifica |
|---|---|---|
| `tests/constantes.test.js` | 13 | constantes congeladas e coerentes entre si (saídas opostas, casas seguras dentro da trilha, 51 + 5 casas até a chegada) |
| `tests/erros.test.js` | 2 | `ErroDeRegra` é um `Error` com nome próprio e não se confunde com os erros de argumento |
| `tests/validacoes.test.js` | 12 | inteiros na faixa são aceitos; tipos errados dão `TypeError` e valores fora da faixa dão `RangeError` |
| `tests/dado.test.js` | 31 | conversão do gerador para a face, reprodutibilidade, uma chamada por lançamento, `Math.random` e validação do gerador e do valor |
| `tests/tabuleiro.test.js` | 66 | cores, posições, conversão para a casa da trilha (com a volta do amarelo), casas seguras, saída da base, chegada exata e peça já chegada |
| `tests/partida.test.js` | 69 | início, validação das opções, lançamento, vez passada automaticamente, movimento, jogada extra, captura, casas seguras, corredor, fim de jogo, determinismo, partida aleatória completa e encapsulamento |
| **Total** | **193** | 6 suítes |
