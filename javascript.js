/* ============================================================
   SKYCAST — app logic
   ============================================================ */
 
const CONFIG = {
  apiKey: "01224752f6d7948fe5d5c12b31fee4e4",
  weatherUrl: "https://api.openweathermap.org/data/2.5/weather",
  forecastUrl: "https://api.openweathermap.org/data/2.5/forecast",
  airUrl: "https://api.openweathermap.org/data/2.5/air_pollution",
  geoUrl: "https://api.openweathermap.org/geo/1.0/direct",
  oneCallUrl: "https://api.openweathermap.org/data/3.0/onecall"
};
 
const el = {
  boot: document.getElementById("boot"),
  animations: document.getElementById("animations"),
  themeToggle: document.getElementById("themeToggle"),
  themeIcon: document.getElementById("themeIcon"),
  clockDay: document.getElementById("clockDay"),
  clockTime: document.getElementById("clockTime"),
  clockDate: document.getElementById("clockDate"),
  card: document.getElementById("mainCard"),
  input: document.getElementById("cityInput"),
  suggestions: document.getElementById("suggestions"),
  searchBtn: document.getElementById("searchBtn"),
  searchBtnIcon: document.getElementById("searchBtnIcon"),
  recentWrap: document.getElementById("recentWrap"),
  recentChips: document.getElementById("recentChips"),
  errorPanel: document.getElementById("errorPanel"),
  errorRetry: document.getElementById("errorRetry"),
  weatherContent: document.getElementById("weatherContent"),
  iconStage: document.getElementById("iconStage"),
  temp: document.getElementById("temp"),
  condition: document.getElementById("condition"),
  feelsLike: document.getElementById("feelsLike"),
  city: document.getElementById("city"),
  detailsGrid: document.getElementById("detailsGrid"),
  aqiValue: document.getElementById("aqiValue"),
  aqiStatus: document.getElementById("aqiStatus"),
  hourlyScroll: document.getElementById("hourlyScroll"),
  dailyList: document.getElementById("dailyList")
};
 
let lastQuery = null; // {lat,lon} or {city}
 
/* ---------------------------------------------------------------
   BOOT
--------------------------------------------------------------- */
function hideBoot(){ el.boot.classList.add("hidden"); }
 
/* ---------------------------------------------------------------
   CLOCK — updates every second
--------------------------------------------------------------- */
function tickClock(){
  const now = new Date();
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  el.clockDay.textContent = days[now.getDay()];
  let h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12; if (h === 0) h = 12;
  el.clockTime.textContent = `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")} ${ampm}`;
  el.clockDate.textContent = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}
setInterval(tickClock, 1000);
tickClock();
 
/* Auto theme accent-tint by time of day (blended with weather theme) */
function timeOfDayPhase(){
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return "morning";
  if (h >= 11 && h < 17) return "afternoon";
  if (h >= 17 && h < 20) return "evening";
  return "night";
}
 
/* ---------------------------------------------------------------
   DARK MODE
--------------------------------------------------------------- */
function applyDarkPref(){
  const saved = localStorage.getItem("skycast-dark");
  if (saved === "1"){ document.body.classList.add("dark"); el.themeIcon.textContent = "🌞"; }
}
applyDarkPref();
el.themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("skycast-dark", isDark ? "1" : "0");
  el.themeIcon.textContent = isDark ? "🌞" : "🌙";
});
 
/* ---------------------------------------------------------------
   CARD 3D TILT (desktop only)
--------------------------------------------------------------- */
if (window.matchMedia("(hover:hover) and (pointer:fine)").matches){
  el.card.addEventListener("mousemove", e => {
    const r = el.card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.card.style.setProperty("--tiltY", `${px * 8}deg`);
    el.card.style.setProperty("--tiltX", `${-py * 8}deg`);
  });
  el.card.addEventListener("mouseleave", () => {
    el.card.style.setProperty("--tiltY", `0deg`);
    el.card.style.setProperty("--tiltX", `0deg`);
  });
}

