(function () {
'use strict';

/* ---------- Dados ---------- */
var KEY = 'arena.v1';
var MODS = ['Futsal', 'Futebol', 'Futebol society', 'Futebol Suíço', 'Vôlei', 'Vôlei de Praia', 'Futevôlei', 'Beach Tênis', 'Basquete', 'Handebol', 'Outra'];
var FORMATOS = { pontos: 'Pontos corridos', mata: 'Mata-mata', grupos: 'Grupos + mata-mata' };
var db = load();

function load() {
  try { var d = JSON.parse(localStorage.getItem(KEY)); if (d && d.competicoes) return migrar(d); } catch (e) {}
  return { competicoes: [], publico: false };
}
function migrar(d) {
  d.competicoes = d.competicoes.map(function (c) {
    if (c.esportes) return c;
    var e = c; e.id = uid();
    return { id: c.id, nome: c.nome, local: '', esportes: [e] };
  });
  return d;
}
var USER = null, REMOTO = false, CARREGANDO = true, ERRO = null;
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { toast('Não foi possível guardar o cache neste navegador.'); }
  if (REMOTO && USER && window.Nuvem) Nuvem.salvar(db.competicoes);
}
function podeEditar(C) { return !!(REMOTO && USER && (!C || !C.owner || C.owner === USER.id)); }
function legado() {
  try { var l = JSON.parse(localStorage.getItem('arena.legado')); return Array.isArray(l) ? migrar({ competicoes: l }).competicoes : []; } catch (e) { return []; }
}
function abrirNovaSenha() {
  modal('Definir nova senha', '<label>Nova senha<input name="senha" type="password" minlength="6" required autocomplete="new-password"></label>', function (fd) {
    Nuvem.novaSenha(fd.senha).then(function () { dlg.close(); toast('Senha alterada.'); }).catch(function (er) { toast(msgAuth(er)); });
    return false;
  }, 'Salvar senha');
}
function msgAuth(e) {
  var m = (e && e.message) || String(e);
  if (/invalid login/i.test(m)) return 'E-mail ou senha incorretos.';
  if (/already registered/i.test(m)) return 'Este e-mail já tem conta. Use “Entrar”.';
  if (/email not confirmed/i.test(m)) return 'Confirme o e-mail enviado antes de entrar.';
  if (/password/i.test(m)) return 'A senha precisa ter pelo menos 6 caracteres.';
  return m;
}
function uid() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3); }
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function $(s) { return document.querySelector(s); }
function num(v) { return v === '' || v == null ? null : Math.max(0, parseInt(v, 10) || 0); }
function comp(id) { return db.competicoes.filter(function (c) { return c.id === id; })[0]; }
function esporte(C, id) { return C.esportes.filter(function (e) { return e.id === id; })[0]; }
var CUR = null;
function eq(c, id) { return c.equipes.filter(function (e) { return e.id === id; })[0]; }
function nomeLado(c, id, rot) {
  return id ? nomeEq(c, id) : '<span class="mut">' + (rot ? esc(rot) : 'A definir') + '</span>';
}
function nomeEq(c, id) { var e = id && eq(c, id); return e ? esc(e.nome) : '<span class="mut">A definir</span>'; }
function shuffle(a) {
  a = a.slice();
  for (var i = a.length - 1; i > 0; i--) { var k = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[k]; a[k] = t; }
  return a;
}
function fmtData(s) {
  if (!s) return '';
  var m = /^(\d{4})-(\d{2})-(\d{2})T?(\d{2}:\d{2})?/.exec(s);
  return m ? m[3] + '/' + m[2] + (m[4] ? ' ' + m[4] : '') : '';
}
function toast(msg) {
  var t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('on'); }, 2800);
}

/* ---------- Geração de jogos ---------- */
function roundRobin(ids) {
  var t = ids.slice();
  if (t.length % 2) t.push(null);
  var n = t.length, rodadas = [];
  for (var r = 0; r < n - 1; r++) {
    var par = [];
    for (var i = 0; i < n / 2; i++) {
      var a = t[i], b = t[n - 1 - i];
      if (a && b) par.push(r % 2 ? [b, a] : [a, b]);
    }
    rodadas.push(par);
    t.splice(1, 0, t.pop());
  }
  return rodadas;
}
function novoJogo(fase, rodada, casa, fora, extra) {
  var j = { id: uid(), fase: fase, rodada: rodada, casa: casa, fora: fora, gc: null, gf: null, pc: null, pf: null,
    data: '', local: '', status: 'ag', eventos: [], ko: false };
  for (var k in extra) j[k] = extra[k];
  return j;
}
function jogosLiga(ids, fase, turnos) {
  var rs = roundRobin(ids), out = [];
  rs.forEach(function (p, i) { p.forEach(function (x) { out.push(novoJogo(fase, i + 1, x[0], x[1], {})); }); });
  if (turnos === 2) {
    rs.forEach(function (p, i) { p.forEach(function (x) { out.push(novoJogo(fase, rs.length + i + 1, x[1], x[0], {})); }); });
  }
  return out;
}
function gerarJogos(c) {
  var ids = c.equipes.map(function (e) { return e.id; });
  if (c.formato === 'pontos') {
    if (ids.length < 2) return 'Cadastre pelo menos 2 equipes.';
    c.jogos = jogosLiga(ids, 'Pontos corridos', c.turnos);
  } else if (c.formato === 'mata') {
    if (ids.length < 2) return 'Cadastre pelo menos 2 equipes.';
    c.jogos = gerarMata(shuffle(ids));
  } else {
    var g = c.numGrupos;
    if (g < 2) return 'Use pelo menos 2 grupos.';
    if (ids.length < g * 2) return 'São necessárias pelo menos ' + (g * 2) + ' equipes para ' + g + ' grupos.';
    if (c.classificados > Math.floor(ids.length / g)) return 'Classificados por grupo maior que o tamanho do menor grupo.';
    var emb = shuffle(ids);
    c.grupos = [];
    for (var i = 0; i < g; i++) c.grupos.push({ id: uid(), nome: 'Grupo ' + String.fromCharCode(65 + i), equipes: [] });
    emb.forEach(function (id, k) { c.grupos[k % g].equipes.push(id); });
    c.jogos = [];
    c.grupos.forEach(function (gr) { c.jogos = c.jogos.concat(jogosLiga(gr.equipes, gr.nome, c.turnos)); });
  }
  c.gerado = true;
  c.mataGerado = c.formato === 'mata';
  if (c.mataGerado) propagar(c);
  return null;
}
function seedOrder(p) {
  var s = [1];
  while (s.length < p) { var n = s.length * 2; s = s.reduce(function (a, x) { a.push(x, n + 1 - x); return a; }, []); }
  return s;
}
function nomeRodadaKO(r, R) {
  var d = R - r;
  return d === 0 ? 'Final' : d === 1 ? 'Semifinal' : d === 2 ? 'Quartas de final' : d === 3 ? 'Oitavas de final' : 'Fase ' + r;
}
function gerarMata(ids) {
  var p = 1; while (p < ids.length) p *= 2;
  var R = Math.log2(p), slots = seedOrder(p).map(function (s) { return ids[s - 1] || null; }), out = [];
  for (var r = 1; r <= R; r++) {
    for (var i = 0; i < p / Math.pow(2, r); i++) {
      out.push(novoJogo(nomeRodadaKO(r, R), r, r === 1 ? slots[2 * i] : null, r === 1 ? slots[2 * i + 1] : null,
        { ko: true, idx: i }));
    }
  }
  if (R >= 2) {
    var terceiro = novoJogo('3º lugar', R, null, null, { ko: true, idx: 1, nome: '3º lugar' });
    out.push(terceiro);
    out.forEach(function (j) {
      if (j.rodada === R - 1) j.dp = { jogo: terceiro.id, lado: j.idx % 2 === 0 ? 'casa' : 'fora' };
    });
  }
  return out;
}

