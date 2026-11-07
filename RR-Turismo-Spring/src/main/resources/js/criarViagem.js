(() => {
    const form = document.getElementById("formViagem");
    if (!form) return;

    const inputImagens     = document.getElementById("imagemFile");
    const preview          = document.getElementById("preview");
    const previewCard      = document.getElementById("previewCard");
    const cardImg          = document.getElementById("cardImg");
    const cardDestino      = document.getElementById("cardDestino");
    const cardIda          = document.getElementById("cardIda");
    const cardVolta        = document.getElementById("cardVolta");
    const cardPreco        = document.getElementById("cardPreco");
    const cardGuia         = document.getElementById("cardGuia");
    const btnMinimizar     = document.getElementById("btnMinimizar");
    const iconeFlutuante   = document.getElementById("iconeFlutuante");
    const nomeDestinoInput = document.getElementById("nomedestino");
    const localInput       = document.getElementById("local");
    const categoriaInput   = document.getElementById("categoria");
    const transporteInput  = document.getElementById("transporte");
    const inputAssentos    = document.getElementById("assentos");
    const dataIdaInput     = document.getElementById("dataIda");
    const dataVoltaInput   = document.getElementById("dataVolta");
    const precoInput       = document.getElementById("preco");
    const hotelInput       = document.getElementById("hotel");
    const pessoasInput     = document.getElementById("pessoas");
    const descricaoInput   = document.getElementById("descricao");
    const btnMenosAssentos = document.getElementById("menosAssentos");
    const btnMaisAssentos  = document.getElementById("maisAssentos");
    const btnMenosPessoas  = document.getElementById("menosPessoas");
    const btnMaisPessoas   = document.getElementById("maisPessoas");
    const btnCriar         = document.getElementById("btnCriar");
    const modalSucesso     = document.getElementById("modalSucesso");
    const btnFecharModal   = document.getElementById("btnFecharModal");
    const modoEdicao       = form.dataset.modoEdicao === "true";

    // Campos novos: viagem bate-e-volta (sem hospedagem)
    const bateVoltaInput     = document.getElementById("bateVolta");
    const labelHotel         = document.getElementById("labelHotel");
    const infoHotel          = document.getElementById("infoHotel");
    const blocoPessoasQuarto = document.getElementById("blocoPessoasQuarto");

    let listaImagens = [];
    let indexParaSubstituir = null;
    let usuarioMinimizou = false;

    const inputSubstituir = document.createElement("input");
    inputSubstituir.type = "file";
    inputSubstituir.accept = "image/*";

    // ================================================
    // REDIMENSIONAR IMAGEM — máx 800px, qualidade 80%
    // Retorna uma Promise com o novo File já reduzido
    // ================================================
    function redimensionarImagem(arquivo) {
        return new Promise(function (resolve, reject) {
            const reader = new FileReader();

            reader.onload = function (e) {
                const img = new Image();

                img.onload = function () {
                    const LARGURA_MAX = 800;
                    const QUALIDADE   = 0.8;

                    let largura = img.width;
                    let altura  = img.height;

                    // Só reduz se for maior que o limite
                    if (largura > LARGURA_MAX) {
                        altura  = Math.round((altura * LARGURA_MAX) / largura);
                        largura = LARGURA_MAX;
                    }

                    const canvas = document.createElement("canvas");
                    canvas.width  = largura;
                    canvas.height = altura;

                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, largura, altura);

                    canvas.toBlob(function (blob) {
                        const arquivoReduzido = new File(
                            [blob],
                            arquivo.name,
                            { type: "image/jpeg", lastModified: Date.now() }
                        );
                        resolve(arquivoReduzido);
                    }, "image/jpeg", QUALIDADE);
                };

                // Se o navegador não conseguir abrir o arquivo como imagem, avisa em vez de travar.
                img.onerror = function () {
                    reject(new Error("Não foi possível abrir essa imagem. Tente outro arquivo."));
                };

                img.src = e.target.result;
            };

            reader.onerror = function () {
                reject(new Error("Não foi possível ler esse arquivo."));
            };

            reader.readAsDataURL(arquivo);
        });
    }

    // ================================================
    // DATAS DA VIAGEM
    // ------------------------------------------------
    // - Não deixa escolher ida no passado (ao CRIAR);
    // - A volta nunca pode ser antes da ida;
    // - "Bate e volta" iguala a volta à ida;
    // - Mostra o resumo: "3 dias e 2 noites · faltam 12 dias".
    // As datas são montadas no horário local (new Date(a, m, d))
    // para o dia não "escorregar" por causa do fuso horário.
    // ================================================
    const resumoDatas       = document.getElementById("resumoDatas");
    const contadorDescricao = document.getElementById("contadorDescricao");
    const DIA_MS = 24 * 60 * 60 * 1000;

    // "2026-11-20" -> Date local (meia-noite); vazio/inválido -> null
    function lerData(texto) {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto || "");
        return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
    }

    // Date -> "2026-11-20"
    function paraISO(data) {
        const mm = String(data.getMonth() + 1).padStart(2, "0");
        const dd = String(data.getDate()).padStart(2, "0");
        return data.getFullYear() + "-" + mm + "-" + dd;
    }

    // "2026-11-20" -> "20/11/2026"
    function formatarData(texto) {
        const d = lerData(texto);
        return d ? d.toLocaleDateString("pt-BR") : "";
    }

    function hoje() {
        const agora = new Date();
        return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    }

    function atualizarLimitesDeData() {
        // Ao criar, a ida começa a partir de hoje. Ao editar, mantém
        // a data já salva (pode ser antiga) sem bloquear o formulário.
        if (!modoEdicao) dataIdaInput.min = paraISO(hoje());

        const ida = lerData(dataIdaInput.value);
        dataVoltaInput.min = ida ? paraISO(ida) : (modoEdicao ? "" : paraISO(hoje()));

        const bateVolta = bateVoltaInput && bateVoltaInput.checked;
        if (bateVolta && ida) {
            dataVoltaInput.value = paraISO(ida);
            dataVoltaInput.max   = paraISO(ida);
        } else {
            dataVoltaInput.removeAttribute("max");
            const volta = lerData(dataVoltaInput.value);
            // Se a volta ficou antes da ida, corrige para a própria ida.
            if (ida && volta && volta < ida) dataVoltaInput.value = paraISO(ida);
        }
    }

    function atualizarResumoDeDatas() {
        const ida   = lerData(dataIdaInput.value);
        const volta = lerData(dataVoltaInput.value);
        if (!ida || !volta) { resumoDatas.style.display = "none"; return; }

        const noites = Math.round((volta - ida) / DIA_MS);
        const dias   = noites + 1;
        const duracao = noites === 0
            ? "Bate e volta (1 dia)"
            : dias + " dias e " + noites + (noites === 1 ? " noite" : " noites");

        const faltam = Math.round((ida - hoje()) / DIA_MS);
        let quando;
        if (faltam < 0)        quando = "esta data já passou";
        else if (faltam === 0) quando = "a viagem é hoje";
        else if (faltam === 1) quando = "falta 1 dia";
        else                   quando = "faltam " + faltam + " dias";

        const diaSemana = ida.toLocaleDateString("pt-BR", { weekday: "long" });
        resumoDatas.textContent = "📅 " + duracao + " · saída " + diaSemana + ", "
            + ida.toLocaleDateString("pt-BR") + " · " + quando;
        resumoDatas.classList.toggle("cv-resumo-alerta", faltam < 0 && !modoEdicao);
        resumoDatas.style.display = "block";
    }

    function aoMudarDatas() {
        atualizarLimitesDeData();
        atualizarResumoDeDatas();
        atualizarPreviewTexto();
    }

    dataIdaInput.addEventListener("change", aoMudarDatas);
    dataVoltaInput.addEventListener("change", aoMudarDatas);

    // Contador de caracteres da descrição
    function atualizarContador() {
        if (contadorDescricao) contadorDescricao.textContent = descricaoInput.value.length + " / 2000";
    }
    descricaoInput.addEventListener("input", atualizarContador);

    // ================================================
    // PREVIEW CARD
    // ================================================
    function mostrarPreviewCard() {
        previewCard.classList.remove("hidden");
        if (!usuarioMinimizou) {
            previewCard.classList.remove("encolhido");
            iconeFlutuante.classList.remove("visivel");
        }
    }

    function atualizarPreviewTexto() {
        const destino = nomeDestinoInput.value.trim() || "Destino";
        const local   = localInput.value.trim() || "Local";
        cardDestino.textContent = destino + " - " + local;
        cardIda.textContent     = formatarData(dataIdaInput.value) || "--";
        cardVolta.textContent   = formatarData(dataVoltaInput.value) || "--";
        cardPreco.textContent   = precoInput.value || "R$ 0,00";
    }

    // ================================================
    // IMAGENS — renderizar previews com botões
    // ================================================
    function renderizarPreviews() {
        preview.innerHTML = "";

        if (listaImagens.length === 0) {
            cardImg.src = "";
            return;
        }

        listaImagens.forEach(function (arquivo, index) {
            const reader = new FileReader();

            reader.onload = function (e) {
                const container = document.createElement("div");
                container.className = "preview-item";

                const img = document.createElement("img");
                img.src = e.target.result;

                const overlay = document.createElement("div");
                overlay.className = "image-actions-overlay";

                const btnSubstituir = document.createElement("button");
                btnSubstituir.className = "action-btn action-substitute";
                btnSubstituir.type = "button";
                btnSubstituir.textContent = "Substituir";
                btnSubstituir.onclick = function (ev) {
                    ev.stopPropagation();
                    indexParaSubstituir = index;
                    inputSubstituir.click();
                };

                const btnRemover = document.createElement("button");
                btnRemover.className = "action-btn action-remove";
                btnRemover.type = "button";
                btnRemover.textContent = "Remover";
                btnRemover.onclick = function (ev) {
                    ev.stopPropagation();
                    listaImagens.splice(index, 1);
                    renderizarPreviews();
                };

                overlay.appendChild(btnSubstituir);
                overlay.appendChild(btnRemover);
                container.appendChild(img);
                container.appendChild(overlay);
                preview.appendChild(container);

                if (index === 0) {
                    cardImg.src = e.target.result;
                    mostrarPreviewCard();
                }
            };

            reader.readAsDataURL(arquivo);
        });
    }

    // ================================================
    // IMAGENS — adicionar com redimensionamento
    // ================================================
    inputImagens.addEventListener("change", function () {
        const novos = Array.from(this.files || []);

        if (listaImagens.length + novos.length > 5) {
            mostrarMensagemErro("O limite máximo é de 5 imagens.");
            this.value = "";
            return;
        }

        // Redimensiona todas as novas imagens antes de adicionar
        const promessas = novos.map(function (arquivo) {
            return redimensionarImagem(arquivo);
        });

        Promise.all(promessas).then(function (imagensReduzidas) {
            listaImagens = listaImagens.concat(imagensReduzidas);
            renderizarPreviews();
        }).catch(function (erro) {
            mostrarMensagemErro(erro.message);
        });

        this.value = "";
    });

    // IMAGENS — substituir com redimensionamento
    inputSubstituir.addEventListener("change", function () {
        if (this.files && this.files[0] && indexParaSubstituir !== null) {
            redimensionarImagem(this.files[0]).then(function (imagemReduzida) {
                listaImagens[indexParaSubstituir] = imagemReduzida;
                renderizarPreviews();
            }).catch(function (erro) {
                mostrarMensagemErro(erro.message);
            });
            this.value = "";
        }
    });

    // ================================================
    // IMAGENS — adicionar por LINK (ex.: do Google Imagens)
    // ------------------------------------------------
    // O navegador não pode baixar imagens de outros sites direto
    // (bloqueio CORS), então pedimos ao nosso servidor (/imagem-por-link),
    // que baixa e devolve a imagem. Depois ela é tratada IGUAL a uma
    // foto escolhida no computador: reduzida para 800px e mostrada na lista.
    // ================================================
    const linkImagemInput = document.getElementById("linkImagem");
    const btnAddLink      = document.getElementById("btnAddLink");

    async function adicionarImagemPorLink() {
        const link = (linkImagemInput.value || "").trim();
        if (!link) {
            mostrarMensagemErro("Cole o link da imagem antes de clicar em adicionar.");
            return;
        }
        if (listaImagens.length >= 5) {
            mostrarMensagemErro("O limite máximo é de 5 imagens.");
            return;
        }

        const textoOriginal = btnAddLink.textContent;
        btnAddLink.disabled = true;
        btnAddLink.textContent = "Baixando...";

        try {
            let blob;
            if (/^data:image\//i.test(link)) {
                // Imagem "embutida" no próprio link (data:image/...): não precisa do servidor.
                blob = await (await fetch(link)).blob();
            } else {
                const resposta = await fetch("/imagem-por-link?url=" + encodeURIComponent(link));
                if (!resposta.ok) {
                    throw new Error((await resposta.text()) || "Não consegui baixar essa imagem.");
                }
                blob = await resposta.blob();
                if (!blob.type || blob.type.indexOf("image/") !== 0) {
                    // Voltou uma página em vez de imagem (ex.: sessão expirada).
                    throw new Error("Não consegui baixar essa imagem. Entre no site de novo e tente outra vez.");
                }
            }

            const extensao = (blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
            const arquivo = new File([blob], "imagem-do-link." + extensao, { type: blob.type });
            const reduzida = await redimensionarImagem(arquivo);

            listaImagens.push(reduzida);
            renderizarPreviews();
            linkImagemInput.value = "";
        } catch (erro) {
            mostrarMensagemErro(erro.message || "Não consegui adicionar essa imagem.");
        } finally {
            btnAddLink.disabled = false;
            btnAddLink.textContent = textoOriginal;
        }
    }

    if (btnAddLink && linkImagemInput) {
        btnAddLink.addEventListener("click", adicionarImagemPorLink);
        // Enter no campo do link adiciona a imagem (sem enviar o formulário inteiro).
        linkImagemInput.addEventListener("keydown", function (ev) {
            if (ev.key === "Enter") {
                ev.preventDefault();
                adicionarImagemPorLink();
            }
        });
    }

    // ================================================
    // MÁSCARA DE PREÇO
    // ================================================
    precoInput.addEventListener("input", function (e) {
        let valor = e.target.value.replace(/\D/g, "");
        if (!valor) {
            e.target.value = "";
            atualizarPreviewTexto();
            return;
        }
        valor = (Number(valor) / 100).toFixed(2);
        valor = valor.replace(".", ",");
        valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        e.target.value = "R$ " + valor;
        atualizarPreviewTexto();
    });

    // ================================================
    // ASSENTOS POR TRANSPORTE
    // ================================================
    transporteInput.addEventListener("change", function () {
        if (transporteInput.value === "Van")    inputAssentos.value = 15;
        if (transporteInput.value === "Ônibus") inputAssentos.value = 46;
        if (transporteInput.value === "Avião")  inputAssentos.value = 180;
    });

    // ================================================
    // BOTÕES + e -
    // ================================================
    function configurarControle(btnMenos, btnMais, input) {
        if (!btnMenos || !btnMais || !input) return;
        btnMais.addEventListener("click", function () {
            input.value = (parseInt(input.value) || 0) + 1;
        });
        btnMenos.addEventListener("click", function () {
            const atual = parseInt(input.value) || 1;
            input.value = atual > 1 ? atual - 1 : 1;
        });
    }

    configurarControle(btnMenosAssentos, btnMaisAssentos, inputAssentos);
    configurarControle(btnMenosPessoas,  btnMaisPessoas,  pessoasInput);

    // ================================================
    // MINIMIZAR / EXPANDIR CARD
    // ================================================
    btnMinimizar.addEventListener("click", function (e) {
        e.preventDefault();
        usuarioMinimizou = true;
        previewCard.classList.add("encolhido");
        iconeFlutuante.classList.add("visivel");
    });

    iconeFlutuante.addEventListener("click", function () {
        usuarioMinimizou = false;
        previewCard.classList.remove("encolhido");
        iconeFlutuante.classList.remove("visivel");
    });

    form.addEventListener("input", function () {
        mostrarPreviewCard();
        atualizarPreviewTexto();
    });

    // Limpa borda vermelha ao digitar
    [nomeDestinoInput, localInput, categoriaInput, transporteInput,
     inputAssentos, dataIdaInput, dataVoltaInput, precoInput,
     hotelInput, pessoasInput, descricaoInput].forEach(function (campo) {
        campo.addEventListener("input",  function () { campo.classList.remove("erro"); });
        campo.addEventListener("change", function () { campo.classList.remove("erro"); });
    });

    // ================================================
    // MENSAGEM DE ERRO NO TOPO
    // ================================================
    function mostrarMensagemErro(texto) {
        let box = document.getElementById("mensagemValidacaoJS");
        if (!box) {
            box = document.createElement("div");
            box.id = "mensagemValidacaoJS";
            box.className = "toast-erro";
            document.body.appendChild(box);
        }
        box.textContent = texto;
        box.style.display = "block";
    }

    function esconderMensagemErro() {
        const box = document.getElementById("mensagemValidacaoJS");
        if (box) box.style.display = "none";
    }

    // ================================================
    // MODAL DE SUCESSO — fechar e limpar tudo
    // ================================================
    if (btnFecharModal) {
        btnFecharModal.addEventListener("click", function () {
            modalSucesso.classList.add("hidden");
            modalSucesso.classList.remove("modal-visivel");

            form.reset();
            listaImagens = [];
            preview.innerHTML = "";
            cardImg.src = "";
            cardDestino.textContent = "Destino - Local";
            cardIda.textContent     = "--";
            cardVolta.textContent   = "--";
            cardPreco.textContent   = "R$ 0,00";
            previewCard.classList.add("hidden");
            previewCard.classList.remove("encolhido");
            iconeFlutuante.classList.remove("visivel");
            usuarioMinimizou = false;
            inputAssentos.value = 46;
            pessoasInput.value  = 1;
            esconderMensagemErro();
        });

        modalSucesso.addEventListener("click", function (e) {
            if (e.target === modalSucesso) btnFecharModal.click();
        });
    }

    // ================================================
    // VIAGEM BATE-E-VOLTA (sem hospedagem)
    // ------------------------------------------------
    // Quando marcado: o campo "hotel" vira "local
    // visitado" (não é mais obrigatório ter um hotel de
    // verdade) e o bloco de "pessoas por quarto" some,
    // já que não tem quarto nenhum numa viagem sem pernoite.
    // ================================================
    function atualizarModoBateVolta() {
        const ativo = bateVoltaInput.checked;

        labelHotel.innerHTML = ativo
            ? "<h3>Local visitado (ponto de encontro):</h3>"
            : "<h3>Nome do hotel / pousada:</h3>";

        infoHotel.style.display = ativo ? "block" : "none";
        hotelInput.placeholder = ativo
            ? "Ex: Fatec Taquaritinga, Parque Ibirapuera..."
            : "Ex: Hotel Praia Azul";

        blocoPessoasQuarto.style.display = ativo ? "none" : "block";

        // Bate e volta: a volta é no mesmo dia da ida.
        if (typeof aoMudarDatas === "function") aoMudarDatas();
    }

    if (bateVoltaInput) {
        bateVoltaInput.addEventListener("change", atualizarModoBateVolta);
        atualizarModoBateVolta(); // aplica o estado inicial (ex: ao editar uma viagem já marcada)
    }

    // ================================================
    // AUTOCOMPLETE DE LOCAL / HOTEL (OpenStreetMap Nominatim)
    // ------------------------------------------------
    // Serviço GRATUITO de busca de lugares (não precisa de
    // chave de API nem cartão de crédito, diferente do Google
    // Maps). Conforme o usuário digita, busca sugestões reais
    // de lugares e mostra numa listinha embaixo do campo.
    //
    // "debounce" = espera a pessoa parar de digitar por um
    // tempinho antes de buscar, pra não disparar uma busca a
    // cada letra digitada (e não sobrecarregar o serviço
    // gratuito, que pede no máximo ~1 busca por segundo).
    // ================================================
    function configurarAutocomplete(input, containerSugestoes, opcoes) {
        if (!input || !containerSugestoes) return;

        let timeoutBusca = null;
        let controladorAtual = null;

        function esconderSugestoes() {
            containerSugestoes.innerHTML = "";
            containerSugestoes.classList.remove("visivel");
        }

        function buscarSugestoes(texto) {
            // Cancela uma busca anterior que ainda estivesse em andamento.
            if (controladorAtual) controladorAtual.abort();
            controladorAtual = new AbortController();

            const parametros = new URLSearchParams({
                format: "json",
                q: texto,
                addressdetails: "1",
                limit: "6",
                "accept-language": "pt-BR",
            });

            fetch("https://nominatim.openstreetmap.org/search?" + parametros.toString(), {
                signal: controladorAtual.signal,
                headers: { "Accept": "application/json" },
            })
                .then(function (resposta) { return resposta.json(); })
                .then(function (resultados) {
                    if (!resultados || resultados.length === 0) {
                        esconderSugestoes();
                        return;
                    }

                    containerSugestoes.innerHTML = "";
                    resultados.forEach(function (lugar) {
                        const item = document.createElement("div");
                        item.className = "item-sugestao";
                        item.textContent = lugar.display_name;
                        item.addEventListener("mousedown", function (e) {
                            // "mousedown" (em vez de "click") dispara antes do
                            // input perder o foco, senão a lista some antes
                            // de registrar o clique.
                            e.preventDefault();
                            input.value = opcoes && opcoes.pegarNomeCurto
                                ? opcoes.pegarNomeCurto(lugar)
                                : lugar.display_name;
                            esconderSugestoes();
                            input.dispatchEvent(new Event("input", { bubbles: true }));
                        });
                        containerSugestoes.appendChild(item);
                    });
                    containerSugestoes.classList.add("visivel");
                })
                .catch(function (erro) {
                    // AbortError acontece quando cancelamos uma busca antiga
                    // de propósito (usuário continuou digitando) - não é erro de verdade.
                    if (erro.name !== "AbortError") {
                        console.warn("Falha ao buscar sugestões de local:", erro);
                    }
                });
        }

        input.addEventListener("input", function () {
            const texto = input.value.trim();
            clearTimeout(timeoutBusca);

            if (texto.length < 3) {
                esconderSugestoes();
                return;
            }

            // Espera 450ms sem digitar nada antes de buscar de verdade.
            timeoutBusca = setTimeout(function () {
                buscarSugestoes(texto);
            }, 450);
        });

        // Esconde a lista se o usuário clicar fora do campo.
        document.addEventListener("click", function (e) {
            if (e.target !== input) esconderSugestoes();
        });
    }

    // Local (cidade/estado/país): usa o nome mais "resumido" do lugar
    // (ex: "Taquaritinga, São Paulo, Brasil"), montado a partir do
    // endereço estruturado que o Nominatim devolve.
    configurarAutocomplete(localInput, document.getElementById("localSugestoes"), {
        pegarNomeCurto: function (lugar) {
            const endereco = lugar.address || {};
            const cidade = endereco.city || endereco.town || endereco.village || endereco.municipality || lugar.name;
            const partes = [cidade, endereco.state, endereco.country].filter(Boolean);
            // Remove nomes repetidos (ex: cidade e estado com o mesmo nome).
            return Array.from(new Set(partes)).join(", ");
        },
    });

    // Hotel / local visitado: usa o nome completo devolvido pela busca.
    configurarAutocomplete(hotelInput, document.getElementById("hotelSugestoes"));

    // ================================================
    // VALIDAÇÃO E ENVIO
    // ================================================
    btnCriar.addEventListener("click", function () {
        esconderMensagemErro();

        const campos = [
            { el: nomeDestinoInput, nome: "Nome do destino"       },
            { el: localInput,       nome: "Local"                 },
            { el: dataIdaInput,     nome: "Data de ida"           },
            { el: dataVoltaInput,   nome: "Data de volta"         },
            { el: precoInput,       nome: "Preço por pessoa"      },
            { el: descricaoInput,   nome: "Descrição da viagem"   }
        ];

        // O campo "hotel" só é obrigatório quando NÃO é bate-e-volta.
        // Quando é bate-e-volta, ele vira "local visitado" e continua
        // fazendo sentido pedir (pra saber onde foi a excursão), então
        // mantemos obrigatório os dois jeitos - só muda o nome/rótulo.
        campos.push({ el: hotelInput, nome: bateVoltaInput && bateVoltaInput.checked ? "Local visitado" : "Nome do hotel/pousada" });

        let valido = true;
        const faltando = [];

        campos.forEach(function (c) { c.el.classList.remove("erro"); });
        inputImagens.classList.remove("erro");

        if (!modoEdicao && listaImagens.length < 1) {
            inputImagens.classList.add("erro");
            faltando.push("mínimo de 1 imagem");
            valido = false;
        }

        campos.forEach(function (c) {
            if (!c.el.value || !c.el.value.trim()) {
                c.el.classList.add("erro");
                faltando.push(c.nome);
                valido = false;
            }
        });

        if (!valido) {
            mostrarMensagemErro("Por favor, preencha os campos obrigatórios: " + faltando.join(", ") + ".");
            document.querySelector(".erro").scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        // ---- Validação das datas, do preço e das vagas ----
        const ida   = lerData(dataIdaInput.value);
        const volta = lerData(dataVoltaInput.value);
        const preco = Number((precoInput.value || "").replace(/\D/g, "")) / 100;
        const erros = [];

        if (!ida)   { dataIdaInput.classList.add("erro");   erros.push("A data de ida é inválida."); }
        if (!volta) { dataVoltaInput.classList.add("erro"); erros.push("A data de volta é inválida."); }
        if (ida && volta && volta < ida) {
            dataVoltaInput.classList.add("erro");
            erros.push("A data de volta não pode ser antes da ida.");
        }
        if (ida && !modoEdicao && ida < hoje()) {
            dataIdaInput.classList.add("erro");
            erros.push("A data de ida não pode estar no passado.");
        }
        if (!(preco > 0)) { precoInput.classList.add("erro"); erros.push("Informe um preço maior que zero."); }
        if ((parseInt(inputAssentos.value) || 0) < 1) { inputAssentos.classList.add("erro"); erros.push("Informe pelo menos 1 assento."); }
        if (descricaoInput.value.trim().length < 20) {
            descricaoInput.classList.add("erro");
            erros.push("Descreva a viagem com pelo menos 20 caracteres.");
        }

        if (erros.length) {
            mostrarMensagemErro(erros.join(" "));
            document.querySelector(".erro").scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        // Coloca TODAS as imagens (já redimensionadas, de 1 a 5) no input para enviar.
        // A primeira é a capa; as outras viram o carrossel no app.
        if (listaImagens.length > 0) {
            const dataTransfer = new DataTransfer();
            listaImagens.forEach(function (arquivo) {
                dataTransfer.items.add(arquivo);
            });
            inputImagens.files = dataTransfer.files;
        }

        form.submit();
    });

    aoMudarDatas();      // aplica limites/resumo (também ao editar uma viagem existente)
    atualizarContador();
    atualizarPreviewTexto();
})();
