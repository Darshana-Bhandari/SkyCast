const apikey="";
const apiurl="https://api.openweathermap.org/data/2.5/weather?q=germany&appid=01224752f6d7948fe5d5c12b31fee4e4&units=metric&q=bangalore";


const searchbox=document.querySelector(".search input");
consrt searchbtn=document.querySelector(".search button");
async function checkWeather(city){
    const response=await fetch(apiurl + city + '&appid=${apikey}');
    var data=await response.json();

    console.log(data);

    document.querySelector(".city").innerHTML=data.name;
    document.querySelector(".temp").innerHTML= Math.round(data.main.temp) + "°C";
    document.querySelector(".humidity").innerHTML=data.main.humidity + "%";
    document.querySelector(".wind").innerHTML=data.wind.speed + " km/h";

}

checkWeather();