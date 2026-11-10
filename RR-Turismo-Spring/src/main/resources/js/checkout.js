/* ============================================================
   📄 O QUE ESTE ARQUIVO FAZ:
   Comportamento da tela de pagamento (checkout.jsp):
     - troca entre Pix / Cartão / Boleto
     - monta o Pix de TESTE (código copia-e-cola + QR Code)
     - gera uma linha digitável de boleto de TESTE
     - máscara, bandeira e validação do cartão antes de enviar
     - botões "Copiar" e proteção contra clique duplo
   Nada aqui cobra de verdade. O servidor valida tudo de novo.

   ✏️ ONDE MUDAR O QUÊ:
     - Identificação do Pix de teste ... constantes logo abaixo
     - Dias para vencer o boleto ....... DIAS_BOLETO
   ============================================================ */
(function () {
    'use strict';

    var CHAVE_PIX_TESTE = 'TESTE-NAO-PAGAR';
    var NOME_RECEBEDOR = 'RR TURISMO TESTE';
    var CIDADE_RECEBEDOR = 'TAQUARITINGA';
    var DIAS_BOLETO = 3;

    var form = document.getElementById('formCompra');
    if (!form) return;
    var campoForma = document.getElementById('campoForma');
    var painelPix = document.getElementById('painelPix');
    var total = parseFloat(painelPix.getAttribute('data-total')) || 0;
    var painelCartao = document.getElementById('painelCartao');
    // crédito e débito usam o MESMO painel de cartão
    var paineis = { pix: painelPix, credito: painelCartao, debito: painelCartao, boleto: document.getElementById('painelBoleto') };

    /* ---------- troca de forma de pagamento ---------- */
    var opcoes = document.querySelectorAll('.pagamento-opcao');
    function escolher(forma) {
        campoForma.value = forma;
        Object.keys(paineis).forEach(function (k) { paineis[k].hidden = (paineis[k] !== paineis[forma]); });
        var ehDebito = forma === 'debito';
        document.getElementById('campoParcelas').hidden = ehDebito;       // débito é à vista
        document.getElementById('cartaoTipo').textContent = ehDebito ? 'DÉBITO' : 'CRÉDITO';
        opcoes.forEach(function (b) {
            var ativo = b.getAttribute('data-forma') === forma;
            b.classList.toggle('ativo', ativo);
            b.setAttribute('aria-checked', ativo ? 'true' : 'false');
        });
    }
    opcoes.forEach(function (b) {
        b.addEventListener('click', function () { escolher(b.getAttribute('data-forma')); });
    });

    /* ---------- Pix (BR Code EMV + CRC16) ---------- */
    function tlv(id, valor) {
        var t = String(valor.length);
        if (t.length < 2) t = '0' + t;
        return id + t + valor;
    }
    function crc16(texto) {
        var crc = 0xFFFF;
        for (var i = 0; i < texto.length; i++) {
            crc ^= texto.charCodeAt(i) << 8;
            for (var j = 0; j < 8; j++) {
                crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
                crc &= 0xFFFF;
            }
        }
        var h = crc.toString(16).toUpperCase();
        while (h.length < 4) h = '0' + h;
        return h;
    }
    function montarPix() {
        var conta = tlv('00', 'br.gov.bcb.pix') + tlv('01', CHAVE_PIX_TESTE);
        var corpo = tlv('00', '01') + tlv('26', conta) + tlv('52', '0000') + tlv('53', '986') +
            tlv('54', total.toFixed(2)) + tlv('58', 'BR') + tlv('59', NOME_RECEBEDOR) +
            tlv('60', CIDADE_RECEBEDOR) + tlv('62', tlv('05', 'RRTESTE')) + '6304';
        return corpo + crc16(corpo);
    }
    var codigoPix = montarPix();
    document.getElementById('pixCodigo').value = codigoPix;
    try {
        var qr = qrcode(0, 'M');
        qr.addData(codigoPix);
        qr.make();
        document.getElementById('pixQr').innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    } catch (e) {
        document.getElementById('pixQr').textContent = 'QR indisponível';
    }

    /* ---------- boleto de teste ---------- */
    function aleatorio(n) { var s = ''; for (var i = 0; i < n; i++) s += Math.floor(Math.random() * 10); return s; }
    var cents = String(Math.round(total * 100));
    while (cents.length < 10) cents = '0' + cents;
    var b = aleatorio(5) + '.' + aleatorio(5) + ' ' + aleatorio(5) + '.' + aleatorio(6) + ' ' +
            aleatorio(5) + '.' + aleatorio(6) + ' ' + aleatorio(1) + ' ' + aleatorio(4) + cents;
    document.getElementById('boletoCodigo').value = b;
    var venc = new Date(); venc.setDate(venc.getDate() + DIAS_BOLETO);
    document.getElementById('boletoVence').textContent = venc.toLocaleDateString('pt-BR');

    /* ---------- copiar ---------- */
    document.querySelectorAll('[data-copiar]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var campo = document.getElementById(btn.getAttribute('data-copiar'));
            campo.select();
            var ok = false;
            try { ok = document.execCommand('copy'); } catch (e) { /* ignora */ }
            if (navigator.clipboard) { navigator.clipboard.writeText(campo.value).catch(function () {}); ok = true; }
            var antes = btn.textContent;
            btn.textContent = ok ? 'Copiado!' : 'Selecione e copie';
            setTimeout(function () { btn.textContent = antes; }, 1800);
        });
    });

    /* ---------- cartão ---------- */
    var iNum = document.getElementById('cartaoNumero');
    var iNome = document.getElementById('cartaoNome');
    var iVal = document.getElementById('cartaoValidade');
    var iCvv = document.getElementById('cartaoCvv');

    function soDigitos(s) { return (s || '').replace(/\D/g, ''); }
    function luhn(n) {
        var soma = 0, dobra = false;
        for (var i = n.length - 1; i >= 0; i--) {
            var d = parseInt(n.charAt(i), 10);
            if (dobra) { d *= 2; if (d > 9) d -= 9; }
            soma += d; dobra = !dobra;
        }
        return n.length > 0 && soma % 10 === 0;
    }
    function bandeira(n) {
        if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(n)) return 'Elo';
        if (/^4/.test(n)) return 'Visa';
        if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard';
        if (/^3[47]/.test(n)) return 'American Express';
        if (/^(606282|3841)/.test(n)) return 'Hipercard';
        return 'Cartão';
    }
    /* ---- escolha da bandeira (botões) ---- */
    var campoBandeira = document.getElementById('campoBandeira');
    var botoesBandeira = document.querySelectorAll('.bandeira');
    function escolherBandeira(nome) {
        campoBandeira.value = nome;
        botoesBandeira.forEach(function (bt) {
            var ativo = bt.getAttribute('data-bandeira') === nome;
            bt.classList.toggle('ativo', ativo);
            bt.setAttribute('aria-checked', ativo ? 'true' : 'false');
        });
        document.getElementById('cartaoBandeira').textContent = nome || 'Escolha a bandeira';
        var er = form.querySelector('[data-erro="campoBandeira"]');
        if (er) er.textContent = '';
    }
    botoesBandeira.forEach(function (bt) {
        bt.addEventListener('click', function () { escolherBandeira(bt.getAttribute('data-bandeira')); });
    });

    iNum.addEventListener('input', function () {
        var n = soDigitos(iNum.value).slice(0, 19);
        iNum.value = n.replace(/(.{4})/g, '$1 ').trim();
        var detectada = bandeira(n);                       // sugere a bandeira pelo número
        if (detectada !== 'Cartão' && campoBandeira.value !== detectada) escolherBandeira(detectada);
        var previa = (n + '################').slice(0, 16).replace(/#/g, '•').replace(/(.{4})/g, '$1 ').trim();
        document.getElementById('previaNumero').textContent = previa;
    });
    iNome.addEventListener('input', function () {
        document.getElementById('previaNome').textContent = iNome.value.toUpperCase() || 'NOME NO CARTÃO';
    });
    iVal.addEventListener('input', function () {
        var d = soDigitos(iVal.value).slice(0, 4);
        iVal.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
        document.getElementById('previaVal').textContent = iVal.value || 'MM/AA';
    });
    iCvv.addEventListener('input', function () { iCvv.value = soDigitos(iCvv.value).slice(0, 4); });

    function erro(nome, msg) {
        var el = form.querySelector('[data-erro="' + nome + '"]');
        var campo = document.getElementById(nome);
        if (el) el.textContent = msg || '';
        if (campo) campo.classList.toggle('invalido', !!msg);
        return !msg;
    }
    function validarCartao() {
        var n = soDigitos(iNum.value);
        var ok = true;
        ok = erro('campoBandeira', campoBandeira.value ? '' : 'Escolha a bandeira do cartão.') && ok;
        if (campoBandeira.value && n.length >= 6) {
            var det = bandeira(n);
            if (det !== 'Cartão' && det !== campoBandeira.value) {
                ok = erro('campoBandeira', 'A bandeira escolhida não combina com o número do cartão (' + det + ').') && ok;
            }
        }
        ok = erro('cartaoNumero', (n.length >= 13 && luhn(n)) ? '' : 'Número de cartão inválido.') && ok;
        ok = erro('cartaoNome', iNome.value.trim().length >= 3 ? '' : 'Informe o nome como está no cartão.') && ok;
        var m = /^(\d{2})\/(\d{2})$/.exec(iVal.value);
        var valido = false;
        if (m) {
            var mes = parseInt(m[1], 10), ano = 2000 + parseInt(m[2], 10), hoje = new Date();
            valido = mes >= 1 && mes <= 12 && (ano > hoje.getFullYear() || (ano === hoje.getFullYear() && mes >= hoje.getMonth() + 1));
        }
        ok = erro('cartaoValidade', valido ? '' : 'Validade inválida ou vencida.') && ok;
        ok = erro('cartaoCvv', /^\d{3,4}$/.test(iCvv.value) ? '' : 'CVV com 3 ou 4 números.') && ok;
        return ok;
    }

    /* limpa o aviso de erro assim que a pessoa corrige o campo */
    [iNum, iNome, iVal, iCvv].forEach(function (c) {
        c.addEventListener('input', function () { erro(c.id, ''); });
    });

    /* ---------- envio ---------- */
    var botao = document.getElementById('botaoConfirmar');
    form.addEventListener('submit', function (ev) {
        if ((campoForma.value === 'credito' || campoForma.value === 'debito') && !validarCartao()) {
            ev.preventDefault();
            var primeiro = form.querySelector('input.invalido');
            if (primeiro) primeiro.focus();
            return;
        }
        botao.disabled = true;
        botao.textContent = 'Processando…';
    });

    /* voltar pelo navegador não pode deixar o botão travado */
    window.addEventListener('pageshow', function () {
        botao.disabled = false;
        botao.textContent = 'Confirmar compra';
    });

    escolher('pix');
})();
