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
    chip.textContent = name;
    chip.addEventListener("click", () => { el.input.value = name; fetchByCity(name); });
    el.recentChips.appendChild(chip);
  });
}
renderRecents();

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
  } finally{ setSearchLoading(false); }
}

function showError(show){
  el.errorPanel.classList.toggle("show", show);
  el.weatherContent.classList.toggle("hide", show);
}

/* ---------------------------------------------------------------
   MAIN HANDLER — kicks off forecast + air quality too
--------------------------------------------------------------- */
async function handleWeatherData(data){
  showError(false);
  lastQuery = { lat: data.coord.lat, lon: data.coord.lon };

  renderCurrent(data);
  applyTheme(data);

  const [forecast, air] = await Promise.allSettled([
    fetch(`${CONFIG.forecastUrl}?lat=${data.coord.lat}&lon=${data.coord.lon}&units=metric&appid=${CONFIG.apiKey}`).then(r => r.json()),
    fetch(`${CONFIG.airUrl}?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${CONFIG.apiKey}`).then(r => r.json())
  ]);

  if (forecast.status === "fulfilled" && forecast.value?.list){
    renderHourly(forecast.value.list);
    renderDaily(forecast.value.list);
  }
  if (air.status === "fulfilled" && air.value?.list?.length){
    renderAQI(air.value.list[0]);
  }

  // UV index — needs One Call 3.0 (subscription-gated); fail quietly if unavailable
  try{
    const uvRes = await fetch(`${CONFIG.oneCallUrl}?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=minutely,daily,hourly,alerts&units=metric&appid=${CONFIG.apiKey}`);
    if (uvRes.ok){
      const uvData = await uvRes.json();
      if (typeof uvData.current?.uvi === "number"){
        setDetailTile("uvi", uvData.current.uvi.toFixed(1));
      }
    }
  } catch { /* UV tile simply stays hidden/omitted */ }

  hideBoot();
}

