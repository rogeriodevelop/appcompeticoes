/* Botão "Instalar app": usa o aviso nativo do navegador (Chrome/Edge/Android) e, no iPhone/iPad, mostra o passo a passo. */
(function () {
'use strict';
var bts = [].slice.call(document.querySelectorAll('[data-instalar]'));
if (!bts.length) return;
var evento = null;
var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function mostrar(v) { bts.forEach(function (b) { b.style.display = v ? '' : 'none'; }); }
function aviso(html) {
  var d = document.createElement('div');
  d.setAttribute('style', 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:grid;place-items:center;padding:16px');
  d.innerHTML = '<div role="dialog" aria-modal="true" style="background:#fff;color:#0f172a;border-radius:14px;max-width:380px;padding:22px;font:15px/1.5 system-ui,sans-serif;box-shadow:0 20px 50px rgba(0,0,0,.35)">' + html +
    '<div style="text-align:right;margin-top:14px"><button type="button" style="background:#16a34a;color:#fff;border:0;border-radius:10px;padding:9px 18px;font-weight:600;cursor:pointer">Entendi</button></div></div>';
  d.addEventListener('click', function (e) { if (e.target === d || e.target.tagName === 'BUTTON') d.remove(); });
  document.body.appendChild(d);
}

mostrar(false);
if (standalone) return;
if (ios) mostrar(true);

window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); evento = e; mostrar(true); });
window.addEventListener('appinstalled', function () { evento = null; mostrar(false); });

[].slice.call(document.querySelectorAll('[data-instalar-acao]')).forEach(function (b) {
  b.addEventListener('click', function (e) {
    e.preventDefault();
    if (evento) {
      evento.prompt();
      evento.userChoice.then(function () { evento = null; mostrar(false); });
    } else if (ios) {
      aviso('<h3 style="margin:0 0 8px">Instalar no iPhone/iPad</h3><ol style="margin:0;padding-left:20px"><li>Toque no botão <b>Compartilhar</b> (quadrado com seta) do Safari.</li><li>Escolha <b>Adicionar à Tela de Início</b>.</li><li>Confirme em <b>Adicionar</b>.</li></ol>');
    }
  });
});
})();
