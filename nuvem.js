/* Camada de nuvem: Supabase (autenticação + sincronização das tabelas). */
(function () {
'use strict';

var URL_PROJETO = 'https://ehkatujpkryswbslnjcx.supabase.co';
var CHAVE_PUBLICA = 'sb_publishable_6BRG9Jj5IyoRcIMCDxdbLw_FA9hA46R'; // chave publicável: pode ficar no navegador
var ORDEM = ['competicoes', 'esportes', 'grupos', 'equipes', 'atletas', 'jogos', 'eventos'];
var cli = window.supabase ? window.supabase.createClient(URL_PROJETO, CHAVE_PUBLICA) : null;
var sincronizado = {};
var pendente = null, timer = null, rodando = false, sujo = false, aoStatus = function () {};

function uid() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3); }
function vazio() { var r = {}; ORDEM.forEach(function (t) { r[t] = []; }); return r; }
function nn(v) { return v == null || v === '' ? null : v; }

/* ----- aplicação -> linhas ----- */
function paraLinhas(comps) {
  var R = vazio();
  comps.forEach(function (C, ci) {
    R.competicoes.push({ id: C.id, nome: C.nome, local: nn(C.local), regulamento: nn(C.regulamento), ordem: ci });
    C.esportes.forEach(function (E, ei) {
      R.esportes.push({ id: E.id, competicao_id: C.id, modalidade: E.modalidade, categoria: nn(E.categoria), sexo: E.sexo || 'Misto',
        formato: E.formato, turnos: E.turnos || 1, num_grupos: E.numGrupos || 2, classificados: E.classificados || 2,
        gerado: !!E.gerado, mata_gerado: !!E.mataGerado, ordem: ei });
      var grupoDe = {};
      (E.grupos || []).forEach(function (g, gi) {
        if (!g.id) g.id = uid();
        R.grupos.push({ id: g.id, esporte_id: E.id, nome: g.nome, ordem: gi });
        g.equipes.forEach(function (id) { grupoDe[id] = g.id; });
      });
      E.equipes.forEach(function (q, qi) {
        R.equipes.push({ id: q.id, esporte_id: E.id, grupo_id: grupoDe[q.id] || null, nome: q.nome, sigla: nn(q.sigla), tecnico: nn(q.tecnico), ordem: qi });
      });
      E.atletas.forEach(function (a, ai) {
        R.atletas.push({ id: a.id, esporte_id: E.id, equipe_id: a.equipeId, nome: a.nome, numero: a.numero == null ? null : a.numero, posicao: nn(a.posicao), ordem: ai });
      });
      E.jogos.forEach(function (j, ji) {
        R.jogos.push({ id: j.id, esporte_id: E.id, fase: j.fase, rodada: j.rodada, idx: j.idx == null ? null : j.idx, ko: !!j.ko, bye: !!j.bye,
          casa_id: j.casa || null, fora_id: j.fora || null, gc: j.gc, gf: j.gf, pc: j.pc, pf: j.pf,
          data: nn(j.data), local: nn(j.local), status: j.status,
          nome: nn(j.nome), rot_casa: nn(j.rc), rot_fora: nn(j.rf),
          dv_jogo: j.dv ? j.dv.jogo : null, dv_lado: j.dv ? j.dv.lado : null,
          dp_jogo: j.dp ? j.dp.jogo : null, dp_lado: j.dp ? j.dp.lado : null, ordem: ji });
        (j.eventos || []).forEach(function (ev, vi) {
          if (!ev.id) ev.id = uid();
          R.eventos.push({ id: ev.id, jogo_id: j.id, tipo: ev.tipo, equipe_id: ev.equipeId || null, atleta_id: ev.atletaId || null,
            minuto: ev.minuto == null ? null : ev.minuto, ordem: vi });
        });
      });
    });
  });
  return R;
}