/* ---------------------------------------------------------------
   NUMBER COUNT-UP ANIMATION
--------------------------------------------------------------- */
function animateNumber(elNode, target, suffix = "°"){
  const start = 0;
  const duration = 900;
  const startTime = performance.now();
  function step(now){
    const p = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.round(start + (target - start) * eased);
    elNode.textContent = `${val}${suffix}`;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---------------------------------------------------------------
   ICON MAP + ANIMATED SVG STAGE
--------------------------------------------------------------- */
function classify(conditionMain, isNight){
  const c = conditionMain.toLowerCase();
  if (c.includes("thunderstorm")) return "thunderstorm";
  if (c.includes("drizzle")) return "drizzle";
  if (c.includes("rain")) return "rain";
  if (c.includes("snow")) return "snow";
  if (c.includes("mist") || c.includes("fog") || c.includes("haze")) return "mist";
  if (c.includes("cloud")) return isNight ? "cloudyNight" : "cloudy";
  return isNight ? "clearNight" : "sunny";
}

const EMOJI = {
  sunny:"☀️", cloudy:"⛅", clearNight:"🌙", cloudyNight:"☁️",
  rain:"🌧️", drizzle:"🌦️", snow:"❄️", mist:"🌫️", thunderstorm:"⛈️"
};

function renderIconStage(type){
  el.iconStage.innerHTML = `<div style="font-size:96px; text-align:center; filter:drop-shadow(0 6px 18px rgba(0,0,0,0.35));">${EMOJI[type] || "🌡️"}</div>`;
}

/* ---------------------------------------------------------------
   THEME + AMBIENT ANIMATIONS
--------------------------------------------------------------- */
const THEME = {
  sunny:      { g1:"#fbbf24", g2:"#f97316", glow:"rgba(255,196,0,0.55)", bg:["#0ea5e9","#38bdf8","#facc15","#fb923c"] },
  cloudy:     { g1:"#64748b", g2:"#94a3b8", glow:"rgba(148,163,184,0.45)", bg:["#334155","#475569","#64748b","#94a3b8"] },
  clearNight: { g1:"#1e293b", g2:"#0f172a", glow:"rgba(148,163,255,0.4)", bg:["#020617","#0f172a","#1e293b","#334155"] },
  cloudyNight:{ g1:"#111827", g2:"#1f2937", glow:"rgba(120,130,180,0.35)", bg:["#020617","#111827","#1f2937","#374151"] },
  rain:       { g1:"#0f172a", g2:"#1e3a8a", glow:"rgba(59,130,246,0.5)", bg:["#0f172a","#1e3a8a","#1d4ed8","#3b82f6"] },
  drizzle:    { g1:"#1e3a8a", g2:"#2563eb", glow:"rgba(56,189,248,0.45)", bg:["#0f172a","#1e40af","#2563eb","#60a5fa"] },
  snow:       { g1:"#e2e8f0", g2:"#f8fafc", glow:"rgba(255,255,255,0.55)", bg:["#334155","#64748b","#cbd5e1","#f1f5f9"] },
  mist:       { g1:"#94a3b8", g2:"#cbd5e1", glow:"rgba(203,213,225,0.4)", bg:["#334155","#475569","#94a3b8","#cbd5e1"] },
  thunderstorm:{g1:"#4c1d95", g2:"#7c3aed", glow:"rgba(124,58,237,0.6)", bg:["#020617","#1e1b4b","#4c1d95","#7c3aed"] }
};

function applyTheme(data){
  const sunrise = data.sys.sunrise * 1000, sunset = data.sys.sunset * 1000;
  const now = Date.now();
  const isNight = now < sunrise || now > sunset;
  const type = classify(data.weather[0].main, isNight);

  const t = THEME[type];
  document.body.style.setProperty("--bg-a", t.bg[0]);
  document.body.style.setProperty("--bg-b", t.bg[1]);
  document.body.style.setProperty("--bg-c", t.bg[2]);
  document.body.style.setProperty("--bg-d", t.bg[3]);
  document.body.style.setProperty("--accent-4", t.g1);
  document.body.style.setProperty("--accent-2", t.g2);
  document.body.style.setProperty("--glow-color", t.glow);
  el.card.style.setProperty("--glow", t.glow);
  el.card.style.boxShadow = `0 8px 32px rgba(0,0,0,0.45), 0 32px 64px rgba(0,0,0,0.35), 0 0 80px 10px ${t.glow}`;

  renderIconStage(type);
  buildAmbientAnimation(type);
}

function clearAnimations(){ el.animations.innerHTML = ""; }

function buildAmbientAnimation(type){
  clearAnimations();
  switch(type){
    case "sunny": createSun(); break;
    case "cloudy": createClouds(6); break;
    case "clearNight": createStars(60); createMoon(); break;
    case "cloudyNight": createStars(25); createMoon(); createClouds(5); break;
    case "rain": createClouds(3); createRain(180,false); break;
    case "drizzle": createClouds(3); createRain(100,true); break;
    case "snow": createClouds(3); createSnow(120); break;
    case "mist": createMist(); createClouds(3); break;
    case "thunderstorm": createClouds(5); createRain(220,false); createLightning(); break;
  }
}

function createSun(){
  const sun = document.createElement("div");
  sun.style.cssText = `position:absolute; top:10%; right:10%; width:80px; height:80px;
    background:radial-gradient(circle,#ffe97a 0%,#ffcc00 55%,rgba(255,200,0,0) 100%);
    border-radius:50%; animation:sunPulse 3s ease-in-out infinite; z-index:1;`;
  const rays = document.createElement("div");
  rays.style.cssText = `position:absolute; top:10%; right:10%; width:80px; height:80px; animation:rotateSun 12s linear infinite; z-index:1;`;
  for (let i=0;i<8;i++){
    const ray = document.createElement("div");
    const angle = (360/8)*i;
    ray.style.cssText = `position:absolute; top:50%; left:50%; width:4px; height:28px; margin-left:-2px;
      background:linear-gradient(to top, rgba(255,220,50,0.9), transparent); border-radius:2px;
      transform-origin:50% 0%; transform:rotate(${angle}deg) translateY(-56px);`;
    rays.appendChild(ray);
  }
  el.animations.appendChild(sun); el.animations.appendChild(rays);
}
function createClouds(count=6){
  for (let i=0;i<count;i++){
    const cloud = document.createElement("div");
    cloud.className = "cloud";
    const size = 70 + Math.random()*130;
    cloud.style.width = size+"px"; cloud.style.height = (size*0.6)+"px";
    cloud.style.top = (10+Math.random()*50)+"%"; cloud.style.left = Math.random()*100+"%";
    cloud.style.animationDuration = (25+Math.random()*35)+"s";
    cloud.style.animationDelay = "-"+(Math.random()*40)+"s";
    cloud.style.opacity = 0.5+Math.random()*0.35;
    el.animations.appendChild(cloud);
  }
}
function createRain(count=180, isDrizzle=false){
  for (let i=0;i<count;i++){
    const drop = document.createElement("div");
    drop.className = "drop";
    drop.style.left = Math.random()*100+"%";
    drop.style.height = (isDrizzle?25:50)+Math.random()*40+"px";
    drop.style.animationDuration = (isDrizzle?0.6:0.4)+Math.random()*0.6+"s";
    drop.style.animationDelay = Math.random()*2+"s";
    drop.style.opacity = isDrizzle?0.5:0.8;
    el.animations.appendChild(drop);
  }
}
function createSnow(count=120){
  const chars = ["❄","❅","❆"];
  for (let i=0;i<count;i++){
    const flake = document.createElement("div");
    flake.className = "snowflake";
    flake.textContent = chars[Math.floor(Math.random()*chars.length)];
    flake.style.left = Math.random()*100+"%";
    flake.style.fontSize = (12+Math.random()*18)+"px";
    flake.style.animationDuration = (6+Math.random()*8)+"s";
    flake.style.animationDelay = Math.random()*6+"s";
    flake.style.opacity = 0.7+Math.random()*0.3;
    el.animations.appendChild(flake);
  }
}
function createMist(){
  const layer = document.createElement("div");
  layer.className = "mist";
  el.animations.appendChild(layer);
}
function createLightning(){
  const flash = document.createElement("div");
  flash.className = "lightning-flash";
  el.animations.appendChild(flash);
}
function createStars(count=60){
  for (let i=0;i<count;i++){
    const star = document.createElement("div");
    star.className = "star";
    const size = 1+Math.random()*2;
    star.style.width = size+"px"; star.style.height = size+"px";
    star.style.top = Math.random()*70+"%"; star.style.left = Math.random()*100+"%";
    star.style.animationDuration = (2+Math.random()*3)+"s";
    star.style.animationDelay = Math.random()*3+"s";
    el.animations.appendChild(star);
  }
}
function createMoon(){
  const moon = document.createElement("div");
  moon.className = "moon";
  el.animations.appendChild(moon);
}

/* ---------------------------------------------------------------
   RENDER: CURRENT CONDITIONS
--------------------------------------------------------------- */
function fmtTime(unixSeconds){
  const d = new Date(unixSeconds*1000);
  let h = d.getHours(); const m = d.getMinutes();
  const ampm = h>=12?"PM":"AM"; h = h%12; if (h===0) h=12;
  return `${h}:${String(m).padStart(2,"0")} ${ampm}`;
}

function setDetailTile(key, value){
  const node = el.detailsGrid.querySelector(`[data-key="${key}"] .detail-value`);
  if (node) node.textContent = value;
}

function renderCurrent(data){
  animateNumber(el.temp, Math.round(data.main.temp));
  el.condition.textContent = data.weather[0].description
    .replace(/\b\w/g, c => c.toUpperCase());
  el.feelsLike.textContent = `Feels like ${Math.round(data.main.feels_like)}°`;
  el.city.textContent = `${data.name}, ${data.sys.country}`;

  const tiles = [
    { key:"humidity", icon:"💧", label:"Humidity", value:`${data.main.humidity}%` },
    { key:"wind", icon:"💨", label:"Wind", value:`${Math.round(data.wind.speed*3.6)} km/h` },
    { key:"pressure", icon:"🌡️", label:"Pressure", value:`${data.main.pressure} hPa` },
    { key:"visibility", icon:"👁️", label:"Visibility", value:`${(data.visibility/1000).toFixed(1)} km` },
    { key:"sunrise", icon:"🌅", label:"Sunrise", value:fmtTime(data.sys.sunrise) },
    { key:"sunset", icon:"🌇", label:"Sunset", value:fmtTime(data.sys.sunset) },
    { key:"minmax", icon:"🌡️", label:"Min / Max", value:`${Math.round(data.main.temp_min)}° / ${Math.round(data.main.temp_max)}°` },
    { key:"uvi", icon:"🔆", label:"UV Index", value:"—" }
  ];
  el.detailsGrid.innerHTML = "";
  tiles.forEach(t => {
    const tile = document.createElement("div");
    tile.className = "detail-tile";
    tile.dataset.key = t.key;
    tile.innerHTML = `<div class="detail-icon">${t.icon}</div>
      <div><div class="detail-label">${t.label}</div><div class="detail-value">${t.value}</div></div>`;
    el.detailsGrid.appendChild(tile);
  });
}

/* ---------------------------------------------------------------
   RENDER: AIR QUALITY
--------------------------------------------------------------- */
const AQI_LABELS = { 1:"Good", 2:"Fair", 3:"Moderate", 4:"Poor", 5:"Very Poor" };
function renderAQI(entry){
  const aqi = entry.main.aqi;
  el.aqiValue.textContent = aqi;
  el.aqiStatus.textContent = AQI_LABELS[aqi] || "—";
}

/* ---------------------------------------------------------------
   RENDER: HOURLY (from 3-hourly forecast list)
--------------------------------------------------------------- */
function renderHourly(list){
  el.hourlyScroll.innerHTML = "";
  list.slice(0, 8).forEach(item => {
    const d = new Date(item.dt*1000);
    let h = d.getHours(); const ampm = h>=12?"PM":"AM"; h = h%12; if (h===0) h=12;
    const type = classify(item.weather[0].main, false);
    const tile = document.createElement("div");
    tile.className = "hour-tile";
    tile.innerHTML = `<div class="h-time">${h}${ampm}</div>
      <div class="h-icon">${EMOJI[type]}</div>
      <div class="h-temp">${Math.round(item.main.temp)}°</div>`;
    el.hourlyScroll.appendChild(tile);
  });
}

/* ---------------------------------------------------------------
   RENDER: 5-DAY (group 3-hourly list by date)
--------------------------------------------------------------- */
function renderDaily(list){
  const days = {};
  list.forEach(item => {
    const date = new Date(item.dt*1000);
    const key = date.toDateString();
    if (!days[key]) days[key] = { temps:[], types:[], date };
    days[key].temps.push(item.main.temp);
    days[key].types.push(item.weather[0].main);
  });
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  el.dailyList.innerHTML = "";
  Object.values(days).slice(0,5).forEach(day => {
    const min = Math.round(Math.min(...day.temps));
    const max = Math.round(Math.max(...day.temps));
    const mid = day.types[Math.floor(day.types.length/2)];
    const type = classify(mid, false);
    const row = document.createElement("div");
    row.className = "day-row";
    row.innerHTML = `<div class="day-name">${dayNames[day.date.getDay()]}</div>
      <div class="day-icon">${EMOJI[type]}</div>
      <div class="day-temps"><span class="hi">${max}°</span><span class="lo">${min}°</span></div>`;
    el.dailyList.appendChild(row);
  });
}

/* ---------------------------------------------------------------
   BOOTSTRAP — geolocation first, Kathmandu fallback
--------------------------------------------------------------- */
window.addEventListener("load", () => {
  if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      pos => fetchByCoords(pos.coords.latitude, pos.coords.longitude, "Your location"),
      () => fetchByCity("Kathmandu"),
      { timeout: 6000 }
    );
  } else {
    fetchByCity("Kathmandu");
  }
});