/* ---------- Mata-mata ---------- */
function vencedor(j) {
  if (j.bye) return j.casa || j.fora;
  if (j.status !== 'fin' || !j.casa || !j.fora) return null;
  if (j.gc > j.gf) return j.casa;
  if (j.gf > j.gc) return j.fora;
  if (j.pc != null && j.pf != null && j.pc !== j.pf) return j.pc > j.pf ? j.casa : j.fora;
  return null;
}
function zerar(j) { j.gc = j.gf = j.pc = j.pf = null; j.status = 'ag'; j.eventos = []; j.bye = false; }
function perdedor(j) {
  var w = vencedor(j);
  if (!w || j.bye) return null;
  return w === j.casa ? j.fora : j.casa;
}
function propagar(c) {
  var ko = c.jogos.filter(function (j) { return j.ko; });
  if (!ko.length) return;
  var porId = {}; ko.forEach(function (j) { porId[j.id] = j; });
  function ocupar(alvo, lado, id) {
    if (alvo && alvo[lado] !== id) { alvo[lado] = id; zerar(alvo); }
  }
  ko.slice().sort(function (a, b) { return a.rodada - b.rodada || a.idx - b.idx; }).forEach(function (j) {
    if (j.rodada === 1 && (!j.casa || !j.fora)) { j.bye = true; j.status = 'fin'; }
    var w = vencedor(j);
    if (j.dv) ocupar(porId[j.dv.jogo], j.dv.lado, w);
    else {
      var prox = ko.filter(function (k) { return k.rodada === j.rodada + 1 && k.idx === Math.floor(j.idx / 2); })[0];
      ocupar(prox, j.idx % 2 === 0 ? 'casa' : 'fora', w);
    }
    if (j.dp) ocupar(porId[j.dp.jogo], j.dp.lado, perdedor(j));
  });
}
function campeao(c) {
  var ko = c.jogos.filter(function (j) { return j.ko; });
  if (!ko.length) return null;
  var R = Math.max.apply(null, ko.map(function (j) { return j.rodada; }));
  var f = ko.filter(function (j) { return j.rodada === R && j.fase !== '3º lugar'; })[0];
  return f ? vencedor(f) : null;
}

/* ---------- Classificação ---------- */
function tabela(c, ids, fase) {
  var t = {};
  ids.forEach(function (id) { t[id] = { id: id, p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 }; });
  c.jogos.forEach(function (j) {
    if (j.ko || j.fase !== fase || j.status !== 'fin' || !t[j.casa] || !t[j.fora]) return;
    var a = t[j.casa], b = t[j.fora];
    a.j++; b.j++; a.gp += j.gc; a.gc += j.gf; b.gp += j.gf; b.gc += j.gc;
    if (j.gc > j.gf) { a.v++; b.d++; a.p += 3; }
    else if (j.gc < j.gf) { b.v++; a.d++; b.p += 3; }
    else { a.e++; b.e++; a.p++; b.p++; }
  });
  return Object.keys(t).map(function (k) { t[k].sg = t[k].gp - t[k].gc; return t[k]; }).sort(function (x, y) {
    return y.p - x.p || y.v - x.v || y.sg - x.sg || y.gp - x.gp ||
      nomeSimples(c, x.id).localeCompare(nomeSimples(c, y.id), 'pt-BR');
  });
}
function nomeSimples(c, id) { var e = eq(c, id); return e ? e.nome : ''; }
function fasesDe(c) {
  if (c.formato === 'pontos') return [{ nome: 'Pontos corridos', ids: c.equipes.map(function (e) { return e.id; }) }];
  if (c.formato === 'grupos') return (c.grupos || []).map(function (g) { return { nome: g.nome, ids: g.equipes }; });
  return [];
}
function gruposEncerrados(c) {
  var js = c.jogos.filter(function (j) { return !j.ko; });
  return js.length > 0 && js.every(function (j) { return j.status === 'fin'; });
}
function gerarFinal(c) {
  var q = [];
  c.grupos.forEach(function (g) {
    tabela(c, g.equipes, g.nome).slice(0, c.classificados).forEach(function (x, pos) { x.pos = pos; q.push(x); });
  });
  q.sort(function (a, b) { return a.pos - b.pos || b.p - a.p || b.sg - a.sg || b.gp - a.gp; });
  if (q.length < 2) return 'Poucos classificados.';
  c.jogos = c.jogos.concat(gerarMata(q.map(function (x) { return x.id; })));
  c.mataGerado = true;
  propagar(c);
  return null;
}

/* ---------- Interface: modal ---------- */
var dlg = $('#dlg');
function modal(titulo, html, onSave, textoSalvar) {
  dlg.innerHTML = '<form id="mf"><h3>' + titulo + '</h3>' + html +
    '<div class="mrow"><button type="button" class="btn btn-o" data-act="fechar">Cancelar</button>' +
    '<button class="btn btn-p">' + (textoSalvar || 'Salvar') + '</button></div></form>';
  $('#mf').onsubmit = function (e) {
    e.preventDefault();
    var fd = {}; new FormData(e.target).forEach(function (v, k) { fd[k] = v; });
    if (onSave(fd) !== false) dlg.close();
  };
  if (!dlg.open) dlg.showModal();
}
function opts(lista, atual) {
  return lista.map(function (o) {
    var v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o;
    return '<option value="' + esc(v) + '"' + (v === atual ? ' selected' : '') + '>' + esc(l) + '</option>';
  }).join('');
}