/* ---------------------------------------------------------------
   RECENT SEARCHES (localStorage)
--------------------------------------------------------------- */
function getRecents(){
  try { return JSON.parse(localStorage.getItem("skycast-recent") || "[]"); }
  catch { return []; }
}
function saveRecent(name){
  let list = getRecents().filter(c => c.toLowerCase() !== name.toLowerCase());
  list.unshift(name);
  list = list.slice(0, 5);
  localStorage.setItem("skycast-recent", JSON.stringify(list));
  renderRecents();
}
function renderRecents(){
  const list = getRecents();
  el.recentChips.innerHTML = "";
  if (!list.length){ el.recentWrap.style.display = "none"; return; }
  el.recentWrap.style.display = "flex";
  list.forEach(name => {
    const chip = document.createElement("span");
    /* ---------------------------------------------------------------
   GEOCODE SEARCH SUGGESTIONS (debounced)
--------------------------------------------------------------- */
let suggestTimer = null;
el.input.addEventListener("input", () => {
  clearTimeout(suggestTimer);
  const q = el.input.value.trim();
  if (q.length < 2){ el.suggestions.classList.remove("show"); return; }
  suggestTimer = setTimeout(() => fetchSuggestions(q), 300);
});
document.addEventListener("click", (e) => {
  if (!el.suggestions.contains(e.target) && e.target !== el.input){
    el.suggestions.classList.remove("show");
  }
});
 
async function fetchSuggestions(q){
  try{
    const res = await fetch(`${CONFIG.geoUrl}?q=${encodeURIComponent(q)}&limit=5&appid=${CONFIG.apiKey}`);
    const data = await res.json();
    if (!Array.isArray(data) || !data.length){ el.suggestions.classList.remove("show"); return; }
    el.suggestions.innerHTML = "";
    data.forEach(place => {
      const item = document.createElement("div");
      item.className = "suggestion-item";
      const region = [place.state, place.country].filter(Boolean).join(", ");
      item.innerHTML = `${place.name} <small>— ${region}</small>`;
      item.addEventListener("click", () => {
        el.input.value = place.name;
        el.suggestions.classList.remove("show");
        fetchByCoords(place.lat, place.lon, place.name);
      });
      el.suggestions.appendChild(item);
    });
    el.suggestions.classList.add("show");
  } catch { el.suggestions.classList.remove("show"); }
}
 
/* ---------------------------------------------------------------
   SEARCH ACTIONS
--------------------------------------------------------------- */
function setSearchLoading(isLoading){
  el.searchBtn.classList.toggle("loading", isLoading);
  el.searchBtnIcon.textContent = isLoading ? "⏳" : "🔍";
}
function flashSearchSuccess(){
  el.searchBtnIcon.textContent = "✓";
  setTimeout(() => { el.searchBtnIcon.textContent = "🔍"; }, 1200);
}
async function performCitySearch(){
  const q = el.input.value.trim();
  if (!q) return;
  await fetchByCity(q);
}
el.searchBtn.addEventListener("click", performCitySearch);
el.input.addEventListener("keypress", e => { if (e.key === "Enter") performCitySearch(); });
el.errorRetry.addEventListener("click", () => { showError(false); el.input.focus(); });
 
/* ---------------------------------------------------------------
   FETCH ORCHESTRATION
--------------------------------------------------------------- */
async function fetchByCity(name){
  setSearchLoading(true);
  try{
    const res = await fetch(`${CONFIG.weatherUrl}?q=${encodeURIComponent(name)}&units=metric&appid=${CONFIG.apiKey}`);
    if (!res.ok) throw new Error("not found");
    const data = await res.json();
    await handleWeatherData(data);
    saveRecent(data.name);
    flashSearchSuccess();
  } catch(e){
    showError(true);
  } finally{ setSearchLoading(false); }
}
 
async function fetchByCoords(lat, lon, fallbackName){
  setSearchLoading(true);
  try{
    const res = await fetch(`${CONFIG.weatherUrl}?lat=${lat}&lon=${lon}&units=metric&appid=${CONFIG.apiKey}`);
    if (!res.ok) throw new Error("not found");
    const data = await res.json();
    await handleWeatherData(data);
    saveRecent(data.name || fallbackName || "Location");
    flashSearchSuccess();
  } catch(e){
    showError(true);