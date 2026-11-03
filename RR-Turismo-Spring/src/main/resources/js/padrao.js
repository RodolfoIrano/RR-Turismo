/* =========================================================
   RR Turismo - scripts globais
   - Seletor completo de idiomas
   - Google Translate oculto
   - Ajustes globais de navegacao e componentes da interface
========================================================= */

/* =========================================================
   Dados do seletor de idiomas
   Cada item usa o codigo aceito pelo Google Translate.
========================================================= */
const LANGUAGES = [
    // Americas
    { code: "pt", flag: "🇧🇷", name: "Português (BR)", native: "Português", region: "Américas" },
    { code: "en", flag: "🇺🇸", name: "Inglês", native: "English", region: "Américas" },
    { code: "es", flag: "🇪🇸", name: "Espanhol", native: "Español", region: "Américas" },
    { code: "fr", flag: "🇫🇷", name: "Francês", native: "Français", region: "Américas" },
    { code: "ht", flag: "🇭🇹", name: "Crioulo Haitiano", native: "Kreyòl ayisyen", region: "Américas" },
    { code: "qu", flag: "🇵🇪", name: "Quíchua", native: "Runasimi", region: "Américas" },
    { code: "gn", flag: "🇵🇾", name: "Guarani", native: "Avañeʼẽ", region: "Américas" },

    // Europa
    { code: "de", flag: "🇩🇪", name: "Alemão", native: "Deutsch", region: "Europa" },
    { code: "it", flag: "🇮🇹", name: "Italiano", native: "Italiano", region: "Europa" },
    { code: "nl", flag: "🇳🇱", name: "Holandês", native: "Nederlands", region: "Europa" },
    { code: "pl", flag: "🇵🇱", name: "Polonês", native: "Polski", region: "Europa" },
    { code: "ru", flag: "🇷🇺", name: "Russo", native: "Русский", region: "Europa" },
    { code: "uk", flag: "🇺🇦", name: "Ucraniano", native: "Українська", region: "Europa" },
    { code: "cs", flag: "🇨🇿", name: "Tcheco", native: "Čeština", region: "Europa" },
    { code: "sk", flag: "🇸🇰", name: "Eslovaco", native: "Slovenčina", region: "Europa" },
    { code: "sl", flag: "🇸🇮", name: "Esloveno", native: "Slovenščina", region: "Europa" },
    { code: "hr", flag: "🇭🇷", name: "Croata", native: "Hrvatski", region: "Europa" },
    { code: "sr", flag: "🇷🇸", name: "Sérvio", native: "Српски", region: "Europa" },
    { code: "bs", flag: "🇧🇦", name: "Bósnio", native: "Bosanski", region: "Europa" },
    { code: "mk", flag: "🇲🇰", name: "Macedônio", native: "Македонски", region: "Europa" },
    { code: "sq", flag: "🇦🇱", name: "Albanês", native: "Shqip", region: "Europa" },
    { code: "bg", flag: "🇧🇬", name: "Búlgaro", native: "Български", region: "Europa" },
    { code: "ro", flag: "🇷🇴", name: "Romeno", native: "Română", region: "Europa" },
    { code: "hu", flag: "🇭🇺", name: "Húngaro", native: "Magyar", region: "Europa" },
    { code: "fi", flag: "🇫🇮", name: "Finlandês", native: "Suomi", region: "Europa" },
    { code: "sv", flag: "🇸🇪", name: "Sueco", native: "Svenska", region: "Europa" },
    { code: "no", flag: "🇳🇴", name: "Norueguês", native: "Norsk", region: "Europa" },
    { code: "da", flag: "🇩🇰", name: "Dinamarquês", native: "Dansk", region: "Europa" },
    { code: "is", flag: "🇮🇸", name: "Islandês", native: "Íslenska", region: "Europa" },
    { code: "et", flag: "🇪🇪", name: "Estoniano", native: "Eesti", region: "Europa" },
    { code: "lv", flag: "🇱🇻", name: "Letão", native: "Latviešu", region: "Europa" },
    { code: "lt", flag: "🇱🇹", name: "Lituano", native: "Lietuvių", region: "Europa" },
    { code: "be", flag: "🇧🇾", name: "Bielorrusso", native: "Беларуская", region: "Europa" },
    { code: "ga", flag: "🇮🇪", name: "Irlandês (Gaélico)", native: "Gaeilge", region: "Europa" },
    { code: "cy", flag: "🏴", name: "Galês", native: "Cymraeg", region: "Europa" },
    { code: "eu", flag: "🇪🇸", name: "Basco", native: "Euskara", region: "Europa" },
    { code: "ca", flag: "🇪🇸", name: "Catalão", native: "Català", region: "Europa" },
    { code: "gl", flag: "🇪🇸", name: "Galego", native: "Galego", region: "Europa" },
    { code: "lb", flag: "🇱🇺", name: "Luxemburguês", native: "Lëtzebuergesch", region: "Europa" },
    { code: "mt", flag: "🇲🇹", name: "Maltês", native: "Malti", region: "Europa" },
    { code: "el", flag: "🇬🇷", name: "Grego", native: "Ελληνικά", region: "Europa" },
    { code: "hy", flag: "🇦🇲", name: "Armênio", native: "Հայերեն", region: "Europa" },
    { code: "ka", flag: "🇬🇪", name: "Georgiano", native: "ქართული", region: "Europa" },
    { code: "az", flag: "🇦🇿", name: "Azerbaijano", native: "Azərbaycan", region: "Europa" },

    // Oriente Medio e Asia Central
    { code: "ar", flag: "🇸🇦", name: "Árabe", native: "العربية", region: "Oriente Médio" },
    { code: "he", flag: "🇮🇱", name: "Hebraico", native: "עברית", region: "Oriente Médio" },
    { code: "fa", flag: "🇮🇷", name: "Persa (Farsi)", native: "فارسی", region: "Oriente Médio" },
    { code: "tr", flag: "🇹🇷", name: "Turco", native: "Türkçe", region: "Oriente Médio" },
    { code: "ku", flag: "🇮🇶", name: "Curdo", native: "Kurdî", region: "Oriente Médio" },
    { code: "ky", flag: "🇰🇬", name: "Quirguiz", native: "Кыргызча", region: "Oriente Médio" },
    { code: "kk", flag: "🇰🇿", name: "Cazaque", native: "Қазақ тілі", region: "Oriente Médio" },
    { code: "uz", flag: "🇺🇿", name: "Uzbeque", native: "Oʻzbek", region: "Oriente Médio" },
    { code: "tk", flag: "🇹🇲", name: "Turcomano", native: "Türkmençe", region: "Oriente Médio" },
    { code: "tg", flag: "🇹🇯", name: "Tadjique", native: "Тоҷикӣ", region: "Oriente Médio" },

    // Asia
    { code: "zh-CN", flag: "🇨🇳", name: "Chinês Simplificado", native: "中文（简体）", region: "Ásia" },
    { code: "zh-TW", flag: "🇹🇼", name: "Chinês Tradicional", native: "中文（繁體）", region: "Ásia" },
    { code: "ja", flag: "🇯🇵", name: "Japonês", native: "日本語", region: "Ásia" },
    { code: "ko", flag: "🇰🇷", name: "Coreano", native: "한국어", region: "Ásia" },
    { code: "hi", flag: "🇮🇳", name: "Hindi", native: "हिन्दी", region: "Ásia" },
    { code: "bn", flag: "🇧🇩", name: "Bengali", native: "বাংলা", region: "Ásia" },
    { code: "te", flag: "🇮🇳", name: "Telugu", native: "తెలుగు", region: "Ásia" },
    { code: "ta", flag: "🇮🇳", name: "Tâmil", native: "தமிழ்", region: "Ásia" },
    { code: "mr", flag: "🇮🇳", name: "Marata", native: "मराठी", region: "Ásia" },
    { code: "gu", flag: "🇮🇳", name: "Gujarati", native: "ગુજરાતી", region: "Ásia" },
    { code: "kn", flag: "🇮🇳", name: "Canarês", native: "ಕನ್ನಡ", region: "Ásia" },
    { code: "ml", flag: "🇮🇳", name: "Malaiala", native: "മലയാളം", region: "Ásia" },
    { code: "pa", flag: "🇮🇳", name: "Punjabi", native: "ਪੰਜਾਬੀ", region: "Ásia" },
    { code: "or", flag: "🇮🇳", name: "Oriya", native: "ଓଡ଼ିଆ", region: "Ásia" },
    { code: "ur", flag: "🇵🇰", name: "Urdu", native: "اردو", region: "Ásia" },
    { code: "si", flag: "🇱🇰", name: "Cingalês", native: "සිංහල", region: "Ásia" },
    { code: "ne", flag: "🇳🇵", name: "Nepalês", native: "नेपाली", region: "Ásia" },
    { code: "th", flag: "🇹🇭", name: "Tailandês", native: "ภาษาไทย", region: "Ásia" },
    { code: "vi", flag: "🇻🇳", name: "Vietnamita", native: "Tiếng Việt", region: "Ásia" },
    { code: "id", flag: "🇮🇩", name: "Indonésio", native: "Bahasa Indonesia", region: "Ásia" },
    { code: "ms", flag: "🇲🇾", name: "Malaio", native: "Bahasa Melayu", region: "Ásia" },
    { code: "tl", flag: "🇵🇭", name: "Filipino (Tagalog)", native: "Filipino", region: "Ásia" },
    { code: "my", flag: "🇲🇲", name: "Birmanês", native: "မြန်မာဘာသာ", region: "Ásia" },
    { code: "km", flag: "🇰🇭", name: "Khmer", native: "ភាសាខ្មែរ", region: "Ásia" },
    { code: "lo", flag: "🇱🇦", name: "Laosiano", native: "ພາສາລາວ", region: "Ásia" },
    { code: "jv", flag: "🇮🇩", name: "Javanês", native: "Basa Jawa", region: "Ásia" },
    { code: "su", flag: "🇮🇩", name: "Sundanês", native: "Basa Sunda", region: "Ásia" },
    { code: "ceb", flag: "🇵🇭", name: "Cebuano", native: "Bisaya", region: "Ásia" },
    { code: "hmn", flag: "🇨🇳", name: "Hmong", native: "Hmong", region: "Ásia" },
    { code: "mn", flag: "🇲🇳", name: "Mongol", native: "Монгол", region: "Ásia" },

    // Africa
    { code: "sw", flag: "🇰🇪", name: "Suaíli", native: "Kiswahili", region: "África" },
    { code: "am", flag: "🇪🇹", name: "Amárico", native: "አማርኛ", region: "África" },
    { code: "yo", flag: "🇳🇬", name: "Iorubá", native: "Yorùbá", region: "África" },
    { code: "ig", flag: "🇳🇬", name: "Igbo", native: "Asụsụ Igbo", region: "África" },
    { code: "ha", flag: "🇳🇬", name: "Hauçá", native: "Hausa", region: "África" },
    { code: "zu", flag: "🇿🇦", name: "Zulu", native: "isiZulu", region: "África" },
    { code: "xh", flag: "🇿🇦", name: "Xhosa", native: "isiXhosa", region: "África" },
    { code: "af", flag: "🇿🇦", name: "Africâner", native: "Afrikaans", region: "África" },
    { code: "st", flag: "🇱🇸", name: "Sesoto", native: "Sesotho", region: "África" },
    { code: "sn", flag: "🇿🇼", name: "Shona", native: "chiShona", region: "África" },
    { code: "so", flag: "🇸🇴", name: "Somali", native: "Soomaali", region: "África" },
    { code: "ny", flag: "🇲🇼", name: "Chichewa", native: "Chichewa", region: "África" },
    { code: "rw", flag: "🇷🇼", name: "Kinyarwanda", native: "Kinyarwanda", region: "África" },
    { code: "ee", flag: "🇬🇭", name: "Ewe", native: "Eʋegbe", region: "África" },
    { code: "ak", flag: "🇬🇭", name: "Akan (Twi)", native: "Akan", region: "África" },
    { code: "ti", flag: "🇪🇷", name: "Tigrínia", native: "ትግርኛ", region: "África" },
    { code: "om", flag: "🇪🇹", name: "Oromo", native: "Afaan Oromoo", region: "África" },
    { code: "lg", flag: "🇺🇬", name: "Luganda", native: "Luganda", region: "África" },
    { code: "ln", flag: "🇨🇩", name: "Lingala", native: "Lingála", region: "África" },
    { code: "tn", flag: "🇧🇼", name: "Setswana", native: "Setswana", region: "África" },
    { code: "ts", flag: "🇿🇦", name: "Tsonga", native: "Tsonga", region: "África" },
    { code: "mg", flag: "🇲🇬", name: "Malgaxe", native: "Malagasy", region: "África" },

    // Pacifico
    { code: "haw", flag: "🇺🇸", name: "Havaiano", native: "ʻŌlelo Hawaiʻi", region: "Pacífico" },
    { code: "sm", flag: "🇼🇸", name: "Samoano", native: "Gagana Samoa", region: "Pacífico" },
    { code: "mi", flag: "🇳🇿", name: "Maori", native: "Te Reo Māori", region: "Pacífico" },

    // Especial
    { code: "la", flag: "🇻🇦", name: "Latim", native: "Latina", region: "Especial" },
    { code: "eo", flag: "🌍", name: "Esperanto", native: "Esperanto", region: "Especial" },
    { code: "yi", flag: "🕍", name: "Iídiche", native: "ייִדיש", region: "Especial" },
    { code: "sa", flag: "🇮🇳", name: "Sânscrito", native: "संस्कृतम्", region: "Especial" },
];

