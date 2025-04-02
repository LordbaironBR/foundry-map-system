// main.js

Hooks.once("init", () => {
    console.log("[Foundry Map System] Inicializando...");

    // Configuração global para API do MapTiler
    game.settings.register("foundry-map-system", "maptilerApiKey", {
        name: "Chave da API do MapTiler",
        hint: "Insira sua chave de API pessoal do MapTiler. Cadastre-se em https://cloud.maptiler.com",
        scope: "world",
        config: true,
        type: String,
        default: ""
    });

    // Adiciona campos personalizados às cenas
    Hooks.on("renderSceneConfig", (app, html, data) => {
        const flags = app.object.flags["foundry-map-system"] || {};

        // Remove campos anteriores duplicados
        html.find('.form-group[data-map-interativo]').remove();

        const mapSettings = `
      <div class="form-group" data-map-interativo>
        <label>Ativar Mapa Interativo</label>
        <input type="checkbox" name="flags.foundry-map-system.enabled" ${flags.enabled ? "checked" : ""} />
      </div>
      <div class="form-group" data-map-interativo>
        <label>Localização (ex: Guarulhos, SP, Brasil)</label>
        <input type="text" name="flags.foundry-map-system.location" value="${flags.location || ""}" />
      </div>
    `;

        html.find(".tab[data-tab='basic']").append(mapSettings);
    });
});

Hooks.on("canvasReady", async (canvas) => {
    const scene = game.scenes.get(canvas.scene._id);
    const flags = scene.flags["foundry-map-system"] || {};

    if (!flags.enabled) return;

    const apiKey = game.settings.get("foundry-map-system", "maptilerApiKey");
    if (!apiKey) {
        ui.notifications.warn("Nenhuma chave de API do MapTiler configurada. Vá em Configurações > Configurações do Módulo.");
        return;
    }

    if (!flags.location) {
        ui.notifications.warn("Nenhuma localização definida para esta cena interativa.");
        return;
    }

    // Carrega Leaflet dinamicamente
    if (!window.L) {
        const leafletCSS = document.createElement("link");
        leafletCSS.rel = "stylesheet";
        leafletCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(leafletCSS);

        const leafletScript = document.createElement("script");
        leafletScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        leafletScript.onload = () => {
            loadMap(flags.location, apiKey);
        };
        document.body.appendChild(leafletScript);
    } else {
        loadMap(flags.location, apiKey);
    }
});

async function loadMap(location, apiKey) {
    // Usa a API do MapTiler para geocodificar o nome
    const response = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=${apiKey}`);
    const data = await response.json();

    if (!data.features || data.features.length === 0) {
        ui.notifications.error("Localização não encontrada.");
        return;
    }

    const [lng, lat] = data.features[0].center;

    const containerId = "map-interactive-container";
    let container = document.getElementById(containerId);

    if (!container) {
        container = document.createElement("div");
        container.id = containerId;
        container.style.position = "absolute";
        container.style.top = 0;
        container.style.left = 0;
        container.style.width = "100%";
        container.style.height = "100%";
        container.style.zIndex = 0;
        container.style.pointerEvents = "auto";
        document.body.appendChild(container);
    } else {
        container.innerHTML = "";
    }

    const map = L.map(containerId).setView([lat, lng], 13);
    L.tileLayer(`https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${apiKey}`, {
        attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a>',
        maxZoom: 19
    }).addTo(map);

    ui.notifications.info("Mapa interativo carregado com sucesso.");
}
