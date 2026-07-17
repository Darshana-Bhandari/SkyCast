# 🌤️ SkyCast

A modern and interactive weather application built using **HTML**, **CSS**, and **JavaScript** that delivers real-time weather information with beautiful animations, dynamic themes, and an immersive user experience.

SkyCast automatically detects your current location on startup and displays detailed weather information. You can also search for any city worldwide and explore hourly forecasts, 5-day forecasts, air quality, and much more.

---

## ✨ Features

### 🌍 Weather

- Real-time weather data using the OpenWeather API
- Search weather by city name
- Automatic location detection
- Current temperature in Celsius
- Weather description
- Feels like temperature
- Humidity
- Wind speed
- Atmospheric pressure
- Visibility
- Sunrise & Sunset time
- Min / Max temperature
- UV Index (when available)
- Air Quality Index (AQI)

---

## 📅 Forecast

- Hourly weather forecast
- 5-Day weather forecast
- Weather icons for each forecast
- Dynamic forecast cards

---

## 🎨 User Experience

- Beautiful glassmorphism design
- Dynamic animated weather backgrounds
- Weather-specific animations
  - ☀️ Sunny
  - ☁️ Cloudy
  - 🌙 Clear Night
  - 🌧 Rain
  - 🌦 Drizzle
  - ❄ Snow
  - 🌫 Mist
  - ⛈ Thunderstorm
- Animated weather icons
- Smooth transitions
- Floating weather card animation
- Loading boot screen
- Responsive design for desktop, tablet, and mobile

---

## 🌙 Smart Features

- Dark Mode
- Live Clock & Date
- Search Suggestions (Autocomplete)
- Recent Search History
- Local Storage Support
- Error handling for invalid cities
- Animated search feedback
- Automatic theme based on weather conditions

---

## 🛠 Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- OpenWeather API
- Geolocation API
- Local Storage API
- Google Fonts

---

## 📂 Project Structure

```text
SkyCast/
│
├── index.html
├── style.css
├── javascript.js
├── README.md
└── assets/
```

---

## 🚀 Installation

Clone the repository

```bash
git clone https://github.com/Darshana-Bhandari/Weather-App.git
```

Go to the project folder

```bash
cd Weather-App
```

Open the project using **Live Server** or any local development server.

---

## 🔑 API Setup

1. Create a free account on OpenWeather.

2. Generate your API key.

3. Open `javascript.js`

Replace the API key with your own.

```javascript
const CONFIG = {
  apiKey: "YOUR_API_KEY",
  weatherUrl: "https://api.openweathermap.org/data/2.5/weather",
  forecastUrl: "https://api.openweathermap.org/data/2.5/forecast",
  airUrl: "https://api.openweathermap.org/data/2.5/air_pollution",
  geoUrl: "https://api.openweathermap.org/geo/1.0/direct",
  oneCallUrl: "https://api.openweathermap.org/data/3.0/onecall"
};
```

---

## 📱 Responsive Design

SkyCast is fully responsive and works seamlessly on:

- 💻 Desktop
- 💼 Laptop
- 📱 Mobile
- 📲 Tablet

---

## 🌦 Supported Weather Conditions

- ☀️ Clear Sky
- 🌤 Sunny
- ⛅ Partly Cloudy
- ☁️ Cloudy
- 🌧 Rain
- 🌦 Drizzle
- ⛈ Thunderstorm
- ❄ Snow
- 🌫 Mist
- 🌁 Fog
- 🌫 Haze

---

## ⚡ Highlights

- Automatic weather detection
- Dynamic animated backgrounds
- Live digital clock
- Dark mode support
- Beautiful glassmorphism UI
- Weather-based page themes
- Hourly forecast
- 5-Day forecast
- Air Quality Index
- Smooth animations
- Search history
- Search suggestions
- Responsive layout

---

## 📸 Preview

> Add screenshots or a GIF of the application here.

Example:

```
screenshots/
├── home.png
├── search.png
├── dark-mode.png
└── forecast.png
```

---

## 🔮 Future Improvements

- Weather map integration
- Multiple temperature units (°C / °F)
- Favorite cities
- Weather alerts
- Sunrise/Sunset animation
- PWA support
- Offline mode

---

## 👨‍💻 Author

**Darshana Bhandari**

Frontend Developer

GitHub:
https://github.com/Darshana-Bhandari

---

## 📄 License

This project is licensed under the **MIT License**.

---

## ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.

It helps support the project and encourages future improvements.