/* =========================================================
   Seletor de idiomas
========================================================= */
const LangSelector = (() => {
    let selected = { code: "pt", flag: "🇧🇷", name: "Português (BR)" };
    let currentRegion = "Todos";
    let currentSearch = "";
    let initialized = false;

    const REGIONS = ["Todos", ...new Set(LANGUAGES.map((language) => language.region))];

    function getElement(id) {
        return document.getElementById(id);
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function init() {
        if (initialized || !getElement("langModal")) {
            return;
        }

        initialized = true;
        buildRegionTabs();
        renderGrid();
        updateLanguageLabel();

        const count = getElement("langCount");
        if (count) {
            count.textContent = `${LANGUAGES.length} idiomas`;
        }

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                close();
            }
        });
    }

    function buildRegionTabs() {
        const container = getElement("regionTabs");
        if (!container) {
            return;
        }

        container.innerHTML = REGIONS.map((region) => `
            <button
                class="region-tab${region === currentRegion ? " active" : ""}"
                type="button"
                onclick="LangSelector.setRegion('${escapeHtml(region)}')"
            >${escapeHtml(region)}</button>
        `).join("");
    }

    function renderGrid() {
        const grid = getElement("langGrid");
        if (!grid) {
            return;
        }

        const query = currentSearch.toLowerCase().trim();
        const filtered = LANGUAGES.filter((language) => {
            const matchRegion = currentRegion === "Todos" || language.region === currentRegion;
            const matchSearch = !query ||
                language.name.toLowerCase().includes(query) ||
                language.native.toLowerCase().includes(query) ||
                language.code.toLowerCase().includes(query);

            return matchRegion && matchSearch;
        });

        if (!filtered.length) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1">
                    <div class="empty-icon">🔍</div>
                    <p>Nenhum idioma encontrado para "<strong>${escapeHtml(currentSearch)}</strong>"</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map((language) => `
            <button
                class="lang-item${language.code === selected.code ? " selected" : ""}"
                type="button"
                onclick="LangSelector.select('${escapeHtml(language.code)}')"
                title="${escapeHtml(language.native)}"
            >
                <span class="lang-flag">${escapeHtml(language.flag)}</span>
                <span class="lang-info">
                    <span class="lang-name">${escapeHtml(language.name)}</span>
                    <span class="lang-native">${escapeHtml(language.native)}</span>
                </span>
                <span class="lang-check" aria-hidden="true">✓</span>
            </button>
        `).join("");
    }

    function open() {
        init();

        getElement("langOverlay")?.classList.add("active");
        getElement("langModal")?.classList.add("active");
        getElement("langTrigger")?.setAttribute("aria-expanded", "true");

        setTimeout(() => getElement("langSearch")?.focus(), 50);
    }

    function close() {
        getElement("langOverlay")?.classList.remove("active");
        getElement("langModal")?.classList.remove("active");
        getElement("langTrigger")?.setAttribute("aria-expanded", "false");
    }

    function filter(value) {
        currentSearch = value;
        renderGrid();
    }

    function setRegion(region) {
        currentRegion = region;
        buildRegionTabs();
        renderGrid();
    }

    function updateLanguageLabel() {
        const flag = getElement("current-lang-flag");
        const label = getElement("current-lang-label");
        const footer = getElement("footerCurrent");

        if (flag) {
            flag.textContent = getLanguageBadge(selected.code);
        }

        if (label) {
            label.textContent = selected.name;
        }

        if (footer) {
            footer.textContent = selected.name;
        }
    }

    function getLanguageBadge(code) {
        const badges = {
            pt: "BR",
            en: "EN",
            es: "ES",
            fr: "FR",
            "zh-CN": "CN",
            "zh-TW": "TW",
        };

        return badges[code] || code.split("-")[0].slice(0, 2).toUpperCase();
    }

    function applyGoogleTranslate(code) {
        const combo = document.querySelector(".goog-te-combo");

        if (combo) {
            combo.value = code;
            combo.dispatchEvent(new Event("change"));
            return;
        }

        // Fallback: cria o cookie usado pelo Google Translate e recarrega a pagina.
        const cookieValue = `/pt/${code}`;
        document.cookie = `googtrans=${cookieValue};path=/`;

        try {
            document.cookie = `googtrans=${cookieValue};domain=.${location.hostname};path=/`;
        } catch (error) {
            console.warn("Nao foi possivel criar cookie de dominio do Google Translate.", error);
        }

        location.reload();
    }

    function select(code, flag, name) {
        const language = LANGUAGES.find((item) => item.code === code) || { code, flag, name };

        if (!language.code || !language.name) {
            return;
        }

        selected = {
            code: language.code,
            flag: language.flag || flag,
            name: language.name,
        };

        updateLanguageLabel();
        applyGoogleTranslate(language.code);
        renderGrid();
        close();
    }

    function reset() {
        const search = getElement("langSearch");

        if (search) {
            search.value = "";
        }

        currentSearch = "";
        currentRegion = "Todos";
        buildRegionTabs();
        select("pt");
    }

    return { init, open, close, filter, setRegion, select, reset };
})();