/* ---------- Telas ---------- */
var app = $('#app');
var FJ = 'todos';
function icone(m) {
  m = (m || '').toLowerCase();
  if (/vôlei|volei|futev/.test(m)) return '🏐';
  if (/tênis|tenis/.test(m)) return '🎾';
  if (/basq/.test(m)) return '🏀';
  if (/handeb/.test(m)) return '🤾';
  if (/fut|soci|suíç|suic/.test(m)) return '⚽';
  return '🏅';
}
function iniciais(n) {
  return esc(String(n || '?').split(/[\s\/]+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0); }).join('').toUpperCase());
}
function contagem(e) {
  var js = e.jogos.filter(function (j) { return !j.bye; });
  var fin = js.filter(function (j) { return j.status === 'fin'; }).length;
  return { fin: fin, tot: js.length, pct: js.length ? Math.round(fin * 100 / js.length) : 0 };
}
function barra(pct) { return '<div class="prog"><i style="width:' + pct + '%"></i></div>'; }
function statBox(n, rotulo) { return '<div class="stat"><b>' + n + '</b><span>' + rotulo + '</span></div>'; }
function acoesPagina() {
  return '<div class="row noprint"><button class="btn btn-o sm" data-act="compartilhar">🔗 Copiar link</button>' +
    '<button class="btn btn-o sm" data-act="imprimir">🖨️ Imprimir</button></div>';
}
function route() {
  var h = location.hash.replace(/^#\/?/, '').split('/');
  var C = h[0] === 'c' && h[1] ? comp(h[1]) : null;
  var E = C && h[2] ? esporte(C, h[2]) : null;
  document.body.classList.toggle('publico', !!db.publico || !podeEditar(C));
  $('#btnPublico').textContent = db.publico ? 'Sair do modo público' : 'Modo público';
  $('#btnConta').textContent = USER ? 'Sair' : 'Entrar';
  $('#usuario').textContent = USER ? USER.email : '';
  if (CARREGANDO) { app.innerHTML = '<div class="skel"></div><div class="skel" style="margin-top:16px"></div>'; return; }
  if (C && E) { CUR = { comp: C, esp: E }; telaComp(E, h[3] || 'classificacao'); }
  else if (C) telaCompeticao(C);
  else telaHome();
  var av = '';
  if (ERRO) av += '<div class="banner err">' + esc(ERRO) + '</div>';
  else if (!USER) av += '<div class="banner row between noprint"><span>Você está na área pública, somente leitura. Entre para criar e gerenciar competições.</span>' +
    '<button class="btn btn-p sm" data-act="conta">Entrar</button></div>';
  if (!C && USER && REMOTO && legado().length) {
    av += '<div class="banner ok"><b>' + legado().length + ' competição(ões)</b> salva(s) neste navegador antes da conexão com a nuvem.' +
      '<div class="row" style="margin-top:10px"><button class="btn btn-p" data-act="legadoEnviar">Enviar para a nuvem</button>' +
      '<button class="btn btn-o" data-act="legadoDescartar">Descartar</button></div></div>';
  }
  if (av) app.innerHTML = av + app.innerHTML;
}
function refresh() { save(); route(); }

function telaHome() {
  var nE = 0, nQ = 0, nJ = 0, nF = 0;
  db.competicoes.forEach(function (C) {
    nE += C.esportes.length;
    C.esportes.forEach(function (e) { nQ += e.equipes.length; var k = contagem(e); nJ += k.tot; nF += k.fin; });
  });
  var cards = db.competicoes.map(function (C) {
    var eqs = 0, fin = 0, tot = 0;
    C.esportes.forEach(function (e) { eqs += e.equipes.length; var k = contagem(e); fin += k.fin; tot += k.tot; });
    var icos = C.esportes.map(function (e) { return icone(e.modalidade); }).filter(function (m, i, a) { return a.indexOf(m) === i; }).join(' ');
    return '<a class="card" data-nome="' + esc((C.nome + ' ' + (C.local || '')).toLowerCase()) + '" href="#/c/' + C.id + '">' +
      '<div class="top-line"><span class="ico">🏆</span><div><h3>' + esc(C.nome) + '</h3><p class="mut">' + esc(C.local || 'Competição esportiva') + '</p></div></div>' +
      '<p style="font-size:1.2rem">' + (icos || '<span class="mut" style="font-size:.85rem">Nenhum esporte cadastrado</span>') + '</p>' +
      '<div class="chips" style="margin-top:10px"><span class="tag blue">' + C.esportes.length + ' esportes</span><span class="tag">' + eqs + ' equipes</span>' +
      '<span class="tag ok">' + fin + '/' + tot + ' jogos</span></div>' + barra(tot ? Math.round(fin * 100 / tot) : 0) + '</a>';
  }).join('');
  app.innerHTML = '<section class="hero"><h1>Toda a sua competição em um só lugar</h1>' +
    '<p>Cadastre esportes, equipes e atletas, gere tabelas e chaveamentos e acompanhe os resultados em tempo real.</p>' +
    '<div class="row">' + (USER ? '<button class="btn btn-p edit" data-act="novaComp">＋ Nova competição</button>' : '<button class="btn btn-p" data-act="conta">Entrar para gerenciar</button>') + '</div>' +
    '<div class="stats">' + statBox(db.competicoes.length, 'Competições') + statBox(nE, 'Esportes') + statBox(nQ, 'Equipes') + statBox(nF + '/' + nJ, 'Jogos encerrados') + '</div></section>' +
    '<div class="row between" style="margin-top:26px"><h2 style="margin:0">Competições</h2>' +
    '<div class="row"><input class="search" id="busca" type="search" placeholder="Buscar competição…" aria-label="Buscar competição">' +
    '<span class="row edit"><button class="btn btn-o sm" data-act="exportar">Exportar dados</button>' +
    '<label class="btn btn-o sm" style="cursor:pointer">Importar dados<input type="file" id="imp" accept=".json" hidden></label></span></div></div>' +
    (cards ? '<div class="grid" style="margin-top:14px" id="lista">' + cards + '</div>'
      : '<div class="empty" style="margin-top:14px"><b>Nenhuma competição ainda</b>Clique em “Nova competição” para começar.</div>');
  var imp = $('#imp'); if (imp) imp.onchange = importar;
}

function telaCompeticao(C) {
  var nQ = 0, nA = 0, nF = 0, nJ = 0;
  C.esportes.forEach(function (e) { nQ += e.equipes.length; nA += e.atletas.length; var k = contagem(e); nF += k.fin; nJ += k.tot; });
  var cards = C.esportes.map(function (e) {
    var k = contagem(e), ch = campeao(e);
    return '<a class="card" href="#/c/' + C.id + '/' + e.id + '">' +
      '<div class="top-line"><span class="ico">' + icone(e.modalidade) + '</span><div><h3>' + esc(e.modalidade) + '</h3>' +
      '<p class="mut">' + esc((e.categoria ? e.categoria + ' · ' : '') + e.sexo) + '</p></div></div>' +
      '<div class="chips"><span class="tag blue">' + FORMATOS[e.formato] + '</span><span class="tag">' + e.equipes.length + ' equipes</span>' +
      '<span class="tag ok">' + k.fin + '/' + k.tot + ' jogos</span></div>' + barra(k.pct) +
      (ch ? '<p style="margin-top:10px"><span class="champion">🏆 ' + nomeEq(e, ch) + '</span></p>' : '') + '</a>';
  }).join('');
  app.innerHTML = '<a class="crumb" href="#/">← Competições</a>' +
    '<div class="phead"><div class="ptitle"><span class="ico">🏆</span><div><h1>' + esc(C.nome) + '</h1><p class="mut">' + esc(C.local || 'Competição esportiva') + '</p></div></div>' +
    '<div class="row"><span class="row edit"><button class="btn btn-p" data-act="novoEsporte">＋ Novo esporte</button>' +
    '<button class="btn btn-o" data-act="editComp">Editar</button><button class="btn btn-d" data-act="delComp">Excluir</button></span>' + acoesPagina() + '</div></div>' +
    '<div class="stats">' + statBox(C.esportes.length, 'Esportes') + statBox(nQ, 'Equipes') + statBox(nA, 'Atletas') + statBox(nF + '/' + nJ, 'Jogos encerrados') + '</div>' +
    '<h2>Esportes</h2>' + (cards ? '<div class="grid">' + cards + '</div>'
      : '<div class="empty"><b>Nenhum esporte cadastrado</b>Use “Novo esporte” para incluir futsal, vôlei, basquete etc.</div>');
}

function telaComp(c, aba) {
  var abas = [['classificacao', c.formato === 'mata' ? 'Chaveamento' : 'Classificação', ''], ['jogos', 'Jogos', c.jogos.filter(function (j) { return !j.bye; }).length],
    ['equipes', 'Equipes', c.equipes.length], ['atletas', 'Atletas', c.atletas.length], ['estatisticas', 'Estatísticas', ''], ['config', 'Configuração', '']];
  var tabs = abas.map(function (a) {
    return '<a href="#/c/' + CUR.comp.id + '/' + c.id + '/' + a[0] + '" class="' + (a[0] === aba ? 'on' : '') + '">' + a[1] + (a[2] !== '' ? '<small>' + a[2] + '</small>' : '') + '</a>';
  }).join('');
  var banner = '';
  if (!c.gerado) {
    banner = '<div class="banner edit"><b>Passo seguinte:</b> cadastre as equipes e gere os jogos. Depois de gerar, as equipes ficam travadas.' +
      '<div style="margin-top:10px"><button class="btn btn-p" data-act="gerar">Gerar jogos</button></div></div>';
  } else if (c.formato === 'grupos' && !c.mataGerado && gruposEncerrados(c)) {
    banner = '<div class="banner ok edit"><b>Fase de grupos encerrada.</b> Gere o mata-mata com os ' + c.classificados + ' primeiros de cada grupo.' +
      '<div style="margin-top:10px"><button class="btn btn-p" data-act="gerarFinal">Gerar mata-mata</button></div></div>';
  }
  var ch = campeao(c), k = contagem(c);
  var corpo = { classificacao: abaClass, jogos: abaJogos, equipes: abaEquipes, atletas: abaAtletas,
    estatisticas: abaStats, config: abaConfig }[aba] || abaClass;
  app.innerHTML = '<a class="crumb" href="#/c/' + CUR.comp.id + '">← ' + esc(CUR.comp.nome) + '</a>' +
    '<div class="phead"><div class="ptitle"><span class="ico">' + icone(c.modalidade) + '</span><div><h1>' + esc(c.modalidade) + '</h1>' +
    '<div class="chips" style="margin-top:4px"><span class="tag">' + esc((c.categoria ? c.categoria + ' · ' : '') + c.sexo) + '</span><span class="tag blue">' + FORMATOS[c.formato] + '</span>' +
    '<span class="tag ok">' + k.fin + '/' + k.tot + ' jogos · ' + k.pct + '%</span></div></div></div>' + acoesPagina() + '</div>' +
    (ch ? '<div class="champion">🏆 Campeão: ' + nomeEq(c, ch) + '</div>' : '') +
    '<div style="margin-top:16px">' + banner + '</div><div class="tabs">' + tabs + '</div>' + corpo(c);
}

function linhaTabela(c, t, i, qual) {
  return '<tr class="' + (i < qual ? 'q' : '') + '"><td>' + (i + 1) + '</td><td class="l"><span class="eqn"><span class="av">' + iniciais(nomeSimples(c, t.id)) + '</span>' + nomeEq(c, t.id) + '</span></td><td><b>' + t.p + '</b></td><td>' + t.j +
    '</td><td>' + t.v + '</td><td>' + t.e + '</td><td>' + t.d + '</td><td>' + t.gp + '</td><td>' + t.gc + '</td><td>' + t.sg + '</td></tr>';
}
function htmlTabela(c, fase, ids, qual) {
  var linhas = tabela(c, ids, fase).map(function (t, i) { return linhaTabela(c, t, i, qual); }).join('');
  return '<h2>' + esc(fase) + '</h2><div class="tw"><table><tr><th>#</th><th class="l">Equipe</th><th>Pts</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th></tr>' + linhas + '</table></div>';
}
function abaClass(c) {
  if (!c.gerado) return '<div class="empty">Gere os jogos para ver a ' + (c.formato === 'mata' ? 'chave.' : 'classificação.') + '</div>';
  var h = '';
  if (c.formato !== 'mata') {
    fasesDe(c).forEach(function (f) { h += htmlTabela(c, f.nome, f.ids, c.formato === 'grupos' ? c.classificados : 0); });
    if (c.formato === 'grupos') h += '<p class="mut" style="margin-top:8px">A barra verde marca as vagas para o mata-mata.</p>';
  }
  if (c.jogos.some(function (j) { return j.ko; })) h += (c.formato === 'mata' ? '' : '<h2>Chaveamento</h2>') + htmlChave(c);
  return h;
}
function htmlChave(c) {
  var ko = c.jogos.filter(function (j) { return j.ko; });
  var R = Math.max.apply(null, ko.map(function (j) { return j.rodada; })), cols = '';
  for (var r = 1; r <= R; r++) {
    var daRodada = ko.filter(function (j) { return j.rodada === r; });
    var ms = daRodada.slice().sort(function (a, b) { return a.idx - b.idx; }).map(function (j) {
      var w = vencedor(j), fin = j.status === 'fin' && !j.bye;
      function lado(id, g, p, rot) {
        return '<div class="' + (w && w === id ? 'w' : '') + '"><span>' + (id ? nomeEq(c, id) : (j.bye ? '<span class="mut">Folga</span>' : nomeLado(c, null, rot))) +
          '</span><span>' + (fin ? g + (j.pc != null && j.gc === j.gf ? ' (' + p + ')' : '') : '') + '</span></div>';
      }
      return '<div class="m" data-act="sumula" data-id="' + j.id + '">' + (j.nome ? '<div class="mh">' + esc(j.nome) + '</div>' : '') +
        lado(j.casa, j.gc, j.pc, j.rc) + lado(j.fora, j.gf, j.pf, j.rf) + '</div>';
    }).join('');
    cols += '<div class="col"><h4>' + esc(daRodada[0].fase) + '</h4><div class="cm">' + ms + '</div></div>';
  }
  var ch = campeao(c);
  cols += '<div class="col fim"><h4>&nbsp;</h4><div class="cm"><div class="champ">🏆<b>' + (ch ? nomeEq(c, ch) : '—') + '</b><span>Campeão</span></div></div></div>';
  return '<div class="bracket">' + cols + '</div>';
}

function abaJogos(c) {
  if (!c.gerado) return '<div class="empty"><b>Jogos ainda não gerados</b>Gere os jogos para listar as partidas.</div>';
  var todos = c.jogos.filter(function (j) { return !j.bye; });
  var nAg = todos.filter(function (j) { return j.status !== 'fin'; }).length;
  var filtros = [['todos', 'Todos', todos.length], ['ag', 'A realizar', nAg], ['fin', 'Encerrados', todos.length - nAg]].map(function (f) {
    return '<button class="chip ' + (FJ === f[0] ? 'on' : '') + '" data-act="filtro" data-v="' + f[0] + '">' + f[1] + ' (' + f[2] + ')</button>';
  }).join('');
  var h = '<div class="filtros">' + filtros + '</div>', ordem = [];
  c.jogos.forEach(function (j) {
    var k = j.fase + '|' + j.rodada;
    if (ordem.indexOf(k) < 0) ordem.push(k);
  });
  ordem.forEach(function (k) {
    var p = k.split('|'), js = c.jogos.filter(function (j) {
      return j.fase === p[0] && String(j.rodada) === p[1] && !j.bye && (FJ === 'todos' || (FJ === 'fin') === (j.status === 'fin'));
    });
    if (!js.length) return;
    h += '<h2>' + esc(p[0]) + (js[0].ko ? '' : ' · Rodada ' + p[1]) + '</h2>';
    js.forEach(function (j) {
      var fin = j.status === 'fin';
      h += '<div class="jogo ' + (fin ? 'fin' : '') + '"><div class="dt">' + (j.nome ? '<b>' + esc(j.nome) + '</b> ' : '') +
        (fin ? '<span class="tag ok">Encerrado</span>' : '<span class="tag">A realizar</span>') +
        (j.data ? '<br>' + esc(fmtData(j.data)) : '') + (j.local ? '<br>' + esc(j.local) : '') + '</div>' +
        '<div class="c">' + nomeLado(c, j.casa, j.rc) + '</div><div class="pl">' + (fin ? j.gc + ' x ' + j.gf : 'x') +
        (fin && j.pc != null && j.gc === j.gf ? '<div class="sub">pên. ' + j.pc + ' x ' + j.pf + '</div>' : '') + '</div>' +
        '<div class="f">' + nomeLado(c, j.fora, j.rf) + '</div><div class="ac">' +
        (j.casa && j.fora ? '<button class="btn btn-o sm edit" data-act="sumula" data-id="' + j.id + '">Súmula</button>' : '') + '</div></div>';
    });
  });
  if (h.indexOf('class="jogo') < 0) h += '<div class="empty" style="margin-top:12px">Nenhuma partida neste filtro.</div>';
  return h;
}

function abaEquipes(c) {
  var lista = c.equipes.map(function (e) {
    var n = c.atletas.filter(function (a) { return a.equipeId === e.id; }).length;
    return '<div class="card"><div class="top-line"><span class="av" style="width:42px;height:42px;font-size:.85rem;margin:0">' + iniciais(e.nome) + '</span><div><h3>' + esc(e.nome) + (e.sigla ? ' <span class="tag">' + esc(e.sigla) + '</span>' : '') + '</h3>' +
      '<p class="mut">' + (e.tecnico ? 'Técnico: ' + esc(e.tecnico) + ' · ' : '') + n + ' atletas</p></div></div>' +
      '<div class="row edit" style="margin-top:10px"><button class="btn btn-o sm" data-act="editEquipe" data-id="' + e.id + '">Editar</button>' +
      (c.gerado ? '' : '<button class="btn btn-d sm" data-act="delEquipe" data-id="' + e.id + '">Excluir</button>') + '</div></div>';
  }).join('');
  return '<div class="row between"><h2 style="margin:0">Equipes (' + c.equipes.length + ')</h2>' +
    (c.gerado ? '' : '<button class="btn btn-p edit" data-act="novaEquipe">Nova equipe</button>') + '</div>' +
    (c.gerado ? '<p class="mut">Os jogos já foram gerados; para incluir ou excluir equipes, reinicie os jogos na aba Configuração.</p>' : '') +
    (lista ? '<div class="grid" style="margin-top:14px">' + lista + '</div>' : '<div class="empty" style="margin-top:14px">Nenhuma equipe cadastrada.</div>');
}

function abaAtletas(c) {
  if (!c.equipes.length) return '<div class="empty">Cadastre equipes antes de incluir atletas.</div>';
  var h = '<div class="row between"><h2 style="margin:0">Atletas (' + c.atletas.length + ')</h2><button class="btn btn-p edit" data-act="novoAtleta">Novo atleta</button></div>';
  c.equipes.forEach(function (e) {
    var as = c.atletas.filter(function (a) { return a.equipeId === e.id; }).sort(function (a, b) { return (a.numero || 999) - (b.numero || 999); });
    h += '<h2>' + esc(e.nome) + '</h2>' + (as.length ? '<div class="tw"><table><tr><th>Nº</th><th class="l">Nome</th><th class="l">Posição</th><th class="edit"></th></tr>' +
      as.map(function (a) {
        return '<tr><td>' + esc(a.numero) + '</td><td class="l">' + esc(a.nome) + '</td><td class="l">' + esc(a.posicao) +
          '</td><td class="edit"><button class="btn btn-o sm" data-act="editAtleta" data-id="' + a.id + '">Editar</button> <button class="btn btn-d sm" data-act="delAtleta" data-id="' + a.id + '">Excluir</button></td></tr>';
      }).join('') + '</table></div>' : '<p class="mut">Sem atletas.</p>');
  });
  return h;
}

function abaStats(c) {
  var gols = {}, am = {}, vm = {}, golsEq = {};
  c.jogos.forEach(function (j) {
    if (j.status !== 'fin') return;
    j.eventos.forEach(function (ev) {
      if (!ev.atletaId) return;
      if (ev.tipo === 'gol') gols[ev.atletaId] = (gols[ev.atletaId] || 0) + 1;
      if (ev.tipo === 'amarelo') am[ev.atletaId] = (am[ev.atletaId] || 0) + 1;
      if (ev.tipo === 'vermelho') vm[ev.atletaId] = (vm[ev.atletaId] || 0) + 1;
    });
    [[j.casa, j.gf], [j.fora, j.gc]].forEach(function (x) {
      if (!x[0]) return;
      golsEq[x[0]] = golsEq[x[0]] || { s: 0, n: 0 }; golsEq[x[0]].s += x[1]; golsEq[x[0]].n++;
    });
  });
  function atl(id) { return c.atletas.filter(function (a) { return a.id === id; })[0]; }
  function rank(m) {
    return Object.keys(m).sort(function (a, b) { return m[b] - m[a]; }).map(function (id) {
      var a = atl(id); return a ? { nome: a.nome, eq: nomeEq(c, a.equipeId), v: m[id] } : null;
    }).filter(Boolean);
  }
  function tb(titulo, arr, col) {
    return '<h2>' + titulo + '</h2>' + (arr.length ? '<div class="tw"><table><tr><th>#</th><th class="l">Atleta</th><th class="l">Equipe</th><th>' + col + '</th></tr>' +
      arr.slice(0, 15).map(function (x, i) { return '<tr><td>' + (i + 1) + '</td><td class="l">' + esc(x.nome) + '</td><td class="l">' + x.eq + '</td><td><b>' + x.v + '</b></td></tr>'; }).join('') + '</table></div>'
      : '<p class="mut">Sem registros ainda. Lance gols e cartões na súmula das partidas encerradas.</p>');
  }
  var def = Object.keys(golsEq).map(function (id) { return { id: id, s: golsEq[id].s, n: golsEq[id].n }; })
    .sort(function (a, b) { return a.s / a.n - b.s / b.n || a.s - b.s; });
  return tb('Artilharia', rank(gols), 'Gols') + tb('Cartões amarelos', rank(am), 'Cartões') + tb('Cartões vermelhos', rank(vm), 'Cartões') +
    '<h2>Defesa menos vazada</h2>' + (def.length ? '<div class="tw"><table><tr><th>#</th><th class="l">Equipe</th><th>Gols sofridos</th><th>Jogos</th><th>Média</th></tr>' +
      def.map(function (x, i) { return '<tr><td>' + (i + 1) + '</td><td class="l">' + nomeEq(c, x.id) + '</td><td>' + x.s + '</td><td>' + x.n + '</td><td>' + (x.s / x.n).toFixed(2) + '</td></tr>'; }).join('') + '</table></div>'
      : '<p class="mut">Sem jogos encerrados.</p>');
}

function formComp(C) {
  C = C || {};
  return '<label>Nome da competição *<input name="nome" required value="' + esc(C.nome) + '"></label>' +
    '<label>Local / cidade<input name="local" value="' + esc(C.local) + '"></label>';
}
function formEsporte(c) {
  c = c || { modalidade: 'Futsal', sexo: 'Misto', formato: 'pontos', turnos: 1, numGrupos: 2, classificados: 2 };
  var bloq = c.gerado ? ' disabled' : '';
  var padrao = MODS.indexOf(c.modalidade) >= 0 ? c.modalidade : 'Outra';
  return '<div class="f2"><label>Esporte *<select name="modalidade">' + opts(MODS, padrao) + '</select></label>' +
    '<label>Se “Outra”, qual?<input name="outra" value="' + esc(padrao === 'Outra' && c.modalidade !== 'Outra' ? c.modalidade : '') + '"></label></div>' +
    '<div class="f2"><label>Categoria<input name="categoria" placeholder="Ex.: Sub-17, Adulto" value="' + esc(c.categoria) + '"></label>' +
    '<label>Sexo<select name="sexo">' + opts(['Masculino', 'Feminino', 'Misto'], c.sexo) + '</select></label></div>' +
    '<div class="f2"><label>Formato<select name="formato"' + bloq + '>' + opts(Object.keys(FORMATOS).map(function (k) { return [k, FORMATOS[k]]; }), c.formato) + '</select></label>' +
    '<label>Turnos (pontos e grupos)<select name="turnos"' + bloq + '>' + opts([['1', 'Somente ida'], ['2', 'Ida e volta']], String(c.turnos)) + '</select></label></div>' +
    '<div class="f2"><label>Grupos<input type="number" min="2" max="8" name="numGrupos"' + bloq + ' value="' + c.numGrupos + '"></label>' +
    '<label>Classificados por grupo<input type="number" min="1" max="8" name="classificados"' + bloq + ' value="' + c.classificados + '"></label></div>';
}
function lerEsporte(fd, c) {
  c.modalidade = fd.modalidade === 'Outra' ? (fd.outra || '').trim() || 'Outra' : fd.modalidade;
  c.categoria = (fd.categoria || '').trim(); c.sexo = fd.sexo;
  if (!c.gerado) {
    c.formato = fd.formato; c.turnos = parseInt(fd.turnos, 10) === 2 ? 2 : 1;
    c.numGrupos = Math.min(8, Math.max(2, parseInt(fd.numGrupos, 10) || 2));
    c.classificados = Math.min(8, Math.max(1, parseInt(fd.classificados, 10) || 2));
  }
}
function abaConfig(c) {
  return '<div class="card edit"><h3>Dados do esporte</h3><p class="mut">Formato, turnos e grupos só mudam antes de gerar os jogos.</p>' +
    '<div class="row" style="margin-top:10px"><button class="btn btn-p" data-act="editEsporte">Editar dados</button>' +
    (c.gerado ? '<button class="btn btn-o" data-act="reiniciar">Reiniciar jogos</button>' : '') +
    '<button class="btn btn-d" data-act="delEsporte">Excluir esporte</button></div></div>' +
    '<p class="mut" style="margin-top:14px">Critérios de classificação: pontos (V=3, E=1), vitórias, saldo, gols/pontos pró e ordem alfabética. No mata-mata, empate se resolve nos pênaltis.</p>';
}

/* ---------- Súmula ---------- */
var S = null;
function abrirSumula(c, j) {
  S = { c: c, j: j, d: JSON.parse(JSON.stringify(j)) };
  desenharSumula();
}
function desenharSumula() {
  var c = S.c, d = S.d;
  var atl = c.atletas.filter(function (a) { return a.equipeId === d.casa || a.equipeId === d.fora; });
  var evs = d.eventos.map(function (e, i) {
    var a = c.atletas.filter(function (x) { return x.id === e.atletaId; })[0];
    var nomeT = { gol: 'Gol', contra: 'Gol contra', amarelo: 'Cartão amarelo', vermelho: 'Cartão vermelho' }[e.tipo];
    return '<div class="ev"><span>' + (e.minuto != null ? e.minuto + '’ · ' : '') + nomeT + ' · ' + nomeEq(c, e.equipeId) + (a ? ' · ' + esc(a.nome) : '') +
      '</span><button type="button" data-act="delEv" data-i="' + i + '">remover</button></div>';
  }).join('');
  var optAtl = '<option value="">(sem atleta)</option>' + atl.map(function (a) {
    return '<option value="' + a.id + '">' + esc((a.numero ? a.numero + ' - ' : '') + a.nome) + ' (' + esc(nomeSimples(c, a.equipeId)) + ')</option>';
  }).join('');
  var html = '<p><b>' + nomeEq(c, d.casa) + '</b> x <b>' + nomeEq(c, d.fora) + '</b> <span class="tag">' + esc(d.fase) + '</span></p>' +
    '<div class="f2"><label>Data e hora<input type="datetime-local" name="data" value="' + esc(d.data) + '"></label>' +
    '<label>Local<input name="local" value="' + esc(d.local) + '"></label></div>' +
    '<div class="f2"><label>Gols – ' + esc(nomeSimples(c, d.casa)) + '<input type="number" min="0" name="gc" value="' + (d.gc == null ? '' : d.gc) + '"></label>' +
    '<label>Gols – ' + esc(nomeSimples(c, d.fora)) + '<input type="number" min="0" name="gf" value="' + (d.gf == null ? '' : d.gf) + '"></label></div>' +
    (d.ko ? '<div class="f2"><label>Pênaltis – casa (se empate)<input type="number" min="0" name="pc" value="' + (d.pc == null ? '' : d.pc) + '"></label>' +
      '<label>Pênaltis – fora<input type="number" min="0" name="pf" value="' + (d.pf == null ? '' : d.pf) + '"></label></div>' : '') +
    '<label class="chk"><input type="checkbox" name="fin"' + (d.status === 'fin' ? ' checked' : '') + '> Partida encerrada (conta na classificação)</label>' +
    '<h3>Eventos</h3>' + (evs || '<p class="mut">Nenhum evento lançado.</p>') +
    '<div class="add"><label>Tipo<select id="evTipo"><option value="gol">Gol</option><option value="contra">Gol contra</option><option value="amarelo">Amarelo</option><option value="vermelho">Vermelho</option></select></label>' +
    '<label>Equipe<select id="evEq"><option value="' + d.casa + '">' + esc(nomeSimples(c, d.casa)) + '</option><option value="' + d.fora + '">' + esc(nomeSimples(c, d.fora)) + '</option></select></label>' +
    '<label>Atleta<select id="evAtl">' + optAtl + '</select></label>' +
    '<label>Min.<input id="evMin" type="number" min="0" max="200"></label>' +
    '<button type="button" class="btn btn-o sm" data-act="addEv">Adicionar</button></div>' +
    '<p class="mut">Gols lançados atualizam o placar automaticamente; o placar também pode ser digitado.</p>';
  modal('Súmula', html, salvarSumula);
}
function lerSumula() {
  var f = $('#mf'), d = S.d;
  d.data = f.data.value; d.local = f.local.value.trim();
  d.gc = num(f.gc.value); d.gf = num(f.gf.value);
  if (d.ko) { d.pc = num(f.pc.value); d.pf = num(f.pf.value); }
  d.status = f.fin.checked ? 'fin' : 'ag';
}
function placarPorEventos(d) {
  var gc = 0, gf = 0, tem = false;
  d.eventos.forEach(function (e) {
    if (e.tipo === 'gol') { tem = true; e.equipeId === d.casa ? gc++ : gf++; }
    if (e.tipo === 'contra') { tem = true; e.equipeId === d.casa ? gf++ : gc++; }
  });
  if (tem) { d.gc = gc; d.gf = gf; }
}
function salvarSumula() {
  lerSumula();
  var d = S.d, c = S.c;
  if (d.status === 'fin') {
    if (d.gc == null || d.gf == null) { toast('Informe o placar para encerrar a partida.'); return false; }
    if (d.ko && d.gc === d.gf && (d.pc == null || d.pf == null || d.pc === d.pf)) {
      toast('Mata-mata empatado: informe o resultado dos pênaltis (sem empate).'); return false;
    }
  }
  var j = c.jogos.filter(function (x) { return x.id === d.id; })[0];
  ['data', 'local', 'gc', 'gf', 'pc', 'pf', 'status', 'eventos'].forEach(function (k) { j[k] = d[k]; });
  if (j.ko) propagar(c);
  S = null; refresh();
}

/* ---------- Ações ---------- */
function importar(e) {
  var f = e.target.files[0]; if (!f) return;
  var r = new FileReader();
  r.onload = function () {
    try {
      var d = JSON.parse(r.result);
      if (!d || !Array.isArray(d.competicoes)) throw new Error();
      if (!USER) { toast('Entre para importar dados.'); return; }
      var ids = db.competicoes.map(function (x) { return x.id; }), n = 0;
      migrar({ competicoes: d.competicoes }).competicoes.forEach(function (x) {
        if (ids.indexOf(x.id) < 0) { x.owner = USER.id; db.competicoes.push(x); n++; }
      });
      refresh(); toast(n + ' competição(ões) importada(s).');
    } catch (x) { toast('Arquivo inválido.'); }
  };
  r.readAsText(f);
}

document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-act]'); if (!el) return;
  var act = el.dataset.act, id = el.dataset.id;
  var h = location.hash.replace(/^#\/?/, '').split('/');
  var C = h[0] === 'c' ? comp(h[1]) : null;
  var c = C && h[2] ? esporte(C, h[2]) : null;

  if (act === 'fechar') { S = null; dlg.close(); }
  else if (act === 'publico') { db.publico = !db.publico; refresh(); }
  else if (act === 'filtro') { FJ = el.dataset.v; route(); }
  else if (act === 'compartilhar') {
    var url = location.href;
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { toast('Link copiado.'); }, function () { prompt('Copie o link:', url); });
  }
  else if (act === 'imprimir') { window.print(); }
  else if (act === 'recuperar') {
    var em = $('#mf').email.value.trim();
    if (!em) { toast('Informe o e-mail para receber o link.'); return; }
    Nuvem.recuperar(em).then(function () { toast('Enviamos um link de redefinição para o e-mail.'); }).catch(function (er) { toast(msgAuth(er)); });
  }
  else if (act === 'conta') {
    if (USER) { Nuvem.sair().then(function () { toast('Sessão encerrada.'); }); return; }
    modal('Entrar',
      '<label>E-mail<input name="email" type="email" required autocomplete="username"></label>' +
      '<label>Senha<input name="senha" type="password" required minlength="6" autocomplete="current-password"></label>' +
      '<p class="mut">Ainda não tem conta? Preencha e use “Criar conta”.</p>' +
      '<div class="row"><button type="button" class="btn btn-o sm" data-act="cadastrar">Criar conta</button>' +
      '<button type="button" class="link" data-act="recuperar">Esqueci a senha</button></div>',
      function (fd) {
        Nuvem.entrar(fd.email.trim(), fd.senha).then(function () { dlg.close(); toast('Bem-vindo!'); })
          .catch(function (er) { toast(msgAuth(er)); });
        return false;
      }, 'Entrar');
  }
  else if (act === 'cadastrar') {
    var fm = $('#mf'); if (!fm.reportValidity()) return;
    Nuvem.cadastrar(fm.email.value.trim(), fm.senha.value).then(function (logou) {
      dlg.close(); toast(logou ? 'Conta criada.' : 'Conta criada. Confirme o e-mail enviado para poder entrar.');
    }).catch(function (er) { toast(msgAuth(er)); });
  }
  else if (act === 'legadoEnviar') {
    var ids2 = db.competicoes.map(function (x) { return x.id; }), n2 = 0;
    legado().forEach(function (L) { if (ids2.indexOf(L.id) < 0) { L.owner = USER.id; db.competicoes.push(L); n2++; } });
    try { localStorage.removeItem('arena.legado'); } catch (er) {}
    refresh(); toast(n2 + ' competição(ões) enviada(s) para a nuvem.');
  }
  else if (act === 'legadoDescartar') {
    if (confirm('Descartar os dados antigos deste navegador?')) { try { localStorage.removeItem('arena.legado'); } catch (er) {} route(); }
  }
  else if (act === 'novaComp') {
    modal('Nova competição', formComp(), function (fd) {
      var n = { id: uid(), owner: USER.id, nome: fd.nome.trim(), local: (fd.local || '').trim(), esportes: [] };
      db.competicoes.push(n); save(); location.hash = '#/c/' + n.id;
    }, 'Criar');
  }
  else if (act === 'exportar') {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' }));
    a.download = 'arena-competicoes.json'; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  else if (!C) return;
  else if (act === 'editComp') {
    modal('Editar competição', formComp(C), function (fd) { C.nome = fd.nome.trim(); C.local = (fd.local || '').trim(); refresh(); });
  }
  else if (act === 'delComp') {
    if (confirm('Excluir a competição “' + C.nome + '” com todos os esportes e resultados?')) {
      db.competicoes = db.competicoes.filter(function (x) { return x !== C; }); save(); location.hash = '#/';
    }
  }
  else if (act === 'novoEsporte') {
    modal('Novo esporte', formEsporte(), function (fd) {
      var n = { id: uid(), equipes: [], atletas: [], jogos: [], grupos: [], gerado: false, mataGerado: false };
      lerEsporte(fd, n); C.esportes.push(n); save(); location.hash = '#/c/' + C.id + '/' + n.id + '/equipes';
    }, 'Criar');
  }
  else if (!c) return;
  else if (act === 'editEsporte') {
    modal('Editar esporte', formEsporte(c), function (fd) { lerEsporte(fd, c); refresh(); });
  }
  else if (act === 'delEsporte') {
    if (confirm('Excluir o esporte “' + c.modalidade + '” com equipes, atletas e jogos?')) {
      C.esportes = C.esportes.filter(function (x) { return x !== c; }); save(); location.hash = '#/c/' + C.id;
    }
  }
  else if (act === 'gerar') {
    var m = gerarJogos(c); if (m) toast(m); else { refresh(); toast('Jogos gerados.'); }
  }
  else if (act === 'gerarFinal') {
    var m2 = gerarFinal(c); if (m2) toast(m2); else { refresh(); toast('Mata-mata gerado.'); }
  }
  else if (act === 'reiniciar') {
    if (confirm('Apagar todos os jogos e resultados e liberar as equipes para edição?')) {
      c.jogos = []; c.grupos = []; c.gerado = false; c.mataGerado = false; refresh();
    }
  }
  else if (act === 'novaEquipe' || act === 'editEquipe') {
    var q = id ? eq(c, id) : { nome: '', sigla: '', tecnico: '' };
    modal(id ? 'Editar equipe' : 'Nova equipe',
      '<label>Nome *<input name="nome" required value="' + esc(q.nome) + '"></label>' +
      '<div class="f2"><label>Sigla<input name="sigla" maxlength="4" value="' + esc(q.sigla) + '"></label>' +
      '<label>Técnico<input name="tecnico" value="' + esc(q.tecnico) + '"></label></div>',
      function (fd) {
        var nome = fd.nome.trim();
        if (c.equipes.some(function (x) { return x.id !== id && x.nome.toLowerCase() === nome.toLowerCase(); })) { toast('Já existe uma equipe com esse nome.'); return false; }
        if (!id) { q = { id: uid() }; c.equipes.push(q); }
        q.nome = nome; q.sigla = fd.sigla.trim().toUpperCase(); q.tecnico = fd.tecnico.trim(); refresh();
      });
  }
  else if (act === 'delEquipe') {
    if (confirm('Excluir esta equipe e seus atletas?')) {
      c.equipes = c.equipes.filter(function (x) { return x.id !== id; });
      c.atletas = c.atletas.filter(function (x) { return x.equipeId !== id; }); refresh();
    }
  }
  else if (act === 'novoAtleta' || act === 'editAtleta') {
    var at = id ? c.atletas.filter(function (x) { return x.id === id; })[0] : { nome: '', numero: '', posicao: '', equipeId: c.equipes[0].id };
    modal(id ? 'Editar atleta' : 'Novo atleta',
      '<label>Equipe<select name="equipeId">' + opts(c.equipes.map(function (x) { return [x.id, x.nome]; }), at.equipeId) + '</select></label>' +
      '<label>Nome *<input name="nome" required value="' + esc(at.nome) + '"></label>' +
      '<div class="f2"><label>Número<input type="number" min="0" max="999" name="numero" value="' + esc(at.numero) + '"></label>' +
      '<label>Posição<input name="posicao" value="' + esc(at.posicao) + '"></label></div>',
      function (fd) {
        var n = num(fd.numero);
        if (n != null && c.atletas.some(function (x) { return x.id !== id && x.equipeId === fd.equipeId && x.numero === n; })) { toast('Número já usado nesta equipe.'); return false; }
        if (!id) { at = { id: uid() }; c.atletas.push(at); }
        at.equipeId = fd.equipeId; at.nome = fd.nome.trim(); at.numero = n; at.posicao = fd.posicao.trim(); refresh();
      });
  }
  else if (act === 'delAtleta') {
    if (confirm('Excluir este atleta?')) { c.atletas = c.atletas.filter(function (x) { return x.id !== id; }); refresh(); }
  }
  else if (act === 'sumula') {
    var j = c.jogos.filter(function (x) { return x.id === id; })[0];
    if (!j) return;
    if (db.publico) return;
    if (!j.casa || !j.fora) { toast('Partida ainda sem as duas equipes definidas.'); return; }
    abrirSumula(c, j);
  }
  else if (act === 'addEv' && S) {
    lerSumula();
    var tipo = $('#evTipo').value, atlId = $('#evAtl').value, eqId = $('#evEq').value;
    if (atlId) {
      var aa = S.c.atletas.filter(function (x) { return x.id === atlId; })[0];
      if (aa) eqId = aa.equipeId;
    }
    var mi = num($('#evMin').value);
    S.d.eventos.push({ tipo: tipo, equipeId: eqId, atletaId: atlId || null, minuto: mi });
    placarPorEventos(S.d); desenharSumula();
  }
  else if (act === 'delEv' && S) {
    lerSumula(); S.d.eventos.splice(parseInt(el.dataset.i, 10), 1); placarPorEventos(S.d); desenharSumula();
  }
});