/* ----- linhas -> aplicação ----- */
function porOrdem(a, b) { return (a.ordem - b.ordem) || (a.id < b.id ? -1 : 1); }
function deLinhas(T) {
  var gruposPorEsp = {};
  var comps = T.competicoes.slice().sort(porOrdem).map(function (c) {
    return { id: c.id, owner: c.owner, nome: c.nome, local: c.local || '', regulamento: c.regulamento || '', esportes: [] };
  });
  var porId = {}; comps.forEach(function (c) { porId[c.id] = c; });
  var esps = {};
  T.esportes.slice().sort(porOrdem).forEach(function (e) {
    var C = porId[e.competicao_id]; if (!C) return;
    var E = { id: e.id, modalidade: e.modalidade, categoria: e.categoria || '', sexo: e.sexo, formato: e.formato, turnos: e.turnos,
      numGrupos: e.num_grupos, classificados: e.classificados, gerado: e.gerado, mataGerado: e.mata_gerado,
      equipes: [], atletas: [], jogos: [], grupos: [] };
    C.esportes.push(E); esps[E.id] = E;
  });
  var grupos = {};
  T.grupos.slice().sort(porOrdem).forEach(function (g) {
    var E = esps[g.esporte_id]; if (!E) return;
    var G = { id: g.id, nome: g.nome, equipes: [] }; E.grupos.push(G); grupos[g.id] = G;
  });
  T.equipes.slice().sort(porOrdem).forEach(function (q) {
    var E = esps[q.esporte_id]; if (!E) return;
    E.equipes.push({ id: q.id, nome: q.nome, sigla: q.sigla || '', tecnico: q.tecnico || '' });
    if (q.grupo_id && grupos[q.grupo_id]) grupos[q.grupo_id].equipes.push(q.id);
  });
  T.atletas.slice().sort(porOrdem).forEach(function (a) {
    var E = esps[a.esporte_id]; if (!E) return;
    E.atletas.push({ id: a.id, equipeId: a.equipe_id, nome: a.nome, numero: a.numero, posicao: a.posicao || '' });
  });
  var jogos = {};
  T.jogos.slice().sort(porOrdem).forEach(function (j) {
    var E = esps[j.esporte_id]; if (!E) return;
    var J = { id: j.id, fase: j.fase, rodada: j.rodada, casa: j.casa_id, fora: j.fora_id, gc: j.gc, gf: j.gf, pc: j.pc, pf: j.pf,
      data: j.data || '', local: j.local || '', status: j.status, eventos: [], ko: j.ko };
    if (j.ko) J.idx = j.idx;
    if (j.bye) J.bye = true;
    if (j.nome) J.nome = j.nome;
    if (j.rot_casa) J.rc = j.rot_casa;
    if (j.rot_fora) J.rf = j.rot_fora;
    if (j.dv_jogo) J.dv = { jogo: j.dv_jogo, lado: j.dv_lado };
    if (j.dp_jogo) J.dp = { jogo: j.dp_jogo, lado: j.dp_lado };
    E.jogos.push(J); jogos[j.id] = J;
  });
  T.eventos.slice().sort(porOrdem).forEach(function (v) {
    var J = jogos[v.jogo_id]; if (!J) return;
    J.eventos.push({ id: v.id, tipo: v.tipo, equipeId: v.equipe_id, atletaId: v.atleta_id, minuto: v.minuto });
  });
  return comps;
}

async function buscarTudo(tabela) {
  var out = [], de = 0, passo = 1000;
  for (;;) {
    var r = await cli.from(tabela).select('*').order('ordem').order('id').range(de, de + passo - 1);
    if (r.error) throw r.error;
    out = out.concat(r.data);
    if (r.data.length < passo) return out;
    de += passo;
  }
}
function marcar(R) {
  sincronizado = {};
  ORDEM.forEach(function (t) {
    sincronizado[t] = {};
    R[t].forEach(function (r) { sincronizado[t][r.id] = JSON.stringify(r); });
  });
}