window.LangSelector = LangSelector;

/* =========================================================
   Callback global do Google Translate
========================================================= */
function googleTranslateElementInit() {
    new google.translate.TranslateElement(
        {
            pageLanguage: "pt",
            autoDisplay: false,
        },
        "google_translate_element"
    );
}

window.googleTranslateElementInit = googleTranslateElementInit;

/* =========================================================
   Inicializacao segura dos componentes globais
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    LangSelector.init();
    updateDynamicYears();
    initBackgroundCanvas();
    initDropdownLogin();
    initMobileMenu();
});

function updateDynamicYears() {
    const year = new Date().getFullYear();
    const singleYear = document.getElementById("ano");

    if (singleYear) {
        singleYear.textContent = year;
    }

    document.querySelectorAll(".AnoAtual").forEach((span) => {
        span.textContent = year;
    });
}

/* =========================================================
   Particulas do canvas de fundo
========================================================= */
function initBackgroundCanvas() {
    const canvas = document.getElementById("background-canvas");

    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext("2d");
    let particlesArray = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = 2;
            this.speedX = (Math.random() - 0.5) * 0.8;
            this.speedY = (Math.random() - 0.5) * 0.8;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > canvas.width || this.x < 0) {
                this.speedX *= -1;
            }

            if (this.y > canvas.height || this.y < 0) {
                this.speedY *= -1;
            }
        }

        draw() {
            ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function createParticles() {
        particlesArray = [];
        const numberOfParticles = (canvas.width * canvas.height) / 9000;

        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function connect() {
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                const dx = particlesArray[a].x - particlesArray[b].x;
                const dy = particlesArray[a].y - particlesArray[b].y;
                const distance = dx * dx + dy * dy;

                if (distance < 10000) {
                    ctx.strokeStyle = "rgba(255,255,255,0.05)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particlesArray.forEach((particle) => {
            particle.update();
            particle.draw();
        });
        connect();
        requestAnimationFrame(animate);
    }

    resizeCanvas();
    createParticles();
    animate();

    window.addEventListener("resize", () => {
        resizeCanvas();
        createParticles();
    });
}

/* =========================================================
   Dropdown de login
========================================================= */
function initDropdownLogin() {
    const menu = document.getElementById("dropdownentrar");
    const menuContainer = document.querySelector(".menulogin");

    if (!menu || !menuContainer) {
        return;
    }

    document.addEventListener("click", (event) => {
        if (!menuContainer.contains(event.target)) {
            menu.classList.remove("show");
        }
    });
}

function abrirdropdown() {
    document.getElementById("dropdownentrar")?.classList.toggle("show");
}

/* =========================================================
   Menu hamburguer
========================================================= */
function initMobileMenu() {
    const openButton = document.querySelector(".botaoMenu");
    const closeButton = document.querySelector(".fecharMenu");

    openButton?.addEventListener("click", abrirmenu);
    closeButton?.addEventListener("click", fecharmenu);
}

function abrirmenu() {
    const menu = document.querySelector("header nav");

    if (menu) {
        menu.style.right = "0";
    }
}

function fecharmenu() {
    const menu = document.querySelector("header nav");

    if (menu) {
        menu.style.right = "-100%";
    }
}
