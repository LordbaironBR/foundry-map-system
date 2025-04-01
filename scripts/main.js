// Dentro do script do mapa
const apiKey = game.settings.get("foundry-map-system", "maptilerApiKey") || "";

if (!apiKey) {
    ui.notifications.warn("Nenhuma chave de API do MapTiler foi configurada. Vá em Configurações > Configurações do Mapa.");
} else {
    L.tileLayer(`https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${apiKey}`, {
        attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a>',
        maxZoom: 19
    }).addTo(map);
}

/**
 * Registro de configurações personalizadas no Foundry
 */

Hooks.once("init", () => {
    console.log("Foundry Map System | Inicializando...");

    game.settings.register("foundry-map-system", "maptilerApiKey", {
        name: "Chave da API do MapTiler",
        hint: "Insira sua chave de API pessoal do MapTiler. Cadastre-se em https://cloud.maptiler.com",
        scope: "world",
        config: true,
        type: String,
        default: ""
    });
});

/**
 * Renderização da interface do mapa quando o Foundry estiver pronto
 */
Hooks.once("ready", async function () {
    console.log("Foundry Map System | Módulo pronto. Renderizando mapa...");

    class MapInterface extends Application {
        static get defaultOptions() {
            return mergeObject(super.defaultOptions, {
                id: "foundry-map-interface",
                title: "Mapa Interativo",
                template: "modules/foundry-map-system/templates/map-ui.html",
                width: window.innerWidth,
                height: window.innerHeight,
                resizable: true
            });
        }

        activateListeners(html) {
            super.activateListeners(html);
            console.log("Mapa carregado");
        }
    }

    new MapInterface().render(true);
});
