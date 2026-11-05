/* Catálogo de regras por modalidade. Resumos próprios, simplificados e informativos.
   O regulamento oficial da federação/organizador da competição sempre prevalece.
   Campos: id, nome, cat, ico, al (apelidos), resumo, jog, dur, pont, regras[], pen[], fonte (guia completo, opcional). */
(function () {
'use strict';
var B = 'https://regrasdoesporte.com.br/';

var C1 = 'Esportes coletivos', C2 = 'Raquete e rede', C3 = 'Individuais e de precisão', C4 = 'Lutas', C5 = 'Aquáticos e náuticos', C6 = 'Radicais, velocidade e outdoor';

var REGRAS = [
/* ---------------- Coletivos ---------------- */
{ id: 'futebol', nome: 'Futebol', cat: C1, ico: '⚽', al: ['futebol de campo'],
  resumo: 'Duas equipes disputam a bola com os pés para marcar mais gols que o adversário.',
  jog: '11 por equipe (10 na linha e 1 goleiro); o jogo exige no mínimo 7.', dur: '2 tempos de 45 minutos, mais acréscimos.',
  pont: 'Gol quando a bola cruza totalmente a linha entre as traves e sob o travessão. Vence quem marcar mais gols.',
  regras: ['Só o goleiro usa as mãos, e apenas dentro da própria área.', 'Impedimento: o atacante não pode estar à frente do penúltimo adversário no momento do passe, na metade de campo do adversário.', 'Lateral é cobrado com as mãos; escanteio e tiro de meta reiniciam a bola que sai pela linha de fundo.', 'Pênalti: falta dentro da área, cobrada da marca a 11 m com apenas o goleiro na defesa.', 'Em mata-mata empatado, o regulamento pode prever prorrogação e disputa de pênaltis.'],
  pen: ['Cartão amarelo é advertência; dois amarelos geram expulsão.', 'Cartão vermelho é expulsão direta, sem reposição do jogador.'], fonte: B + 'conheca-todas-as-regras-para-jogar-futebol.html' },

{ id: 'futsal', nome: 'Futsal', cat: C1, ico: '⚽', al: ['futebol de salão'],
  resumo: 'Futebol de quadra, com bola menor e mais pesada, jogo rápido e substituições livres.',
  jog: '5 por equipe (4 na linha e 1 goleiro).', dur: '2 tempos de 20 minutos, normalmente com cronômetro parado nas paradas de jogo.',
  pont: 'Gol com a bola cruzando a linha. Vence quem marcar mais gols.',
  regras: ['Não há impedimento.', 'A lateral é cobrada com os pés, e o goleiro tem poucos segundos para repor a bola em jogo.', 'Substituições ilimitadas e com o jogo em andamento.', 'Faltas são acumuladas por tempo; a partir da sexta falta da equipe, o tiro livre é cobrado sem barreira.', 'Cada equipe tem direito a tempo técnico, conforme o regulamento.'],
  pen: ['Cartão amarelo e vermelho como no futebol; o expulso é substituído após 2 minutos, se a equipe sofrer gol antes.'], fonte: B + 'conheca-as-regras-do-futsal-fundamentos-e-historia.html' },

{ id: 'futebol-society', nome: 'Futebol Society', cat: C1, ico: '⚽', al: ['society', 'fut7'],
  resumo: 'Versão do futebol em campo reduzido, geralmente de grama sintética.',
  jog: 'Em geral 7 por equipe (6 na linha e 1 goleiro); varia conforme o regulamento.', dur: 'Em geral 2 tempos de 20 a 30 minutos.',
  pont: 'Vence quem marcar mais gols.',
  regras: ['As regras seguem o futebol, com adaptações definidas pelo organizador.', 'Muitos regulamentos não adotam impedimento e permitem substituições livres.', 'O calçado costuma ser restrito (chuteira society ou tênis; sem travas de metal).', 'Confirme o tamanho do campo, a duração e os critérios de desempate no regulamento local.'],
  pen: ['Advertências e expulsões seguem o sistema de cartões do futebol.'], fonte: B + 'futebol-society-regras-taticas-regulamento-medidas-e-dimensoes.html' },

{ id: 'futebol-suico', nome: 'Futebol Suíço', cat: C1, ico: '⚽', al: ['suico', 'futebol 7'],
  resumo: 'Variação do futebol jogada em campo reduzido e com menos jogadores.',
  jog: 'Em geral 7 por equipe (6 na linha e 1 goleiro); confirme no regulamento.', dur: 'Definida pelo organizador, normalmente 2 tempos curtos.',
  pont: 'Vence quem marcar mais gols.',
  regras: ['Segue a base das regras do futebol, com adaptações para o campo reduzido.', 'Substituições costumam ser livres e o impedimento pode não ser aplicado.', 'Os critérios de desempate e a quantidade de atletas inscritos são definidos pelo regulamento da competição.'],
  pen: ['Cartões amarelo e vermelho funcionam como no futebol.'] },

{ id: 'volei', nome: 'Vôlei de quadra', cat: C1, ico: '🏐', al: ['volei', 'voleibol', 'vôlei'],
  resumo: 'Duas equipes separadas por uma rede tentam fazer a bola tocar o chão da quadra adversária.',
  jog: '6 por equipe em quadra de 18 m x 9 m.', dur: 'Sem tempo fixo: a partida é disputada em sets.',
  pont: 'Todo rally gera ponto. Sets até 25 pontos com 2 de diferença; o quinto set vai até 15. Vence quem ganhar 3 sets (melhor de 5).',
  regras: ['Cada equipe pode dar até 3 toques antes de devolver a bola; o bloqueio não conta como toque.', 'O mesmo jogador não toca duas vezes seguidas (exceto no bloqueio).', 'Há rodízio de posições a cada vez que a equipe recupera o saque.', 'A rede fica a 2,43 m (masculino) e 2,24 m (feminino).', 'O líbero é um defensor especialista, com uniforme diferente, que não saca, ataca nem bloqueia.'],
  pen: ['Faltas comuns: toque na rede, invasão, condução da bola, dupla e quatro toques.'], fonte: B + 'tudo-sobre-volei-de-quadra-regras-fundamentos-e-historia.html' },

{ id: 'volei-de-praia', nome: 'Vôlei de Praia', cat: C1, ico: '🏐', al: ['volei de praia', 'voleibol de praia'],
  resumo: 'Vôlei jogado na areia, em duplas.',
  jog: '2 por equipe, sem substituições, em quadra de 16 m x 8 m.', dur: 'Disputado em sets.',
  pont: 'Sets até 21 pontos com 2 de diferença; o terceiro set vai até 15. Vence a dupla que ganhar 2 sets.',
  regras: ['Troca de lado a cada 7 pontos nos dois primeiros sets e a cada 5 no terceiro.', 'O bloqueio conta como um dos três toques da equipe.', 'A rede tem as mesmas alturas do vôlei de quadra.', 'Não há posições fixas nem líbero; as duas jogadoras ou jogadores atuam em toda a quadra.'],
  pen: ['Toque duplo e condução da bola são faltas, com critério de arbitragem mais rígido que na quadra.'], fonte: B + 'volei-de-praia-regras-fundamentos-e-historia.html' },

{ id: 'futevolei', nome: 'Futevôlei', cat: C2, ico: '🏐', al: ['futevolei'],
  resumo: 'Mistura de futebol e vôlei: a bola passa por cima da rede sem o uso das mãos e dos braços.',
  jog: 'Em geral duplas (também há formatos de 3 ou 4) na areia.', dur: 'Disputado em sets.',
  pont: 'Pontuação por rally (todo rally gera ponto). Vence o set quem atingir o número de pontos do regulamento com 2 de vantagem.',
  regras: ['Pode-se usar pés, cabeça, peito, coxas e ombros; mãos e braços não.', 'São permitidos até 3 toques por equipe antes de passar a bola.', 'O saque é feito com o pé, e o jogador pode apoiar a bola na areia antes.', 'A rede é mais baixa que a do vôlei; confirme altura e pontos do set no regulamento da competição.'],
  pen: ['Tocar a bola com a mão ou o braço, invadir a quadra adversária e tocar na rede são faltas.'] },

{ id: 'basquete', nome: 'Basquete', cat: C1, ico: '🏀', al: ['basquetebol'],
  resumo: 'Duas equipes tentam arremessar a bola na cesta adversária, localizada a 3,05 m do chão.',
  jog: '5 por equipe em quadra (28 m x 15 m nas regras FIBA).', dur: '4 quartos de 10 minutos (FIBA) ou 12 minutos (NBA); prorrogações de 5 minutos.',
  pont: 'Cesta de quadra vale 2 pontos, de fora do arco 3 e lance livre 1.',
  regras: ['É preciso driblar para se deslocar com a bola; andar com ela é violação (passos).', 'Posse de bola de 24 segundos para finalizar o ataque.', 'A bola deve passar do campo de defesa para o de ataque em até 8 segundos.', 'Cada jogador pode cometer 5 faltas (6 na NBA) antes de ser excluído.', 'Após o limite de faltas coletivas no período, o adversário cobra lances livres.'],
  pen: ['Falta técnica por conduta antidesportiva, com lance livre e posse para o adversário.'], fonte: B + 'regras-do-basquete-nba-fiba-guia-completo.html' },

{ id: 'basquete-3x3', nome: 'Basquete 3x3', cat: C1, ico: '🏀', al: ['3x3'],
  resumo: 'Versão de rua do basquete, em meia quadra e com uma única cesta.',
  jog: '3 por equipe, com 1 reserva.', dur: '10 minutos corridos ou até uma equipe chegar a 21 pontos.',
  pont: 'Cesta dentro do arco vale 1 ponto e de fora do arco vale 2.',
  regras: ['A posse é de 12 segundos.', 'Depois de cesta ou rebote defensivo, a bola precisa sair do arco antes de atacar.', 'Em caso de empate, a prorrogação termina quando uma equipe marca 2 pontos.', 'Faltas acumuladas levam a lances livres a partir de determinado limite por equipe.'],
  pen: ['Faltas técnicas e antidesportivas geram lance livre e posse de bola.'], fonte: B + 'regras-do-basquete-3x3-guia-completo.html' },

{ id: 'handebol', nome: 'Handebol', cat: C1, ico: '🤾', al: ['handball'],
  resumo: 'Duas equipes passam a bola com as mãos e tentam marcar gols no gol adversário.',
  jog: '7 por equipe (6 na linha e 1 goleiro), em quadra de 40 m x 20 m.', dur: '2 tempos de 30 minutos.',
  pont: 'Cada gol vale 1 ponto.',
  regras: ['O jogador pode dar até 3 passos e segurar a bola por até 3 segundos.', 'Somente o goleiro pode entrar na área de 6 m; a bola pode ser lançada em suspensão sobre ela.', 'É permitido driblar, mas não se pode driblar de novo depois de segurar a bola.', 'O jogo passivo (sem tentar atacar) leva à perda da posse.'],
  pen: ['Exclusão de 2 minutos por faltas graves ou reincidência.', 'Cartão vermelho leva à expulsão definitiva.'], fonte: B + 'tudo-sobre-handebol-regras-e-fundamentos.html' },

{ id: 'rugby', nome: 'Rugby', cat: C1, ico: '🏉', al: ['rugby union', 'rugby sevens'],
  resumo: 'Esporte de contato em que se avança com a bola nas mãos, passando-a sempre para trás ou para o lado.',
  jog: '15 por equipe no rugby union; 7 por equipe no rugby sevens.', dur: '2 tempos de 40 minutos (union) ou 7 minutos (sevens).',
  pont: 'Try (colocar a bola no chão na área de em-gol) vale 5; conversão 2; pênalti e drop 3.',
  regras: ['O passe da bola é sempre para trás ou para o lado; para frente, só com chute.', 'A bola é disputada em formações como scrum e lineout.', 'O tackle (derrubada) só é permitido no portador da bola e abaixo dos ombros.', 'O jogador derrubado deve soltar a bola.'],
  pen: ['Tackle perigoso, alto ou sem o uso dos braços é punido com pênalti, cartão amarelo (10 minutos) ou vermelho.'], fonte: B + 'como-se-joga-rugby-regras-posicoes-e-curiosidades.html' },

{ id: 'futebol-americano', nome: 'Futebol americano', cat: C1, ico: '🏈', al: ['nfl'],
  resumo: 'Ataque e defesa se alternam: o ataque avança a bola em direção à end zone adversária.',
  jog: '11 por equipe em campo, de 100 jardas.', dur: '4 quartos de 15 minutos (NFL).',
  pont: 'Touchdown vale 6, ponto extra 1 (ou 2 com jogada), field goal 3 e safety 2.',
  regras: ['O ataque tem 4 tentativas (downs) para avançar 10 jardas.', 'Se conseguir, ganha novo conjunto de 4 downs; se não, perde a posse.', 'A bola avança correndo ou por passe para frente (um por jogada, atrás da linha de scrimmage).', 'O jogo para quando o portador é derrubado ou sai de campo.'],
  pen: ['Faltas como holding, offside e interferência rendem recuo de jardas e, às vezes, novo down.'], fonte: B + 'regras-futebol-americano-nfl-guia-completo.html' },

{ id: 'beisebol', nome: 'Beisebol', cat: C1, ico: '⚾', al: ['baseball'],
  resumo: 'Uma equipe rebate a bola e corre pelas bases enquanto a outra defende.',
  jog: '9 por equipe em campo.', dur: '9 entradas (innings), sem tempo fixo.',
  pont: 'Cada corredor que passa por todas as bases e volta à home plate marca 1 ponto (run).',
  regras: ['Cada meia-entrada termina com 3 eliminações (outs).', 'O rebatedor é eliminado com 3 strikes ou se a bola rebatida for apanhada no ar.', 'Quatro bolas (balls) dão ao rebatedor a primeira base.', 'O home run (bola fora do campo, em jogo) vale a corrida de todos os que estão nas bases e a do rebatedor.'],
  pen: ['Interferência e bola presa fora das regras geram eliminação ou avanço de bases, conforme o caso.'], fonte: B + 'regras-beisebol-como-jogar-baseball.html' },

{ id: 'softbol', nome: 'Softbol', cat: C1, ico: '🥎', al: ['softball'],
  resumo: 'Parente do beisebol, com campo menor, bola maior e arremesso por baixo.',
  jog: '9 por equipe em campo (10 na versão de arremesso lento).', dur: '7 entradas.',
  pont: 'Pontos (runs) por corredores que completam o circuito das bases.',
  regras: ['O arremesso é feito por baixo (underhand).', 'As bases são mais próximas do que no beisebol.', 'Mesma lógica de 3 outs por meia-entrada.', 'Em campeonatos, pode haver desempate com um corredor já posicionado na segunda base.'],
  pen: ['Arremesso irregular e interferência são punidos com bola, avanço de bases ou eliminação.'], fonte: B + 'regras-do-softbol-historia-fundamentos-e-regras.html' },

{ id: 'hoquei-no-gelo', nome: 'Hóquei no gelo', cat: C1, ico: '🏒', al: ['hoquei', 'nhl'],
  resumo: 'Equipes em patins disputam um disco (puck) para marcar gols.',
  jog: '6 por equipe em jogo (5 na linha e 1 goleiro).', dur: '3 períodos de 20 minutos.',
  pont: 'Cada gol vale 1 ponto.',
  regras: ['O disco é conduzido com tacos; é proibido jogá-lo com a mão para frente.', 'Icing: lançar o disco de seu campo até o fundo adversário sem que ninguém o toque gera paralisação.', 'Impedimento (offside): atacantes não podem entrar na zona de ataque antes do disco.', 'Substituições são livres, com o jogo em andamento.'],
  pen: ['Penalidades de 2 ou 5 minutos mandam o jogador à caixa de punição.'], fonte: B + 'regras-da-nhl-como-jogar-hoquei-no-gelo.html' },

{ id: 'polo-aquatico', nome: 'Polo aquático', cat: C5, ico: '🤽', al: ['polo aquatico'],
  resumo: 'Handebol na piscina: duas equipes tentam marcar gols nadando e passando a bola.',
  jog: '7 por equipe (6 na linha e 1 goleiro).', dur: '4 períodos de 8 minutos.',
  pont: 'Cada gol vale 1 ponto.',
  regras: ['Apenas o goleiro pode tocar a bola com as duas mãos; os demais usam uma só.', 'A posse de bola é de 30 segundos.', 'Não se pode tocar o fundo da piscina nem segurar o adversário sem a bola.', 'O jogador não pode afundar nem agarrar quem não está com a bola.'],
  pen: ['Faltas graves levam à exclusão temporária (20 segundos) e ao pênalti.'], fonte: B + 'regras-do-polo-aquatico-curiosidades-beneficio-natacao-historia-e-federacao.html' },

{ id: 'peteca', nome: 'Peteca', cat: C2, ico: '🏸', al: [],
  resumo: 'Esporte brasileiro em que a peteca é rebatida com a palma da mão por cima da rede.',
  jog: 'Simples, duplas ou equipes, conforme a modalidade.', dur: 'Disputado em sets.',
  pont: 'Pontuação por rally; vence o set quem atingir o número de pontos definido com vantagem mínima.',
  regras: ['A peteca deve ser rebatida com uma das mãos, sem ser segurada.', 'Não é permitido tocar na rede nem invadir a quadra adversária.', 'A peteca precisa cair dentro das linhas da quadra para valer o ponto.', 'Altura da rede, pontos do set e número de toques variam por categoria; confirme no regulamento.'],
  pen: ['Segurar, conduzir ou rebater com outra parte do corpo é falta.'], fonte: B + 'regras-para-jogar-peteca-como-jogar.html' },

{ id: 'curling', nome: 'Curling', cat: C1, ico: '🥌', al: [],
  resumo: 'Equipes deslizam pedras de granito no gelo para parar o mais perto possível do centro do alvo.',
  jog: '4 por equipe (jogo tradicional).', dur: '10 parciais (ends).',
  pont: 'Ao fim de cada parcial, a equipe com a pedra mais próxima do centro marca 1 ponto por pedra mais perto que a melhor do adversário.',
  regras: ['Cada jogador lança 2 pedras por parcial, alternando com o adversário.', 'Os companheiros varrem o gelo à frente da pedra para controlar a velocidade e a curva.', 'A pedra tem cerca de 20 kg e deve ser solta antes da linha de lançamento.', 'Vence quem somar mais pontos após as parciais.'],
  pen: ['Tocar a pedra em movimento ou lançar fora das regras anula a jogada.'], fonte: B + 'aprenda-a-jogar-curling-conheca-todas-as-regras.html' },

{ id: 'polo', nome: 'Polo equestre', cat: C1, ico: '🏇', al: ['polo'],
  resumo: 'Duas equipes a cavalo usam tacos para levar a bola ao gol adversário.',
  jog: '4 por equipe, cada um com seus cavalos.', dur: 'Jogo em períodos chamados chukkers (até 6, de cerca de 7 minutos).',
  pont: 'Cada gol vale 1 ponto.',
  regras: ['A linha da bola define quem tem preferência de passagem; cruzá-la de forma perigosa é falta.', 'O taco só pode ser usado com a mão direita.', 'Os times trocam de lado após cada gol.', 'Os jogadores trocam de cavalo entre os períodos.'],
  pen: ['Faltas perigosas geram tiros de penalidade a favor do adversário.'], fonte: B + 'aprenda-a-jogar-polo-conheca-as-regras-do-polo-esporte.html' },

{ id: 'bocha', nome: 'Bocha', cat: C3, ico: '🎯', al: ['bochas', 'bocce'],
  resumo: 'Esporte de precisão: lançam-se bolas para ficar o mais perto possível da bola menor (bolim).',
  jog: 'Individual, duplas ou quartetos.', dur: 'Disputada em parciais até certa pontuação.',
  pont: 'Marca ponto a equipe cujas bolas ficam mais próximas do bolim que a melhor bola do adversário.',
  regras: ['O bolim é lançado primeiro; em seguida, as equipes alternam seus lançamentos.', 'Quem tem a bola mais perto do bolim fica “por dentro” e a outra equipe joga até passá-la.', 'Em algumas variações é permitido bater nas bolas adversárias; confirme no regulamento.', 'Vence quem atingir primeiro a pontuação definida no regulamento.'],
  pen: ['Lançamentos fora da área e bolas que saem do campo são anulados.'], fonte: B + 'regras-da-bocha-como-jogar-taticas-e-estrategias.html' },

/* ---------------- Raquete e rede ---------------- */
{ id: 'tenis', nome: 'Tênis', cat: C2, ico: '🎾', al: ['tenis'],
  resumo: 'Dois jogadores (ou duplas) trocam bolas por cima da rede dentro dos limites da quadra.',
  jog: '1 contra 1 (simples) ou 2 contra 2 (duplas).', dur: 'Disputado em sets; melhor de 3 ou de 5.',
  pont: 'Games contam 15, 30, 40 e game; com 40 iguais, é preciso abrir vantagem de 2 pontos. O set vai a 6 games com 2 de diferença (tie-break em 6 a 6).',
  regras: ['O saque é feito na diagonal, com duas tentativas.', 'A bola pode quicar uma vez no chão antes da devolução.', 'Os jogadores trocam de lado a cada game ímpar.', 'Bola na linha é considerada dentro.'],
  pen: ['Dupla falta perde o ponto; também se perde ponto por tocar na rede ou rebater a bola antes de ela passar a rede.'], fonte: B + 'regras-jogo-de-tenis-guia-completo.html' },

{ id: 'tenis-de-mesa', nome: 'Tênis de mesa', cat: C2, ico: '🏓', al: ['ping pong', 'pingue-pongue'],
  resumo: 'Raquetes pequenas e bola leve, em uma mesa dividida por rede.',
  jog: 'Simples ou duplas.', dur: 'Partida em sets, normalmente melhor de 5 ou de 7.',
  pont: 'Sets até 11 pontos, com 2 de diferença. Cada rally gera ponto.',
  regras: ['O saque alterna a cada 2 pontos, e a bola deve quicar primeiro no lado de quem saca.', 'A mesa mede 2,74 m x 1,525 m, e a rede tem 15,25 cm de altura.', 'A bola tem 40 mm de diâmetro.', 'No set decisivo, os jogadores trocam de lado quando um deles chega a 5 pontos.'],
  pen: ['Ponto para o adversário se a bola tocar a rede no saque e não passar, ou se o jogador tocar a mesa com a mão livre.'], fonte: B + 'regras-do-tenis-de-mesa-como-jogar-ping-pong.html' },

{ id: 'beach-tenis', nome: 'Beach Tênis', cat: C2, ico: '🎾', al: ['beach tenis'],
  resumo: 'Tênis na areia, com raquete sem cordas e bola de tênis de menor pressão.',
  jog: 'Duplas (também há simples).', dur: 'Partida em sets, em geral melhor de 3.',
  pont: 'Pontuação como no tênis (15, 30, 40 e game). Muitos regulamentos usam o ponto decisivo no 40 a 40; confirme no regulamento.',
  regras: ['O saque é feito por baixo, da altura da cintura para baixo, com uma única tentativa.', 'A bola pode ser rebatida no ar, antes de quicar.', 'A rede fica a cerca de 1,70 m e a quadra tem 16 m x 8 m (duplas).', 'Não se pode tocar na rede nem invadir a quadra adversária.'],
  pen: ['Perde o ponto quem rebater a bola fora, na rede ou depois do segundo quique.'] },

{ id: 'badminton', nome: 'Badminton', cat: C2, ico: '🏸', al: ['badmínton'],
  resumo: 'Raquetes leves e uma peteca (shuttlecock) rebatida por cima da rede.',
  jog: 'Simples ou duplas.', dur: 'Melhor de 3 sets.',
  pont: 'Sets até 21 pontos com 2 de diferença, limitados a 30. Cada rally gera ponto.',
  regras: ['O saque é feito abaixo da cintura, na diagonal.', 'O jogador que vence o rally saca no seguinte.', 'A rede tem 1,55 m nas laterais e 1,524 m no centro.', 'A peteca deve cair dentro das linhas.'],
  pen: ['Tocar na rede, atingir o adversário com a raquete ou rebater duas vezes seguidas é falta.'] },

{ id: 'squash', nome: 'Squash', cat: C2, ico: '🎾', al: [],
  resumo: 'Dois jogadores alternam rebatidas contra as paredes de uma quadra fechada.',
  jog: 'Simples (também há duplas).', dur: 'Em geral melhor de 5 games.',
  pont: 'Games até 11 pontos, com 2 de diferença. Cada rally gera ponto.',
  regras: ['A bola pode tocar as paredes laterais e de fundo antes da rebatida, mas deve atingir a parede frontal acima da linha baixa.', 'O jogador deve dar espaço ao adversário para jogar a bola e ir até ela.', 'Quando o espaço é negado, o árbitro marca let (repetição do ponto) ou stroke (ponto para o prejudicado).'],
  pen: ['A bola que toca o chão duas vezes, ou sai para fora, perde o ponto.'] },

/* ---------------- Individuais e de precisão ---------------- */
{ id: 'atletismo', nome: 'Atletismo', cat: C3, ico: '🏃', al: ['corrida', 'maratona'],
  resumo: 'Conjunto de provas de pista (corridas), de campo (saltos e arremessos) e combinadas.',
  jog: 'Individual ou revezamentos.', dur: 'Depende da prova.',
  pont: 'Em corridas vence quem cruzar a linha primeiro; em saltos e arremessos, quem alcançar a melhor marca.',
  regras: ['Provas de pista: 100 m, 200 m, 400 m, 800 m, 1.500 m, barreiras, obstáculos, revezamentos e maratona.', 'Provas de campo: salto em distância, triplo, em altura, com vara, arremesso de peso, lançamento de disco, dardo e martelo.', 'Provas combinadas: decatlo (masculino) e heptatlo (feminino), com pontos por prova.', 'Em saltos e arremessos, o atleta tem 3 tentativas (os melhores avançam para mais 3).'],
  pen: ['Queimar a largada leva à desclassificação; invadir a raia, pisar fora na zona de impulsão ou no círculo anulam a tentativa.'], fonte: B + 'atletismo-regras-modalidades-corrida-arremessos-e-regras.html' },

{ id: 'natacao', nome: 'Natação', cat: C5, ico: '🏊', al: [],
  resumo: 'Provas de velocidade e resistência nos estilos livre, costas, peito e borboleta, além do medley.',
  jog: 'Individual ou revezamentos.', dur: 'Depende da prova (de 50 m a 1.500 m na piscina).',
  pont: 'Vence quem tocar a borda da piscina primeiro, validado por cronometragem eletrônica.',
  regras: ['A piscina olímpica tem 50 m; a curta, 25 m.', 'Em cada estilo há regras de braçada, pernada e viradas específicas.', 'No medley individual, os estilos seguem a ordem: borboleta, costas, peito e livre.', 'No revezamento, o nadador seguinte só pode sair depois de o anterior tocar a borda.'],
  pen: ['Largada antes do sinal e execução incorreta do estilo levam à desclassificação.'], fonte: B + 'natacao-regras-beneficios-treinos-calorias.html' },

{ id: 'triatlo', nome: 'Triatlo', cat: C3, ico: '🏊', al: ['triathlon'],
  resumo: 'Prova contínua de natação, ciclismo e corrida, nessa ordem.',
  jog: 'Individual (há revezamentos mistos).', dur: 'Depende da distância; o tempo das transições entra no total.',
  pont: 'Vence quem completar as três etapas no menor tempo total.',
  regras: ['Distância olímpica: 1,5 km de natação, 40 km de ciclismo e 10 km de corrida.', 'As transições (T1 e T2) acontecem em área específica e contam no tempo.', 'O capacete é obrigatório e deve ser afivelado antes de pegar a bicicleta.', 'Em provas sem vácuo (draft-illegal), é proibido pedalar na roda de outro atleta.'],
  pen: ['Penalidades de tempo por vácuo, e desclassificação por trapaça ou uso indevido do equipamento.'], fonte: B + 'regras-do-triatlo-tudo-sobre-treinamento-e-historia-do-triathlon.html' },

{ id: 'ciclismo', nome: 'Ciclismo e mountain bike', cat: C6, ico: '🚴', al: ['mountain bike', 'mtb', 'bmx'],
  resumo: 'Provas em estrada, pista, trilha (mountain bike) e BMX.',
  jog: 'Individual ou por equipes.', dur: 'Depende da modalidade.',
  pont: 'Vence quem cruzar a linha de chegada primeiro ou fizer o menor tempo, conforme a prova.',
  regras: ['O capacete é obrigatório em competições.', 'Em estrada há provas em linha e contrarrelógio.', 'No cross-country (XCO), o circuito é fechado e disputado em voltas.', 'Em provas de pista (velódromo), há velocidade, perseguição e prova de pontos.'],
  pen: ['Ajuda externa irregular, empurrões e bloqueio do adversário geram punição ou desclassificação.'], fonte: B + 'ciclismo-e-mountain-bike-regras-dicas-e-beneficios.html' },

{ id: 'tiro-com-arco', nome: 'Tiro com arco', cat: C3, ico: '🏹', al: ['arco e flecha'],
  resumo: 'Atiradores lançam flechas em um alvo circular, buscando a região mais próxima do centro.',
  jog: 'Individual, duplas ou equipes.', dur: 'Séries de flechas com tempo limite por flecha.',
  pont: 'Cada anel vale de 1 a 10 pontos; o centro (X) serve de critério de desempate.',
  regras: ['No arco olímpico, a distância é de 70 m para um alvo de 122 cm.', 'Nas eliminatórias individuais, o confronto é por sets de 3 flechas: vencer o set vale 2 pontos, empatar 1.', 'Vence a partida quem chegar primeiro a 6 pontos de set.', 'O atirador deve ficar com os dois pés atrás da linha de tiro.'],
  pen: ['Flecha atirada fora do tempo ou antes do sinal pode ser anulada.'], fonte: B + 'regras-do-tiro-com-arco-fundamentos-historia-e-equipamentos.html' },

{ id: 'golfe', nome: 'Golfe', cat: C3, ico: '⛳', al: [],
  resumo: 'Jogador percorre um percurso de buracos com o menor número possível de tacadas.',
  jog: 'Individual ou em duplas/equipes.', dur: 'Um percurso completo tem 18 buracos.',
  pont: 'Vence quem fizer o menor número total de tacadas (stroke play), ou quem ganhar mais buracos (match play).',
  regras: ['Cada buraco tem um número de tacadas de referência, o par.', 'Birdie é uma tacada abaixo do par e bogey, uma acima.', 'A bola deve ser jogada como se encontra, salvo situações previstas nas regras.', 'Cada jogador pode levar até 14 tacos.'],
  pen: ['Bola fora dos limites (out of bounds) rende 1 tacada de penalidade, com nova tacada do ponto anterior.'], fonte: B + 'as-regras-do-golfe-aprenda-como-jogar-golfe.html' },

{ id: 'xadrez', nome: 'Xadrez', cat: C3, ico: '♟️', al: [],
  resumo: 'Jogo de estratégia entre dois jogadores, praticado como esporte da mente.',
  jog: '2 jogadores, com 16 peças cada, em tabuleiro de 64 casas.', dur: 'Controlada por relógio; o tempo varia (clássico, rápido e blitz).',
  pont: 'Vitória vale 1 ponto, empate 1/2 e derrota 0.',
  regras: ['Vence quem dá xeque-mate no rei adversário.', 'Brancas começam e os jogadores alternam as jogadas.', 'Há lances especiais: roque, en passant e promoção do peão.', 'Empate por afogamento, repetição de posição, regra dos 50 lances ou acordo.'],
  pen: ['Peça tocada deve ser movida (regra do toque); perde-se a partida ao esgotar o tempo no relógio.'], fonte: B + 'regras-como-jogar-xadrez.html' },

{ id: 'esgrima', nome: 'Esgrima', cat: C4, ico: '🤺', al: [],
  resumo: 'Duelo com armas de lâmina: florete, espada e sabre.',
  jog: 'Individual ou por equipes.', dur: 'Partidas em até 15 toques (eliminatórias) ou 5 (fase de grupos).',
  pont: 'Marca ponto quem acerta o toque válido na área permitida de cada arma.',
  regras: ['No florete, só vale o toque no tronco; no sabre, da cintura para cima; na espada, em qualquer parte do corpo.', 'Florete e sabre têm prioridade (direito de ataque); na espada, vale o toque mais rápido, com tolerância de simultaneidade.', 'O equipamento eletrônico registra os toques.', 'O combate acontece em uma pista de 14 m de comprimento.'],
  pen: ['Sair da pista, cartão amarelo e vermelho geram toque para o adversário.'] },

{ id: 'halterofilismo', nome: 'Halterofilismo', cat: C3, ico: '🏋️', al: ['levantamento de peso'],
  resumo: 'Atletas levantam a maior carga possível em dois movimentos.',
  jog: 'Individual, por categoria de peso corporal.', dur: 'Cada atleta tem 3 tentativas em cada movimento.',
  pont: 'Soma-se a melhor carga válida do arranco com a melhor do arremesso; vence o maior total.',
  regras: ['Arranco: a barra sobe do chão até acima da cabeça em um só movimento.', 'Arremesso: levanta-se a barra até os ombros e depois acima da cabeça.', 'Os juízes validam com luzes brancas e vermelhas; é preciso controle e imobilidade no final.', 'Quem não completar uma carga válida em um dos movimentos fica sem total.'],
  pen: ['Movimentos incompletos, barra que cai ou cotovelos dobrados tornam a tentativa nula.'] },

{ id: 'ginastica-artistica', nome: 'Ginástica artística', cat: C3, ico: '🤸', al: ['ginastica'],
  resumo: 'Séries de movimentos em aparelhos, avaliadas por juízes.',
  jog: 'Individual ou por equipes.', dur: 'Cada aparelho tem uma rotina curta.',
  pont: 'A nota final soma a dificuldade (nota D) e a execução (nota E), com descontos por erros.',
  regras: ['Aparelhos masculinos: solo, cavalo com alças, argolas, salto, barras paralelas e barra fixa.', 'Aparelhos femininos: salto, barras assimétricas, trave e solo.', 'Quedas, passos na aterrissagem e saídas da área geram descontos.'],
  pen: ['Sair da área de solo ou deixar de cumprir exigências de composição reduz a nota.'] },

/* ---------------- Lutas ---------------- */
{ id: 'judo', nome: 'Judô', cat: C4, ico: '🥋', al: ['judo'],
  resumo: 'Arte marcial de projeções, imobilizações e finalizações.',
  jog: 'Individual, por categoria de peso.', dur: 'Combate de 4 minutos, com golden score em caso de empate.',
  pont: 'Ippon encerra o combate; waza-ari é uma pontuação parcial.',
  regras: ['Ippon é dado por projeção com força, velocidade e controle, imobilização por 20 segundos ou finalização.', 'Vence o combate quem tiver mais pontos ao final, ou o primeiro a marcar no golden score.', 'Pegadas e movimentos proibidos são punidos com shido (advertência).'],
  pen: ['Acúmulo de shidos gera derrota; golpes proibidos levam à desclassificação.'], fonte: B + 'regras-do-judo-guia-completo.html' },

{ id: 'karate', nome: 'Karatê', cat: C4, ico: '🥋', al: ['karate'],
  resumo: 'Arte marcial de golpes com mãos e pés, disputada em kata (formas) e kumite (combate).',
  jog: 'Individual ou por equipes.', dur: 'Kumite com cerca de 3 minutos (confira a categoria).',
  pont: 'Ippon vale 3, waza-ari 2 e yuko 1 ponto.',
  regras: ['Chute à cabeça vale 3 pontos; chute ao corpo, 2; soco, 1.', 'O combate termina antes se um lutador abrir 8 pontos de vantagem.', 'No kata, os juízes avaliam técnica e desempenho atlético.'],
  pen: ['Contato excessivo e golpes em áreas proibidas geram advertência ou desclassificação.'], fonte: B + 'regras-do-karate-guia-completo-faixa-preta.html' },

{ id: 'taekwondo', nome: 'Taekwondo', cat: C4, ico: '🥋', al: [],
  resumo: 'Arte marcial coreana conhecida pelos chutes altos e velozes.',
  jog: 'Individual, por categoria de peso.', dur: '3 rounds de 2 minutos.',
  pont: 'Golpes válidos no protetor de tronco e na cabeça marcam pontos; golpes à cabeça e com giro valem mais.',
  regras: ['Os protetores eletrônicos registram a força mínima do golpe.', 'Socos válidos no tronco valem 1 ponto.', 'Vence quem somar mais pontos, abrir grande vantagem ou nocautear.'],
  pen: ['Golpes abaixo da cintura, segurar e empurrar geram faltas e perda de pontos.'], fonte: B + 'regras-taekwondo-arte-marcial-beneficios.html' },

{ id: 'jiu-jitsu', nome: 'Jiu-jitsu', cat: C4, ico: '🥋', al: ['bjj', 'jiu jitsu'],
  resumo: 'Luta de solo e quedas, com finalizações (chaves e estrangulamentos).',
  jog: 'Individual, por faixa, idade e peso.', dur: 'De 5 a 10 minutos, conforme a faixa.',
  pont: 'Queda e raspagem valem 2; passagem de guarda 3; montada e pegada de costas 4.',
  regras: ['A luta termina na hora se houver finalização ou desistência.', 'Vantagens e punições desempatam quando os pontos são iguais.', 'Golpes proibidos variam por faixa e idade.'],
  pen: ['Faltas técnicas e fuga da luta geram punições e pontos para o oponente.'], fonte: B + 'jiu-jitsu-regras-tecnicas-faixas-golpes-guia-completo.html' },

{ id: 'muay-thai', nome: 'Muay thai', cat: C4, ico: '🥊', al: ['muay'],
  resumo: 'Luta tailandesa que usa punhos, cotovelos, joelhos e canelas.',
  jog: 'Individual, por categoria de peso.', dur: 'Em lutas profissionais, 5 rounds de 3 minutos.',
  pont: 'Pontos por golpes limpos, técnica, domínio e agressividade; vitória também por nocaute ou desistência.',
  regras: ['O clinch (agarre) permite golpes de joelho em condições específicas.', 'Cabeçadas e golpes em regiões proibidas são ilegais.', 'Os árbitros avaliam o equilíbrio dos golpes e as quedas.'],
  pen: ['Advertências por faltas, com perda de pontos ou desclassificação em casos graves.'], fonte: B + 'regras-do-muay-guia-completo.html' },

{ id: 'boxe', nome: 'Boxe', cat: C4, ico: '🥊', al: [],
  resumo: 'Luta com socos, em ringue, usando luvas.',
  jog: 'Individual, por categoria de peso.', dur: 'Rounds de 3 minutos (de 3 rounds no amador a 12 no profissional).',
  pont: 'Em cada round, o vencedor recebe 10 pontos e o oponente 9 ou menos.',
  regras: ['Só são válidos os golpes acima da cintura, com a parte frontal da luva.', 'Knockdown dá ao árbitro o direito de iniciar a contagem.', 'A luta termina por nocaute, nocaute técnico ou decisão dos juízes.'],
  pen: ['Golpes baixos, cabeçadas e segurar são faltas com perda de pontos ou desclassificação.'] },

{ id: 'mma', nome: 'MMA', cat: C4, ico: '🥊', al: ['ufc', 'artes marciais mistas'],
  resumo: 'Combate que mistura golpes em pé, lutas agarradas e luta de solo.',
  jog: 'Individual, por categoria de peso.', dur: '3 rounds de 5 minutos (5 em lutas principais).',
  pont: 'Critério de 10 pontos por round, avaliando golpes, controle e agressividade.',
  regras: ['A vitória pode vir por nocaute, finalização, parada do árbitro ou decisão.', 'Cada atleta usa luvas leves e protetor bucal.', 'Há uma lista de golpes proibidos, como cabeçada e dedo nos olhos.'],
  pen: ['Faltas levam a advertência, perda de ponto e desclassificação em casos graves.'] },

/* ---------------- Aquáticos e náuticos ---------------- */
{ id: 'canoagem', nome: 'Canoagem', cat: C5, ico: '🛶', al: ['canoagem slalom', 'canoagem velocidade'],
  resumo: 'Provas em caiaque e canoa, de velocidade em águas calmas e slalom em águas agitadas.',
  jog: 'Individual, duplas (C2, K2) ou quartetos (K4).', dur: 'De cerca de 200 m a 1.000 m na velocidade.',
  pont: 'Na velocidade, vence quem cruzar a linha primeiro; no slalom, o menor tempo com penalidades.',
  regras: ['No slalom, o atleta passa por portas na ordem e no sentido indicados.', 'Tocar uma porta acrescenta 2 segundos; perder uma porta, 50 segundos.', 'O colete salva-vidas e o capacete são obrigatórios nos esportes de águas bravas.'],
  pen: ['Largada falsa e desvio do percurso levam a punições ou desclassificação.'], fonte: B + 'esporte-canoagem-regras-slalom-velocidade-remo-e-modalidades.html' },

{ id: 'surf', nome: 'Surf', cat: C5, ico: '🏄', al: [],
  resumo: 'Atletas surfam ondas em baterias, avaliados por juízes.',
  jog: 'Baterias com 2 a 4 surfistas.', dur: 'Cerca de 20 a 30 minutos por bateria.',
  pont: 'Cada onda recebe nota de 0 a 10; vale a soma das duas melhores.',
  regras: ['Os critérios são dificuldade, comprometimento, variedade de manobras, velocidade, potência e fluidez.', 'O surfista mais perto do pico tem a prioridade na onda.', 'Cada atleta pode pegar o número de ondas que quiser dentro do tempo.'],
  pen: ['Interferir na onda de outro surfista leva à perda de pontos.'], fonte: B + 'tudo-sobre-surf-manobras-equipamentos-competicao-e-pranchas.html' },

{ id: 'windsurf', nome: 'Windsurf', cat: C5, ico: '🏄', al: [],
  resumo: 'Prancha com vela, movida pela força do vento.',
  jog: 'Individual.', dur: 'Regatas em percurso marcado por boias.',
  pont: 'Pontua-se pela colocação em cada regata; vence a menor soma.',
  regras: ['O vento define a direção do percurso, que inclui contravento e popa.', 'Há regras de preferência para evitar colisões.', 'Alguns formatos têm provas de slalom, onda e freestyle.'],
  pen: ['A infração de regras de preferência exige uma volta de penalidade.'], fonte: B + 'tudo-sobre-windsurf-regras-equipamentos-historia-prancha.html' },

{ id: 'vela', nome: 'Vela e iatismo', cat: C5, ico: '⛵', al: ['iatismo'],
  resumo: 'Regatas de barcos a vela em percurso demarcado por boias.',
  jog: 'Individual ou em tripulações.', dur: 'Várias regatas por campeonato.',
  pont: 'Pontuação por colocação (1º = 1 ponto); a menor soma vence, descartando-se o pior resultado.',
  regras: ['O barco em bordo de boreste (vento pelo lado direito) tem preferência sobre o de bombordo.', 'O barco a barlavento deve dar passagem ao de sotavento.', 'O percurso inclui orça (contra o vento) e popa (a favor do vento).'],
  pen: ['Penalidade de giros e retirada da regata em casos graves.'], fonte: B + 'tudo-sobre-iatismo-e-vela-olimpica-regras-e-historia.html' },

/* ---------------- Radicais, velocidade e outdoor ---------------- */
{ id: 'skate', nome: 'Skate', cat: C6, ico: '🛹', al: [],
  resumo: 'Manobras sobre o shape em pistas de street (obstáculos) ou park (bowls).',
  jog: 'Individual.', dur: 'Corridas (runs) de cerca de 45 segundos e tentativas de manobra.',
  pont: 'Notas de 0 a 100 por juízes, considerando dificuldade, execução, altura, fluidez e criatividade.',
  regras: ['No street, usa-se escadas, corrimãos e rampas.', 'No park, o atleta explora bowls e transições.', 'O resultado soma ou considera as melhores notas, conforme o formato.'],
  pen: ['Quedas e manobras incompletas reduzem a nota.'], fonte: B + 'skate-aprender-manobras-historia-e-x-games-e-regras.html' },

{ id: 'motocross', nome: 'Motocross', cat: C6, ico: '🏍️', al: [],
  resumo: 'Corridas de motos em pistas de terra com saltos e curvas.',
  jog: 'Individual.', dur: 'Baterias por tempo mais voltas.',
  pont: 'Pontos por colocação em cada bateria; vence quem somar mais.',
  regras: ['Amarela: perigo, proibida a ultrapassagem.', 'Vermelha: parada imediata da corrida.', 'Azul: piloto mais rápido vai ultrapassar.', 'Quadriculada: fim da prova.'],
  pen: ['Ignorar bandeiras ou cortar caminho gera punição ou desclassificação.'], fonte: B + 'motocross-equipamento-regras-e-cor-das-bandeiras.html' },

{ id: 'hipismo', nome: 'Hipismo', cat: C6, ico: '🐎', al: ['salto', 'adestramento'],
  resumo: 'Provas equestres de salto, adestramento e concurso completo.',
  jog: 'Cavaleiro e cavalo (individual ou por equipes).', dur: 'Depende da prova.',
  pont: 'No salto, vence quem tiver menos pontos de penalização e o melhor tempo.',
  regras: ['Derrubar uma barra rende 4 pontos de penalização.', 'Recusa ou desobediência do cavalo gera penalidades.', 'Ultrapassar o tempo permitido soma penalidades.', 'No adestramento, juízes avaliam harmonia e movimentos.'],
  pen: ['Três recusas ou queda do cavaleiro levam à eliminação.'], fonte: B + 'tudo-sobre-hipismo-regras-jogos-historia-culote-e-spur.html' },

{ id: 'parapente', nome: 'Parapente e paraquedismo', cat: C6, ico: '🪂', al: ['paraquedismo', 'voo livre'],
  resumo: 'Esportes aéreos de voo livre, com competições de distância, precisão e acrobacias.',
  jog: 'Individual ou em equipes.', dur: 'Depende da prova.',
  pont: 'Em precisão de pouso, vence quem pousar mais perto do alvo; em distância, quem voar mais longe.',
  regras: ['O equipamento passa por inspeção de segurança antes das provas.', 'Há exigências de habilitação e limites de altitude e de condições climáticas.', 'Cada modalidade tem regras próprias de pontuação.'],
  pen: ['O descumprimento de regras de segurança leva à desclassificação.'], fonte: B + 'parapente-e-paraquedismo-equipamentos-regras-modalidades-voo-livre.html' }
];

function norm(s) { return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); }

window.REGRAS = REGRAS;
window.REGRAS_CATS = [C1, C2, C3, C4, C5, C6];
window.regraDe = function (modalidade) {
  var m = norm(modalidade);
  if (!m) return null;
  for (var i = 0; i < REGRAS.length; i++) {
    var r = REGRAS[i];
    if (norm(r.nome) === m || r.id === m || r.al.some(function (a) { return norm(a) === m; })) return r;
  }
  for (var j = 0; j < REGRAS.length; j++) if (m.indexOf(norm(REGRAS[j].nome)) === 0) return REGRAS[j];
  return null;
};
})();
