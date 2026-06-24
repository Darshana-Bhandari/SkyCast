const CONFIG = {
    apiKey: "01224752f6d7948fe5d5c12b31fee4e4",
    apiUrl: "https://api.openweathermap.org/data/2.5/weather"
};

// DOM Elements
const el = {
    input: document.querySelector(".search input"),
    btn: document.querySelector(".search button"),
    city: document.querySelector(".city"),
    temp: document.querySelector(".temp"),
    humidity: document.querySelector(".humidity"),
    wind: document.querySelector(".wind"),
    icon: document.querySelector(".weather img"),
    animations: document.querySelector(".weather-animations")
};

// ── Icon Map (overrides OpenWeather icon with correct one) ────────────────────
// Uses OpenWeather's own icons but picks the RIGHT one based on our logic
const ICON_MAP = {
    sunny:       "https://openweathermap.org/img/wn/01d@2x.png",  // clear sky sun
    partlyCloudy:"https://openweathermap.org/img/wn/02d@2x.png",  // few clouds
    cloudy:      "https://openweathermap.org/img/wn/04d@2x.png",  // broken clouds
    rain:        "https://openweathermap.org/img/wn/10d@2x.png",  // rain
    drizzle:     "https://openweathermap.org/img/wn/09d@2x.png",  // drizzle
    thunderstorm:"https://openweathermap.org/img/wn/11d@2x.png",  // thunderstorm
    snow:        "https://openweathermap.org/img/wn/13d@2x.png",  // snow
    mist:        "https://openweathermap.org/img/wn/50d@2x.png",  // mist/fog
};

// ── helpers ───────────────────────────────────────────────────────────────────

function clearAnimations() {
    if (el.animations) el.animations.innerHTML = "";
}

function setIcon(type) {
    if (el.icon && ICON_MAP[type]) {
        el.icon.src = ICON_MAP[type];
    }
}

// ── animation builders ────────────────────────────────────────────────────────

