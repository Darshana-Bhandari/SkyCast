const CONFIG = {
    apiKey: "01224752f6d7948fe5d5c12b31fee4e4",
    apiUrl: "https://api.openweathermap.org/data/2.5/weather"
};

// DOM Elements Cache
const el = {
    input: document.querySelector(".search input"),
    btn: document.querySelector(".search button"),
    city: document.querySelector(".city"),
    temp: document.querySelector(".temp"),
    humidity: document.querySelector(".humidity"),
    wind: document.querySelector(".wind"),
    icon: document.querySelector(".weather img"),
    error: document.querySelector(".error-message") // Ensure this exists in your HTML
};


async function fetchWeather(paramString) {
    const url = `${CONFIG.apiUrl}?units=metric&${paramString}&appid=${CONFIG.apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(response.status === 404 ? "City not found" : "Weather service unavailable");
    }
    return await response.json();
}

function updateUI(data) {
    // Hide error display if previous attempt failed
    if (el.error) el.error.style.display = "none"; 

    // Update text content safely
    if (el.city) el.city.textContent = data.name;
    if (el.temp) el.temp.textContent = `${Math.round(data.main.temp)}°C`;
    if (el.humidity) el.humidity.textContent = `${data.main.humidity}%`;
    if (el.wind) el.wind.textContent = `${data.wind.speed} km/h`;
    
    // Update Weather Icon
    if (el.icon) {
        el.icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    }

    // Dynamic Background Changing Logic
    const mainCondition = data.weather[0].main.toLowerCase();
    document.body.className = ""; // Reset current background classes
    
    if (mainCondition.includes("cloud")) {
        document.body.classList.add("cloudy");
    } else if (mainCondition.includes("rain") || mainCondition.includes("drizzle")) {
        document.body.classList.add("rainy");
    } else if (mainCondition.includes("clear")) {
        document.body.classList.add("sunny");
    } else if (mainCondition.includes("snow")) {
        document.body.classList.add("snowy");
    }

    // Clear input for the next search
    if (el.input) el.input.value = "";
}

// 3. Error Handling Logic
function handleError(message) {
    console.error(message);
    if (el.error) {
        el.error.textContent = message;
        el.error.style.display = "block";
    } else {
        alert("Error: " + message + "\nPlease check spelling.");
    }
}

// 4. Input Handler / Search Trigger
async function performCitySearch() {
    const query = el.input.value.trim();
    if (!query) return;

    try {
        const data = await fetchWeather(`q=${encodeURIComponent(query)}`);
        updateUI(data);
    } catch (error) {
        handleError(error.message);
    }
}

// 5. Geolocation Feature (Load local weather automatically)
function loadLocalWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const data = await fetchWeather(`lat=${latitude}&lon=${longitude}`);
                    updateUI(data);
                } catch (error) {
                    console.log("Could not fetch weather for current location.");
                }
            },
            (error) => {
                console.log("Geolocation permission denied or unavailable.");
            }
        );
    }
}

// --- Event Listeners ---

// Click search button
el.btn.addEventListener("click", performCitySearch);

// Press Enter key
el.input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") performCitySearch();
});

// Run automatically on page load to grab local weather
window.addEventListener("DOMContentLoaded", loadLocalWeather);