// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Monta a PÁGINA HTML do mapa (Leaflet + OpenStreetMap) que roda
// dentro da WebView. É usada pelo MiniMapa (local da viagem) e pelo
// MapaAoVivo (guia e participantes).
//
// Foi feita para NÃO ficar em branco quando algo falha:
//  - a biblioteca Leaflet tem 3 endereços (unpkg, cdnjs, jsdelivr)
//    e tenta um depois do outro;
//  - as imagens do mapa têm 2 provedores (Carto e OpenStreetMap) e
//    troca sozinho se o primeiro não carregar;
//  - se TUDO falhar, avisa o app (postMessage) para mostrar uma
//    mensagem clara em vez de uma tela vazia.
//
// Funções que o app chama por injectJavaScript:
//   atualizar(pontos)  -> desenha/move os marcadores
//   ajustar()          -> enquadra todos os marcadores na tela
// ============================================================

export const HTML_DO_MAPA = `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  html,body,#mapa{height:100%;margin:0;padding:0;background:#dfe7ee}
  .pino{border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px rgba(0,0,0,.25);}
  /* "VOCÊ": bolinha azul com halo pulsando, igual ao GPS do celular */
  .voce{position:relative;width:20px;height:20px;border-radius:50%;background:#1a73e8;border:3px solid #fff;
        box-shadow:0 0 6px rgba(0,0,0,.45);}
  .voce:after{content:"";position:absolute;left:-13px;top:-13px;width:40px;height:40px;border-radius:50%;
        background:rgba(26,115,232,.35);animation:pulso 1.8s ease-out infinite;}
  @keyframes pulso{0%{transform:scale(.3);opacity:.9}100%{transform:scale(1.2);opacity:0}}
  .estrela{font-size:26px;line-height:26px;text-align:center;text-shadow:0 0 4px #000;}
  .rotulo{background:rgba(11,31,42,.88);color:#fff;border:0;border-radius:6px;font:600 11px sans-serif;padding:2px 6px}
  #aviso{position:absolute;left:8px;right:8px;top:8px;z-index:9999;background:#fff3cd;color:#664d03;
         font:600 12px sans-serif;padding:8px 10px;border-radius:8px;display:none}
</style>
</head><body><div id="mapa"></div><div id="aviso"></div>
<script>
  function avisarApp(msg){ try{ window.ReactNativeWebView.postMessage(msg); }catch(e){} }
  function mostrarAviso(t){ var a=document.getElementById('aviso'); a.textContent=t; a.style.display='block'; }

  var mapa=null, marcadores={}, primeiraVez=true, pendente=null;

  // ---- 1) carrega a biblioteca Leaflet (3 endereços) ----
  var FONTES_JS=[
    ['https://unpkg.com/leaflet@1.9.4/dist/leaflet.js','https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'],
    ['https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js','https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css'],
    ['https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js','https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css']
  ];
  function carregarLeaflet(i){
    if(i>=FONTES_JS.length){ avisarApp('erro:leaflet'); return; }
    var css=document.createElement('link'); css.rel='stylesheet'; css.href=FONTES_JS[i][1]; document.head.appendChild(css);
    var s=document.createElement('script'); s.src=FONTES_JS[i][0];
    s.onload=iniciarMapa;
    s.onerror=function(){ carregarLeaflet(i+1); };
    document.head.appendChild(s);
  }

  // ---- 2) cria o mapa com 2 provedores de imagem ----
  var PROVEDORES=[
    {url:'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', sub:'abcd', attr:'© OpenStreetMap © CARTO'},
    {url:'https://tile.openstreetmap.org/{z}/{x}/{y}.png', sub:'abc', attr:'© OpenStreetMap'}
  ];
  var provedorAtual=0, camada=null, erros=0, carregou=false;
  function usarProvedor(i){
    if(i>=PROVEDORES.length){ avisarApp('erro:tiles'); mostrarAviso('Não foi possível baixar as imagens do mapa. Confira a internet.'); return; }
    if(camada) mapa.removeLayer(camada);
    provedorAtual=i; erros=0;
    var p=PROVEDORES[i];
    camada=L.tileLayer(p.url,{maxZoom:19,maxNativeZoom:19,subdomains:p.sub,attribution:p.attr});
    camada.on('tileload',function(){ carregou=true; });
    camada.on('tileerror',function(){ erros++; if(!carregou && erros>=4) usarProvedor(provedorAtual+1); });
    camada.addTo(mapa);
  }
  function iniciarMapa(){
    mapa=L.map('mapa',{zoomControl:true}).setView([-14.2,-51.9],4);
    usarProvedor(0);
    avisarApp('pronto');
    if(pendente){ atualizar(pendente); pendente=null; }
  }

  // ---- 3) funções chamadas pelo app ----
  function atualizar(pontos){
    if(!mapa){ pendente=pontos; return; }
    var vivos={};
    pontos.forEach(function(p){
      vivos[p.id]=true;
      // eu = bolinha azul pulsante (você); guia (para os outros) = estrela; participante = bolinha na cor do estado
      var icone=p.eu
        ? L.divIcon({className:'',html:'<div class="voce"></div>',iconSize:[20,20],iconAnchor:[10,10]})
        : (p.guia
          ? L.divIcon({className:'',html:'<div class="estrela" style="color:'+p.cor+'">★</div>',iconSize:[26,26],iconAnchor:[13,13]})
          : L.divIcon({className:'',html:'<div class="pino" style="background:'+p.cor+';width:20px;height:20px"></div>',iconSize:[20,20],iconAnchor:[10,10]}));
      if(marcadores[p.id]){
        marcadores[p.id].setLatLng([p.lat,p.lng]).setIcon(icone);
        marcadores[p.id].setTooltipContent(p.nome);
      } else {
        marcadores[p.id]=L.marker([p.lat,p.lng],{icon:icone}).addTo(mapa)
          .bindTooltip(p.nome,{permanent:true,direction:'top',offset:[0,-10],className:'rotulo'});
      }
    });
    Object.keys(marcadores).forEach(function(id){
      if(!vivos[id]){ mapa.removeLayer(marcadores[id]); delete marcadores[id]; }
    });
    if(primeiraVez && pontos.length){ ajustar(); primeiraVez=false; }
  }
  function ajustar(){
    if(!mapa) return;
    var lista=Object.keys(marcadores).map(function(id){return marcadores[id].getLatLng();});
    if(!lista.length) return;
    if(lista.length===1){ mapa.setView(lista[0],17); }  // 17 = nível de RUA
    else { mapa.fitBounds(L.latLngBounds(lista),{padding:[40,40],maxZoom:18}); }
  }

  // Centraliza no marcador de um participante (ao tocar no nome dele na lista).
  function focar(id){
    if(!mapa || !marcadores[id]) return;
    mapa.setView(marcadores[id].getLatLng(), 19, {animate:true});
  }

  carregarLeaflet(0);
  // se em 12 s o mapa não abriu, avisa o app
  setTimeout(function(){ if(!mapa) avisarApp('erro:leaflet'); },12000);
</script></body></html>`;