function createSun() {
    const sun = document.createElement("div");
    sun.style.cssText = `
        position: absolute;
        top: 12%;
        right: 12%;
        width: 80px;
        height: 80px;
        background: radial-gradient(circle, #ffe97a 0%, #ffcc00 55%, rgba(255,200,0,0) 100%);
        border-radius: 50%;
        box-shadow: 0 0 40px 20px rgba(255, 220, 50, 0.55),
                    0 0 80px 40px rgba(255, 200, 0, 0.25);
        animation: sunPulse 3s ease-in-out infinite;
        z-index: 1;
    `;

    const raysWrapper = document.createElement("div");
    raysWrapper.style.cssText = `
        position: absolute;
        top: 12%;
        right: 12%;
        width: 80px;
        height: 80px;
        animation: rotateSun 12s linear infinite;
        z-index: 1;
    `;

    for (let i = 0; i < 8; i++) {
        const ray = document.createElement("div");
        const angle = (360 / 8) * i;
        ray.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 4px;
            height: 28px;
            margin-left: -2px;
            background: linear-gradient(to top, rgba(255,220,50,0.9), transparent);
            border-radius: 2px;
            transform-origin: 50% 0%;
            transform: rotate(${angle}deg) translateY(-56px);
        `;
        raysWrapper.appendChild(ray);
    }

    el.animations.appendChild(sun);
    el.animations.appendChild(raysWrapper);
}

function createClouds(count = 6) {
    for (let i = 0; i < count; i++) {
        const cloud = document.createElement("div");
        cloud.classList.add("cloud");
        const size = 70 + Math.random() * 130;
        cloud.style.width             = size + "px";
        cloud.style.height            = (size * 0.6) + "px";
        cloud.style.top               = (10 + Math.random() * 50) + "%";
        cloud.style.left              = Math.random() * 100 + "%";
        cloud.style.animationDuration = (25 + Math.random() * 35) + "s";
        cloud.style.animationDelay    = "-" + (Math.random() * 40) + "s";
        cloud.style.opacity           = 0.5 + Math.random() * 0.35;
        el.animations.appendChild(cloud);
    }
}

function createRain(count = 120, isDrizzle = false) {
    for (let i = 0; i < count; i++) {
        const drop = document.createElement("div");
        drop.classList.add("drop");
        drop.style.left              = Math.random() * 100 + "%";
        drop.style.height            = (isDrizzle ? 25 : 50) + Math.random() * 40 + "px";
        drop.style.animationDuration = (isDrizzle ? 0.6 : 0.4) + Math.random() * 0.6 + "s";
        drop.style.animationDelay    = Math.random() * 2 + "s";
        drop.style.opacity           = isDrizzle ? 0.5 : 0.8;
        el.animations.appendChild(drop);
    }
}

function createSnow(count = 80) {
    const snowChars = ["❄", "❅", "❆"];
    for (let i = 0; i < count; i++) {
        const flake = document.createElement("div");
        flake.classList.add("snowflake");
        flake.textContent             = snowChars[Math.floor(Math.random() * snowChars.length)];
        flake.style.left              = Math.random() * 100 + "%";
        flake.style.fontSize          = (12 + Math.random() * 18) + "px";
        flake.style.animationDuration = (6 + Math.random() * 8) + "s";
        flake.style.animationDelay    = Math.random() * 6 + "s";
        flake.style.opacity           = 0.7 + Math.random() * 0.3;
        el.animations.appendChild(flake);
    }
}

function createMist() {
    const mistLayer = document.createElement("div");
    mistLayer.classList.add("mist");
    el.animations.appendChild(mistLayer);
}

function createThunderstorm() {
    createRain(160, false);
    const lightning = document.createElement("div");
    lightning.style.cssText = `
        position: absolute;
        inset: 0;
        background: rgba(255,255,255,0);
        animation: lightningFlash 4s infinite;
        border-radius: inherit;
    `;
    el.animations.appendChild(lightning);
}

// ── main update ───────────────────────────────────────────────────────────────

function updateUI(data) {
    el.city.textContent     = data.name;
    el.temp.textContent     = `${Math.round(data.main.temp)}°C`;
    el.humidity.textContent = `${data.main.humidity}%`;
    el.wind.textContent     = `${data.wind.speed} km/h`;

    clearAnimations();

    const temp      = data.main.temp;
    const condition = data.weather[0].main.toLowerCase();

    // Severe weather — always takes priority no matter the temperature
    const isSevere = condition.includes("thunderstorm") ||
                     condition.includes("rain")         ||
                     condition.includes("drizzle")      ||
                     condition.includes("snow")         ||
                     condition.includes("mist")         ||
                     condition.includes("fog")          ||
                     condition.includes("haze");

    if (condition.includes("thunderstorm")) {
        // ⛈ Thunderstorm
        setIcon("thunderstorm");
        createThunderstorm();

    } else if (condition.includes("rain")) {
        // 🌧 Rain
        setIcon("rain");
        createRain(130, false);

    } else if (condition.includes("drizzle")) {
        // 🌦 Drizzle
        setIcon("drizzle");
        createRain(80, true);

    } else if (condition.includes("snow")) {
        // ❄ Snow
        setIcon("snow");
        createSnow(70);

    } else if (condition.includes("mist") || condition.includes("fog") || condition.includes("haze")) {
        // 🌫 Mist / Fog
        setIcon("mist");
        createMist();
        createClouds(3);

    } else if (temp >= 26 && !isSevere) {
        // ☀️ Temp 26°C or above + no severe weather = SUNNY
        // Show sun icon + sun animation regardless of cloud condition from API
        if (condition.includes("cloud")) {
            setIcon("partlyCloudy");  // few clouds icon but still show sun animation
            createSun();
            createClouds(2);          // 2 light clouds behind sun
        } else {
            setIcon("sunny");         // pure clear sun icon
            createSun();
        }

    } else if (condition.includes("cloud")) {
        // ☁️ Cloudy (and temp below 26)
        setIcon("cloudy");
        createClouds(7);

    } else if (condition.includes("clear")) {
        // 🌤 Clear but below 26°C (cool clear day)
        setIcon("sunny");
        createSun();

    } else {
        // Default fallback
        setIcon("partlyCloudy");
        createClouds(4);
    }
}

// ── search ────────────────────────────────────────────────────────────────────

async function performCitySearch() {
    const query = el.input.value.trim();
    if (!query) return;
    try {
        const res = await fetch(
            `${CONFIG.apiUrl}?q=${encodeURIComponent(query)}&units=metric&appid=${CONFIG.apiKey}`
        );
        if (!res.ok) throw new Error("City not found");
        updateUI(await res.json());
    } catch (error) {
        alert("Error: " + error.message);
    }
}

// ── event listeners ───────────────────────────────────────────────────────────

el.btn.addEventListener("click", performCitySearch);
el.input.addEventListener("keypress", e => {
    if (e.key === "Enter") performCitySearch();
});

window.addEventListener("load", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async pos => {
            try {
                const res = await fetch(
                    `${CONFIG.apiUrl}?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&units=metric&appid=${CONFIG.apiKey}`
                );
                updateUI(await res.json());
            } catch (e) {}
        });
    }
});