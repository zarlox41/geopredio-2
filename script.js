const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_CSS_INTEGRITY = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
const LEAFLET_JS_INTEGRITY = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";

let mapInitialized = false;
let leafletLoadingPromise;

function loadLeafletAssets() {
    if (window.L) return Promise.resolve();
    if (leafletLoadingPromise) return leafletLoadingPromise;

    leafletLoadingPromise = new Promise((resolve, reject) => {
        let cssReady = false;
        let jsReady = false;

        const finish = () => {
            if (cssReady && jsReady) resolve();
        };

        const stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.href = LEAFLET_CSS_URL;
        stylesheet.crossOrigin = "";
        stylesheet.integrity = LEAFLET_CSS_INTEGRITY;
        stylesheet.onload = () => {
            cssReady = true;
            finish();
        };
        stylesheet.onerror = reject;
        document.head.appendChild(stylesheet);

        const script = document.createElement("script");
        script.src = LEAFLET_JS_URL;
        script.crossOrigin = "";
        script.integrity = LEAFLET_JS_INTEGRITY;
        script.onload = () => {
            jsReady = true;
            finish();
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });

    return leafletLoadingPromise;
}

function initMap() {
    if (mapInitialized || !window.L) return;
    mapInitialized = true;

    const map = L.map("map").setView([3.4515, -76.532], 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const basemaps = {
        StreetView: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }),
        Topography: L.tileLayer.wms("https://ows.mundialis.de/services/service?", { layers: "TOPO-WMS" }),
        Places: L.tileLayer.wms("https://ows.mundialis.de/services/service?", { layers: "OSM-Overlay-WMS" }),
        darkgray: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
            attribution: "Esri & OpenStreetMap"
        })
    };

    L.control.layers(basemaps).addTo(map);
}

function scheduleMapLoad() {
    loadLeafletAssets().then(() => {
        requestAnimationFrame(initMap);
    }).catch((error) => {
        console.error("No se pudo cargar Leaflet:", error);
    });
}

function setupMapBoot() {
    const mapElement = document.getElementById("map");
    if (!mapElement) return;

    const desktopMedia = window.matchMedia("(min-width: 1025px)");
    if (desktopMedia.matches) {
        scheduleMapLoad();
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);
        if (!isVisible) return;
        obs.disconnect();
        scheduleMapLoad();
    }, { rootMargin: "180px 0px" });

    observer.observe(mapElement);
}

document.addEventListener("DOMContentLoaded", setupMapBoot);
