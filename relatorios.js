/* Relatórios e gráficos para a equipe técnica (aba "Relatórios" de cada esporte).
   Uso (app.js): var R = criarRelatorios(auxiliares); R.aba(c); R.csv(c, tipo); R.equipe(id). Gráficos em SVG puro, sem bibliotecas. */
window.criarRelatorios = function (H) {
'use strict';
var esc = H.esc, eq = H.eq, nomeEq = H.nomeEq, nomeLado = H.nomeLado, contagem = H.contagem, usaSets = H.usaSets, fmtData = H.fmtData;
var REL_EQ = null;
var COR = { v: '#16a34a', e: '#f59e0b', d: '#dc2626', pro: '#2563eb', contra: '#94a3b8', am: '#eab308', vm: '#dc2626' };

function relBarras(itens, max, cor, sufixo) {
  max = max || 1;
  return '<div class="gr">' + itens.map(function (x) {
    var w = Math.round(x.v * 100 / max);
    return '<div class="gr-l"><span class="gr-n" title="' + esc(x.nome) + '">' + esc(x.nome) + '</span><span class="gr-b"><i style="width:' + w + '%;background:' + (x.cor || cor) + '"></i></span><b>' + x.v + (sufixo || '') + '</b></div>';
  }).join('') + '</div>';
}
function relEmpilhado(itens, legenda) {
  return '<div class="gr-leg">' + legenda.map(function (l) { return '<span><i style="background:' + l.cor + '"></i>' + l.nome + '</span>'; }).join('') + '</div>' +
    '<div class="gr">' + itens.map(function (x) {
      var tot = x.p.reduce(function (s, n) { return s + n; }, 0) || 1;
      return '<div class="gr-l"><span class="gr-n" title="' + esc(x.nome) + '">' + esc(x.nome) + '</span><span class="gr-b">' +
        x.p.map(function (n, i) { return n ? '<i title="' + legenda[i].nome + ': ' + n + '" style="width:' + (n * 100 / tot) + '%;background:' + legenda[i].cor + '"></i>' : ''; }).join('') +
        '</span><b>' + x.p.join('-') + '</b></div>';
    }).join('') + '</div>';
}
function relColunas(rotulos, valores, cor) {
  var max = Math.max.apply(null, valores.concat([1])), w = 520, h = 170, bw = w / valores.length;
  return '<svg class="gr-col" viewBox="0 0 ' + w + ' ' + (h + 34) + '" role="img" aria-label="Gráfico de colunas">' + valores.map(function (v, i) {
    var alt = Math.round(v * h / max), x = i * bw + bw * 0.15;
    return '<rect x="' + x.toFixed(1) + '" y="' + (h - alt + 14) + '" width="' + (bw * 0.7).toFixed(1) + '" height="' + alt + '" rx="4" fill="' + cor + '"><title>' + rotulos[i] + ': ' + v + '</title></rect>' +
      '<text x="' + (x + bw * 0.35).toFixed(1) + '" y="' + (h - alt + 9) + '" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">' + (v || '') + '</text>' +
      '<text x="' + (x + bw * 0.35).toFixed(1) + '" y="' + (h + 30) + '" text-anchor="middle" font-size="11" fill="currentColor" opacity=".7">' + rotulos[i] + '</text>';
  }).join('') + '</svg>';
}

/* Resultados de todos os jogos encerrados (qualquer fase) */
function relJogosFin(c) {
  return c.jogos.filter(function (j) { return !j.bye && j.status === 'fin' && j.casa && j.fora && j.gc != null && j.gf != null; });
}
function relVenc(j) {
  if (j.gc > j.gf) return 'c';
  if (j.gc < j.gf) return 'f';
  if (j.pc != null && j.pf != null && j.pc !== j.pf) return j.pc > j.pf ? 'c' : 'f';
  return 'e';
}
function relEquipes(c) {
  var t = {};
  c.equipes.forEach(function (e) { t[e.id] = { id: e.id, nome: e.nome, j: 0, v: 0, e: 0, d: 0, pm: 0, ps: 0, pts: 0, forma: [] }; });
  relJogosFin(c).slice().sort(function (a, b) { return String(a.data || '').localeCompare(String(b.data || '')); }).forEach(function (j) {
    var a = t[j.casa], b = t[j.fora]; if (!a || !b) return;
    var w = relVenc(j);
    a.j++; b.j++; a.pm += j.gc; a.ps += j.gf; b.pm += j.gf; b.ps += j.gc;
    if (w === 'c') { a.v++; b.d++; a.pts += 3; a.forma.push('V'); b.forma.push('D'); }
    else if (w === 'f') { b.v++; a.d++; b.pts += 3; a.forma.push('D'); b.forma.push('V'); }
    else { a.e++; b.e++; a.pts++; b.pts++; a.forma.push('E'); b.forma.push('E'); }
  });
  return Object.keys(t).map(function (k) { var x = t[k]; x.apr = x.j ? Math.round(x.pts * 100 / (3 * x.j)) : 0; x.sg = x.pm - x.ps; return x; });
}
function relAtletas(c) {
  var m = {};
  c.atletas.forEach(function (a) { m[a.id] = { a: a, g: 0, am: 0, vm: 0 }; });
  c.jogos.forEach(function (j) {
    if (j.status !== 'fin') return;
    (j.eventos || []).forEach(function (ev) {
      var x = ev.atletaId && m[ev.atletaId]; if (!x) return;
      if (ev.tipo === 'gol') x.g++; else if (ev.tipo === 'amarelo') x.am++; else if (ev.tipo === 'vermelho') x.vm++;
    });
  });
  return Object.keys(m).map(function (k) { return m[k]; });
}
function relForma(f) {
  return '<span class="forma">' + f.slice(-5).map(function (r) { return '<i class="f' + r + '">' + r + '</i>'; }).join('') + '</span>';
}
function relCard(n, rotulo) { return '<div class="stat"><b>' + n + '</b><span>' + rotulo + '</span></div>'; }

function abaRelatorios(c) {
  var fin = relJogosFin(c), k = contagem(c), eqs = relEquipes(c), ats = relAtletas(c), sets = usaSets(c);
  var un = sets ? 'sets' : 'gols/pontos';
  if (!c.gerado || !c.equipes.length) {
    return '<div class="empty"><b>Sem dados para relatórios</b>Cadastre as equipes e gere os jogos. Os relatórios aparecem conforme os resultados são lançados.</div>';
  }
  var marc = fin.reduce(function (s, j) { return s + j.gc + j.gf; }, 0);
  var vc = fin.filter(function (j) { return relVenc(j) === 'c'; }).length, em = fin.filter(function (j) { return relVenc(j) === 'e'; }).length;
  var maior = fin.slice().sort(function (a, b) { return Math.abs(b.gc - b.gf) - Math.abs(a.gc - a.gf); })[0];
  var cart = ats.reduce(function (s, x) { return s + x.am + x.vm; }, 0);
  var html = '<div class="row between noprint" style="margin:14px 0 4px"><span class="mut">Relatórios para a comissão técnica: dados dos jogos encerrados.</span>' +
    '<span class="row"><button class="btn btn-o sm" data-act="relCsv" data-k="jogos">⬇ Jogos (CSV)</button><button class="btn btn-o sm" data-act="relCsv" data-k="elenco">⬇ Elenco e cartões (CSV)</button>' +
    '<button class="btn btn-o sm" data-act="relCsv" data-k="desempenho">⬇ Desempenho (CSV)</button><button class="btn btn-o sm" data-act="imprimir">🖨️ Imprimir</button></span></div>';

  html += '<div class="stats">' + relCard(k.fin + '/' + k.tot, 'Jogos encerrados') + relCard(fin.length ? (marc / fin.length).toFixed(1) : '0', 'Média de ' + un + ' por jogo') +
    relCard(fin.length ? Math.round(vc * 100 / fin.length) + '%' : '0%', 'Vitórias do mandante') + relCard(sets ? em : cart, sets ? 'Empates' : 'Cartões aplicados') + '</div>';
  if (maior) html += '<p class="mut" style="margin:6px 0 0">Maior diferença: ' + nomeEq(c, maior.casa) + ' ' + maior.gc + ' x ' + maior.gf + ' ' + nomeEq(c, maior.fora) + '.</p>';

  if (!fin.length) {
    return html + '<div class="empty"><b>Nenhum jogo encerrado ainda</b>Os gráficos e rankings aparecem assim que os primeiros resultados forem lançados.</div>' + relAgenda(c);
  }

  var jogaram = eqs.filter(function (x) { return x.j; });
  var porApr = jogaram.slice().sort(function (a, b) { return b.apr - a.apr || b.sg - a.sg; });
  html += '<h2>Aproveitamento</h2><p class="mut">Percentual dos pontos disputados (vitória 3, empate 1).</p>' + relBarras(porApr.map(function (x) { return { nome: x.nome, v: x.apr }; }), 100, COR.v, '%');

  html += '<h2>Vitórias, empates e derrotas</h2>' + relEmpilhado(porApr.map(function (x) { return { nome: x.nome, p: [x.v, x.e, x.d] }; }),
    [{ nome: 'Vitórias', cor: COR.v }, { nome: 'Empates', cor: COR.e }, { nome: 'Derrotas', cor: COR.d }]);

  var maxP = Math.max.apply(null, jogaram.map(function (x) { return Math.max(x.pm, x.ps); }).concat([1]));
  html += '<h2>Ataque e defesa</h2><p class="mut">Marcados (azul) e sofridos (cinza), em ' + un + '.</p><div class="gr-leg"><span><i style="background:' + COR.pro + '"></i>Marcados</span><span><i style="background:' + COR.contra + '"></i>Sofridos</span></div><div class="gr">' +
    jogaram.slice().sort(function (a, b) { return b.sg - a.sg || b.pm - a.pm; }).map(function (x) {
      return '<div class="gr-l"><span class="gr-n" title="' + esc(x.nome) + '">' + esc(x.nome) + '</span><span class="gr-b dupla"><i style="width:' + Math.round(x.pm * 100 / maxP) + '%;background:' + COR.pro + '"></i><i style="width:' + Math.round(x.ps * 100 / maxP) + '%;background:' + COR.contra + '"></i></span><b>' + x.pm + ' x ' + x.ps + '</b></div>';
    }).join('') + '</div>';

  html += '<h2>Forma recente</h2><div class="tw"><table><tr><th class="l">Equipe</th><th>Últimos 5</th><th>J</th><th>V</th><th>E</th><th>D</th><th>Saldo</th></tr>' +
    jogaram.slice().sort(function (a, b) { return b.pts - a.pts || b.sg - a.sg; }).map(function (x) {
      return '<tr><td class="l">' + esc(x.nome) + '</td><td>' + relForma(x.forma) + '</td><td>' + x.j + '</td><td>' + x.v + '</td><td>' + x.e + '</td><td>' + x.d + '</td><td>' + (x.sg > 0 ? '+' : '') + x.sg + '</td></tr>';
    }).join('') + '</table></div>';

  var art = ats.filter(function (x) { return x.g; }).sort(function (a, b) { return b.g - a.g; }).slice(0, 10);
  if (art.length) html += '<h2>Artilharia</h2>' + relBarras(art.map(function (x) { return { nome: x.a.nome + ' (' + (eq(c, x.a.equipeId) || { nome: '' }).nome + ')', v: x.g }; }), art[0].g, COR.pro);

  var porEq = {};
  ats.forEach(function (x) { var e = eq(c, x.a.equipeId); if (!e) return; porEq[e.id] = porEq[e.id] || { nome: e.nome, p: [0, 0] }; porEq[e.id].p[0] += x.am; porEq[e.id].p[1] += x.vm; });
  var disc = Object.keys(porEq).map(function (i) { return porEq[i]; }).filter(function (x) { return x.p[0] + x.p[1]; }).sort(function (a, b) { return (b.p[1] * 3 + b.p[0]) - (a.p[1] * 3 + a.p[0]); });
  if (disc.length) html += '<h2>Disciplina por equipe</h2>' + relEmpilhado(disc, [{ nome: 'Amarelos', cor: COR.am }, { nome: 'Vermelhos', cor: COR.vm }]);
  var risco = ats.filter(function (x) { return x.vm || x.am >= 2; }).sort(function (a, b) { return (b.vm * 3 + b.am) - (a.vm * 3 + a.am); });
  if (risco.length) html += '<h2>Atenção disciplinar</h2><p class="mut">Atletas com cartão vermelho ou 2 ou mais amarelos. Confira no regulamento se há suspensão.</p><div class="tw"><table><tr><th class="l">Atleta</th><th class="l">Equipe</th><th>Amarelos</th><th>Vermelhos</th></tr>' +
    risco.map(function (x) { return '<tr><td class="l">' + esc(x.a.nome) + '</td><td class="l">' + nomeEq(c, x.a.equipeId) + '</td><td>' + x.am + '</td><td>' + x.vm + '</td></tr>'; }).join('') + '</table></div>';

  if (!sets) {
    var faixas = ['0-15', '16-30', '31-45', '46-60', '61-75', '76+'], cont = [0, 0, 0, 0, 0, 0], n = 0;
    c.jogos.forEach(function (j) {
      if (j.status !== 'fin') return;
      (j.eventos || []).forEach(function (ev) {
        if ((ev.tipo !== 'gol' && ev.tipo !== 'contra') || ev.minuto == null || ev.minuto === '') return;
        var m = parseInt(ev.minuto, 10); if (isNaN(m)) return;
        cont[Math.min(5, Math.max(0, Math.ceil(m / 15) - 1))]++; n++;
      });
    });
    if (n) html += '<h2>Gols por período do jogo</h2><p class="mut">Minutos com gol, em faixas de 15 minutos (' + n + ' gols com minuto informado).</p>' + relColunas(faixas, cont, COR.pro);
  }

  html += relEquipe(c, eqs, ats) + relAgenda(c);
  return html;
}

function relEquipe(c, eqs, ats) {
  if (!REL_EQ || !eq(c, REL_EQ)) REL_EQ = c.equipes[0].id;
  var e = eq(c, REL_EQ), r = eqs.filter(function (x) { return x.id === e.id; })[0];
  var chips = c.equipes.map(function (x) {
    return '<button class="btn sm ' + (x.id === e.id ? 'btn-p' : 'btn-o') + '" data-act="relEquipe" data-id="' + esc(x.id) + '">' + esc(x.nome) + '</button>';
  }).join('');
  var meus = c.jogos.filter(function (j) { return !j.bye && (j.casa === e.id || j.fora === e.id); }).sort(function (a, b) { return String(a.data || '9').localeCompare(String(b.data || '9')); });
  var lin = meus.map(function (j) {
    var casa = j.casa === e.id, adv = casa ? j.fora : j.casa, fin = j.status === 'fin' && j.gc != null;
    var res = '', cl = '';
    if (fin) { var w = relVenc(j), ganhou = (w === 'c') === casa; res = (casa ? j.gc : j.gf) + ' x ' + (casa ? j.gf : j.gc); cl = w === 'e' ? 'E' : ganhou ? 'V' : 'D'; }
    return '<tr><td class="l">' + esc(fmtData(j.data) || 'a definir') + '</td><td class="l">' + esc(j.fase || '') + '</td><td class="l">' + (casa ? 'Casa' : 'Fora') + ' · ' + nomeLado(c, adv, casa ? j.rf : j.rc) + '</td><td>' + (res || '–') + '</td><td>' + (cl ? '<i class="f' + cl + '">' + cl + '</i>' : '') + '</td></tr>';
  }).join('');
  var elenco = ats.filter(function (x) { return x.a.equipeId === e.id; }).sort(function (a, b) { return b.g - a.g || b.am - a.am; });
  return '<h2 class="noprint-h">Relatório por equipe</h2><div class="row noprint" style="flex-wrap:wrap;margin-bottom:12px">' + chips + '</div>' +
    '<div class="stats">' + relCard(r.j, 'Jogos') + relCard(r.v + 'V ' + r.e + 'E ' + r.d + 'D', 'Campanha') + relCard(r.pm + ' x ' + r.ps, 'Marcados x sofridos') + relCard(r.apr + '%', 'Aproveitamento') + '</div>' +
    '<p style="margin:10px 0 0"><b>Forma:</b> ' + (r.forma.length ? relForma(r.forma) : '<span class="mut">sem jogos encerrados</span>') + '</p>' +
    '<div class="tw"><table><tr><th class="l">Data</th><th class="l">Fase</th><th class="l">Adversário</th><th>Placar</th><th></th></tr>' + (lin || '<tr><td colspan="5" class="mut">Sem jogos.</td></tr>') + '</table></div>' +
    (elenco.length ? '<div class="tw"><table><tr><th class="l">Elenco</th><th>Nº</th><th>Gols</th><th>Amarelos</th><th>Vermelhos</th></tr>' + elenco.map(function (x) {
      return '<tr><td class="l">' + esc(x.a.nome) + '</td><td>' + esc(x.a.numero == null ? '' : x.a.numero) + '</td><td>' + x.g + '</td><td>' + x.am + '</td><td>' + x.vm + '</td></tr>';
    }).join('') + '</table></div>' : '');
}

function relAgenda(c) {
  var js = c.jogos.filter(function (j) { return !j.bye; });
  var sem = js.filter(function (j) { return j.status !== 'fin' && !j.data; }).length;
  var mapa = {}, locais = {}, dias = {};
  js.forEach(function (j) {
    if (!j.data) return;
    var d = j.data.slice(0, 10), l = j.local || 'Sem local';
    mapa[d + '|' + l] = (mapa[d + '|' + l] || 0) + 1; locais[l] = 1; dias[d] = 1;
  });
  var L = Object.keys(locais).sort(), D = Object.keys(dias).sort();
  var prox = js.filter(function (j) { return j.status !== 'fin' && j.data; }).sort(function (a, b) { return a.data.localeCompare(b.data); }).slice(0, 8);
  if (!D.length && !sem) return '';
  return '<h2>Programação</h2>' + (sem ? '<p class="mut">' + sem + ' jogo(s) pendente(s) ainda sem data e horário.</p>' : '') +
    (D.length ? '<p class="mut">Jogos por dia e local.</p><div class="tw"><table><tr><th class="l">Dia</th>' + L.map(function (l) { return '<th>' + esc(l) + '</th>'; }).join('') + '<th>Total</th></tr>' +
      D.map(function (d) {
        var tot = 0;
        return '<tr><td class="l">' + d.slice(8, 10) + '/' + d.slice(5, 7) + '</td>' + L.map(function (l) { var n = mapa[d + '|' + l] || 0; tot += n; return '<td>' + (n || '–') + '</td>'; }).join('') + '<td><b>' + tot + '</b></td></tr>';
      }).join('') + '</table></div>' : '') +
    (prox.length ? '<p class="mut" style="margin-top:14px">Próximos jogos</p><div class="tw"><table><tr><th class="l">Quando</th><th class="l">Local</th><th class="l">Fase</th><th class="l">Confronto</th></tr>' + prox.map(function (j) {
      return '<tr><td class="l">' + esc(fmtData(j.data)) + '</td><td class="l">' + esc(j.local || '') + '</td><td class="l">' + esc(j.fase || '') + '</td><td class="l">' + nomeLado(c, j.casa, j.rc) + ' x ' + nomeLado(c, j.fora, j.rf) + '</td></tr>';
    }).join('') + '</table></div>' : '');
}

function relCsv(c, tipo) {
  function cel(v) { v = String(v == null ? '' : v); return /[;"\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function nm(id) { var e = eq(c, id); return e ? e.nome : ''; }
  var linhas, nome;
  if (tipo === 'jogos') {
    nome = 'jogos';
    linhas = [['fase', 'data', 'hora', 'local', 'casa', 'fora', 'placar_casa', 'placar_fora', 'situacao']].concat(c.jogos.filter(function (j) { return !j.bye; }).map(function (j) {
      var d = j.data || '';
      return [j.fase || '', d.slice(0, 10), d.slice(11, 16), j.local || '', nm(j.casa) || j.rc || '', nm(j.fora) || j.rf || '', j.gc == null ? '' : j.gc, j.gf == null ? '' : j.gf, j.status === 'fin' ? 'encerrado' : 'agendado'];
    }));
  } else if (tipo === 'elenco') {
    nome = 'elenco-cartoes';
    linhas = [['equipe', 'atleta', 'numero', 'gols', 'amarelos', 'vermelhos']].concat(relAtletas(c).map(function (x) { return [nm(x.a.equipeId), x.a.nome, x.a.numero == null ? '' : x.a.numero, x.g, x.am, x.vm]; }));
  } else {
    nome = 'desempenho';
    linhas = [['equipe', 'jogos', 'vitorias', 'empates', 'derrotas', 'marcados', 'sofridos', 'saldo', 'pontos', 'aproveitamento_pct']].concat(relEquipes(c).sort(function (a, b) { return b.pts - a.pts || b.sg - a.sg; }).map(function (x) {
      return [x.nome, x.j, x.v, x.e, x.d, x.pm, x.ps, x.sg, x.pts, x.apr];
    }));
  }
  var csv = '﻿' + linhas.map(function (l) { return l.map(cel).join(';'); }).join('\r\n') + '\r\n';
  var ab = document.createElement('a'); ab.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  ab.download = 'relatorio-' + nome + '-' + String(c.modalidade || 'esporte').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.csv';
  ab.click(); setTimeout(function () { URL.revokeObjectURL(ab.href); }, 1000);
}
return { aba: abaRelatorios, csv: relCsv, equipe: function (id) { REL_EQ = id; } };
};