var semRegulamento = false, aviso = '';
function semColuna(tabela, linhas) {
  if (tabela !== 'competicoes' || !semRegulamento) return linhas;
  return linhas.map(function (r) { var c = Object.assign({}, r); delete c.regulamento; return c; });
}

async function sincronizar(comps) {
  var R = paraLinhas(comps), t, i;
  for (var k = 0; k < ORDEM.length; k++) {
    t = ORDEM[k];
    var mudou = R[t].filter(function (r) { return sincronizado[t][r.id] !== JSON.stringify(r); });
    for (i = 0; i < mudou.length; i += 500) {
      var lote = mudou.slice(i, i + 500);
      var r1 = await cli.from(t).upsert(semColuna(t, lote));
      if (r1.error && t === 'competicoes' && /regulamento/i.test(r1.error.message || '')) {
        // banco ainda sem a coluna nova: segue salvando o resto e avisa
        semRegulamento = true;
        r1 = await cli.from(t).upsert(semColuna(t, lote));
      }
      if (t === 'competicoes' && semRegulamento && lote.some(function (r) { return r.regulamento; })) {
        aviso = 'O regulamento não foi salvo: rode o supabase/schema.sql atualizado no Supabase.';
      }
      if (r1.error) throw r1.error;
      lote.forEach(function (r) { sincronizado[t][r.id] = JSON.stringify(r); });
    }
  }
  for (k = ORDEM.length - 1; k >= 0; k--) {
    t = ORDEM[k];
    var atuais = {}; R[t].forEach(function (r) { atuais[r.id] = 1; });
    var fora = Object.keys(sincronizado[t]).filter(function (id) { return !atuais[id]; });
    for (i = 0; i < fora.length; i += 100) {
      var ids = fora.slice(i, i + 100);
      var r2 = await cli.from(t).delete().in('id', ids);
      if (r2.error) throw r2.error;
      ids.forEach(function (id) { delete sincronizado[t][id]; });
    }
  }
}
async function rodar() {
  if (rodando) { sujo = true; return; }
  rodando = true;
  try {
    do { sujo = false; aoStatus('salvando'); await sincronizar(pendente); } while (sujo);
    if (aviso) { var a = aviso; aviso = ''; aoStatus('erro', a); } else aoStatus('ok');
  } catch (e) {
    aoStatus('erro', (e && e.message) || String(e));
  } finally { rodando = false; }
}

window.Nuvem = {
  disponivel: function () { return !!cli; },
  aoStatus: function (fn) { aoStatus = fn; },
  async iniciar(aoMudarUsuario) {
    var s = await cli.auth.getSession();
    aoMudarUsuario(s.data.session ? s.data.session.user : null, 'INITIAL');
    cli.auth.onAuthStateChange(function (ev, sessao) { aoMudarUsuario(sessao ? sessao.user : null, ev); });
  },
  async carregar() {
    var T = {};
    for (var k = 0; k < ORDEM.length; k++) T[ORDEM[k]] = await buscarTudo(ORDEM[k]);
    var comps = deLinhas(T);
    marcar(paraLinhas(comps));
    return comps;
  },
  salvar: function (comps) {
    pendente = comps;
    clearTimeout(timer);
    timer = setTimeout(rodar, 400);
  },
  async entrar(email, senha) {
    var r = await cli.auth.signInWithPassword({ email: email, password: senha });
    if (r.error) throw r.error;
  },
  async cadastrar(email, senha) {
    var r = await cli.auth.signUp({ email: email, password: senha });
    if (r.error) throw r.error;
    return !!r.data.session;
  },
  async sair() { await cli.auth.signOut(); },
  async recuperar(email) {
    var r = await cli.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
    if (r.error) throw r.error;
  },
  async novaSenha(senha) {
    var r = await cli.auth.updateUser({ password: senha });
    if (r.error) throw r.error;
  }
};
})();
