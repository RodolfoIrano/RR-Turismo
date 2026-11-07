// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Monta a PÁGINA HTML do mapa (Leaflet) que roda dentro da WebView.
// É usada pelo MiniMapa (local da viagem) e pelo MapaAoVivo (guia e
// participantes).
//
// Foi feita para NÃO ficar cinza/quebrada:
//  - o Leaflet vem EMBUTIDO no app (leafletEmbutido.ts), sem baixar
//    de nenhum site;
//  - as imagens do mapa têm 2 provedores (Carto e Esri). Se o primeiro
//    não carregar (erro ou demora), troca sozinho para o segundo;
//  - se TUDO falhar, mostra uma mensagem clara e avisa o app
//    (postMessage) em vez de deixar uma tela vazia.
//
// Funções que o app chama por injectJavaScript:
//   atualizar(pontos)  -> desenha/move os marcadores
//   ajustar()          -> enquadra todos os marcadores na tela
//   focar(id)          -> centraliza em um marcador (zoom de rua)
// ============================================================
import { LEAFLET_CSS, LEAFLET_JS } from "./leafletEmbutido";

const ESTILO_DO_MAPA = `
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
`;

const SCRIPT_DO_MAPA = `
  function avisarApp(msg){ try{ window.ReactNativeWebView.postMessage(msg); }catch(e){} }
  function mostrarAviso(t){ var a=document.getElementById('aviso'); a.textContent=t; a.style.display='block'; }
  function esconderAviso(){ document.getElementById('aviso').style.display='none'; }

  var mapa=null, marcadores={}, primeiraVez=true;

  // ---- imagens do mapa: 2 provedores (troca sozinho se um falhar) ----
  var PROVEDORES=[
    {url:'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', sub:'abcd', attr:'© OpenStreetMap © CARTO'},
    {url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', sub:'abc', attr:'Tiles © Esri'}
  ];
  var camada=null, erros=0, carregou=false, relogio=null, desistiu=false;

  function usarProvedor(i){
    if(desistiu) return;
    if(relogio){ clearTimeout(relogio); relogio=null; }
    if(i>=PROVEDORES.length){
      desistiu=true;
      avisarApp('erro:tiles');
      mostrarAviso('Não foi possível baixar as imagens do mapa. Confira a internet do celular/emulador.');
      return;
    }
    if(camada){ mapa.removeLayer(camada); }
    erros=0;
    var p=PROVEDORES[i];
    camada=L.tileLayer(p.url,{maxZoom:19,maxNativeZoom:19,subdomains:p.sub,attribution:p.attr});
    camada.on('tileload',function(){
      if(!carregou){ carregou=true; esconderAviso(); }
      if(relogio){ clearTimeout(relogio); relogio=null; }
    });
    camada.on('tileerror',function(){ erros++; if(!carregou && erros>=3) usarProvedor(i+1); });
    camada.addTo(mapa);
    // se em 7 s nenhuma imagem chegou, tenta o próximo provedor
    relogio=setTimeout(function(){ if(!carregou) usarProvedor(i+1); },7000);
  }

  function iniciarMapa(){
    try{
      mapa=L.map('mapa',{zoomControl:true}).setView([-14.2,-51.9],4);
      mostrarAviso('Carregando o mapa...');
      usarProvedor(0);
      // WebView às vezes inicia com tamanho 0: recalcula o tamanho depois de aparecer.
      setTimeout(function(){ mapa.invalidateSize(); },300);
      setTimeout(function(){ mapa.invalidateSize(); },1200);
      window.addEventListener('resize',function(){ mapa.invalidateSize(); });
      avisarApp('pronto');
      if(window.__pendente){ atualizar(window.__pendente); window.__pendente=null; }
    }catch(e){
      avisarApp('erro:leaflet');
      mostrarAviso('Erro ao iniciar o mapa: '+e.message);
    }
  }

  // ---- funções chamadas pelo app ----
  function atualizar(pontos){
    if(!mapa){ window.__pendente=pontos; return; }
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

  iniciarMapa();
`;

// A página inteira: Leaflet embutido + estilo + script do mapa.
export const HTML_DO_MAPA = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="referrer" content="origin">
<style>${LEAFLET_CSS}</style>
<style>${ESTILO_DO_MAPA}</style>
</head><body><div id="mapa"></div><div id="aviso"></div>
<script>${LEAFLET_JS}</script>
<script>${SCRIPT_DO_MAPA}</script>
</body></html>`;
