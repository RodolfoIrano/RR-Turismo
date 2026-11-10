/* ============================================================
   📄 O QUE ESTE ARQUIVO FAZ:
   Mostra o MAPA "Onde fica" na página da viagem (igual ao do app).
   Descobre as coordenadas pelo NOME do local (geocodificação gratuita,
   sem chave de API), tentando várias frases do mais específico para o
   mais geral, e desenha um mapa Leaflet com um marcador azul.

   Para não falhar:
     - tenta 2 serviços: Nominatim (OpenStreetMap) e Open-Meteo;
     - tenta "destino, local", depois "local", depois "destino";
     - guarda o resultado no navegador (cache) para abrir rápido;
     - imagens do mapa: Esri e, se falhar, OpenStreetMap;
     - se nada der certo, mostra o motivo e o link "Abrir no Google Maps".

   ✏️ ONDE MUDAR O QUÊ:
     - Zoom inicial ........ ZOOM
     - Provedores de mapa .. TILES (lista, em ordem de tentativa)
     - Tempo máximo de espera de cada busca ... TEMPO_MS
   ============================================================ */
(function () {
    "use strict";
    var caixa = document.getElementById("mapaViagem");
    if (!caixa) return;

    var ZOOM = 12;
    var TEMPO_MS = 8000;
    var PREFIXO_CACHE = "rr_mapa_v1:";
    var TILES = [
        { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", attr: "Tiles © Esri" },
        { url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", attr: "© OpenStreetMap" }
    ];

    var destino = (caixa.getAttribute("data-destino") || "").trim();
    var local = (caixa.getAttribute("data-local") || "").trim();
    var status = document.getElementById("mapaStatus");
    var link = document.getElementById("mapaLink");

    var consultas = [];
    if (destino && local) consultas.push(destino + ", " + local);
    if (local) consultas.push(local);
    if (destino) consultas.push(destino);

    function dizer(t) { if (status) status.textContent = t; }
    function mostrarLink() {
        if (!link) return;
        var q = encodeURIComponent(consultas[0] || destino || local);
        link.href = "https://www.google.com/maps/search/?api=1&query=" + q;
        link.hidden = false;
    }
    mostrarLink();

    function comTempo(url, opcoes) {
        var ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
        var timer = setTimeout(function () { if (ctl) ctl.abort(); }, TEMPO_MS);
        opcoes = opcoes || {};
        if (ctl) opcoes.signal = ctl.signal;
        return fetch(url, opcoes).then(function (r) { clearTimeout(timer); return r; },
                                      function (e) { clearTimeout(timer); throw e; });
    }
    function viaNominatim(q) {
        return comTempo("https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=pt-BR&q=" + encodeURIComponent(q))
            .then(function (r) { if (!r.ok) throw new Error("Nominatim " + r.status); return r.json(); })
            .then(function (l) { return l.length ? { lat: parseFloat(l[0].lat), lon: parseFloat(l[0].lon) } : null; });
    }
    function viaOpenMeteo(q) {
        var nome = q.split(",")[0].trim();
        if (!nome) return Promise.resolve(null);
        return comTempo("https://geocoding-api.open-meteo.com/v1/search?count=1&language=pt&name=" + encodeURIComponent(nome))
            .then(function (r) { if (!r.ok) throw new Error("Open-Meteo " + r.status); return r.json(); })
            .then(function (c) { var a = c.results && c.results[0]; return a ? { lat: a.latitude, lon: a.longitude } : null; });
    }
    function buscarUma(q) {
        try {
            var c = JSON.parse(localStorage.getItem(PREFIXO_CACHE + q.toLowerCase()) || "null");
            if (c && typeof c.lat === "number") return Promise.resolve(c);
        } catch (e) { }
        return viaNominatim(q).catch(function () { return null; }).then(function (r) {
            return r || viaOpenMeteo(q).catch(function () { return null; });
        }).then(function (r) {
            if (r) { try { localStorage.setItem(PREFIXO_CACHE + q.toLowerCase(), JSON.stringify(r)); } catch (e) { } }
            return r;
        });
    }
    function buscar(i) {
        if (i >= consultas.length) return Promise.resolve(null);
        return buscarUma(consultas[i]).then(function (r) { return r || buscar(i + 1); });
    }

    function carregarLeaflet() {
        if (window.L) return Promise.resolve();
        return new Promise(function (ok, erro) {
            var css = document.createElement("link");
            css.rel = "stylesheet"; css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(css);
            var js = document.createElement("script");
            js.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            js.onload = ok; js.onerror = function () { erro(new Error("Leaflet não carregou")); };
            document.head.appendChild(js);
        });
    }

    function desenhar(c) {
        var mapa = L.map(caixa, { scrollWheelZoom: false }).setView([c.lat, c.lon], ZOOM);
        var i = 0, camada = null;
        function usar(n) {
            if (camada) mapa.removeLayer(camada);
            camada = L.tileLayer(TILES[n].url, { maxZoom: 18, attribution: TILES[n].attr });
            var falhas = 0;
            camada.on("tileerror", function () {
                falhas++;
                if (falhas === 4 && n + 1 < TILES.length) { i = n + 1; usar(i); }   // provedor ruim: troca
            });
            camada.addTo(mapa);
        }
        usar(0);
        var pino = L.divIcon({ className: "pino-mapa", html: "<span></span>", iconSize: [30, 30], iconAnchor: [15, 30] });
        L.marker([c.lat, c.lon], { icon: pino }).addTo(mapa).bindPopup(destino || local);
        dizer(local || destino);
        setTimeout(function () { mapa.invalidateSize(); }, 200);
    }

    if (!consultas.length) { dizer("Esta viagem não informou o local."); caixa.style.display = "none"; return; }

    carregarLeaflet().then(function () { return buscar(0); }).then(function (c) {
        if (!c) { dizer("Não consegui achar este local no mapa agora."); caixa.classList.add("sem-mapa"); return; }
        desenhar(c);
    }).catch(function () {
        dizer("O mapa não pôde ser carregado agora (sem conexão com o serviço de mapas).");
        caixa.classList.add("sem-mapa");
    });
})();