dlg.addEventListener('close', function () { S = null; });
window.addEventListener('hashchange', route);
document.addEventListener('input', function (e) {
  if (e.target.id !== 'busca') return;
  var q = e.target.value.trim().toLowerCase();
  document.querySelectorAll('#lista .card').forEach(function (c) { c.style.display = !q || c.dataset.nome.indexOf(q) >= 0 ? '' : 'none'; });
});
setInterval(function () {
  if (!REMOTO || USER || document.hidden || dlg.open) return;
  Nuvem.carregar().then(function (comps) {
    if (JSON.stringify(comps) !== JSON.stringify(db.competicoes)) { db.competicoes = comps; route(); }
  }).catch(function () {});
}, 30000);

(function iniciar() {
  try {
    if (!localStorage.getItem('arena.migrado')) {
      if (db.competicoes.length) localStorage.setItem('arena.legado', JSON.stringify(db.competicoes));
      localStorage.setItem('arena.migrado', '1');
    }
  } catch (e) {}
  if (!window.Nuvem || !Nuvem.disponivel()) {
    CARREGANDO = false; ERRO = 'Não foi possível carregar o Supabase. Exibindo dados salvos neste navegador, somente leitura.'; route(); return;
  }
  Nuvem.aoStatus(function (st, msg) {
    if (st === 'erro') toast('Erro ao salvar na nuvem: ' + msg); else if (st === 'ok') toast('Salvo na nuvem.');
  });
  route();
  Nuvem.iniciar(function (u, ev) {
    var mudou = (u && u.id) !== (USER && USER.id);
    USER = u;
    if (!CARREGANDO && mudou) route();
    if (ev === 'PASSWORD_RECOVERY') abrirNovaSenha();
  })
    .then(function () { return Nuvem.carregar(); })
    .then(function (comps) {
      db.competicoes = comps; REMOTO = true; CARREGANDO = false;
      try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {}
      route();
    })
    .catch(function (e) {
      CARREGANDO = false;
      ERRO = 'Não foi possível carregar o banco de dados (' + ((e && e.message) || e) + '). Confira se o arquivo supabase/schema.sql foi executado no projeto. Exibindo dados salvos neste navegador, somente leitura.';
      route();
    });
})();
})();
