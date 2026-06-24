const apikey = "01224752f6d7948fe5d5c12b31fee4e4";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");

async function checkWeather(city) {
    try {
        const response = await fetch(apiUrl + city + `&appid=${apikey}`);
        
        if (!response.ok) {
            throw new Error("City not found");
        }

        const data = await response.json();
        console.log(data);   // ← Open browser console (F12) to see data

        // Update City
        document.querySelector(".city").innerHTML = data.name;

        // Update Temperature
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";

        // Update Humidity
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";

        // Update Wind Speed
        document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

        // Update Weather Icon
        const weatherIcon = document.querySelector(".weather img");
        if (weatherIcon) {
            weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        }

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message + "\nPlease check city name spelling.");
    }
}

// Search button click
searchBtn.addEventListener("click", () => {
    if (searchBox.value.trim() !== "") {
        checkWeather(searchBox.value.trim());
    }
});

// Press Enter key to search
searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && searchBox.value.trim() !== "") {
        checkWeather(searchBox.value.trim());
    }
});