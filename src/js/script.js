const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");
const buttonSearch = document.getElementById("btn");
const favorite = document.getElementById("favorites-section");
const title = document.getElementById("my-heading");
const forecast = document.getElementById("forecast-display");
const weatherpath = "593309284d3eb093ee96647eb294905b";
const searchInput = document.getElementById('search');
const resultsDiv = document.getElementById('search-results');

let isCelsius = localStorage.getItem("isCelsius") === "true";
let lastCity = "";

searchInput.addEventListener('input', async (e) => {
    const searchTerm = e.target.value.trim();
    resultsDiv.innerHTML = '';

    if (searchTerm.length === 0) {
        return;
    }

    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const searchUrl = `https://api.openweathermap.org/data/2.5/find?q=${encodedSearchTerm}&type=like&sort=population&cnt=5&appid=${weatherpath}`;

    try {
        const response = await fetch(searchUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.cod !== "200") {
            console.error('Error from API:', data.message);
            return;
        }
        displaySearchResults(data);
    }
    catch (error) {
        console.error('Error fetching search results:', error);
    }
});

function displaySearchResults(data) {
    if (!data || data.count === 0) {
        resultsDiv.innerHTML = '<div></div>';
        return;
    }

    resultsDiv.innerHTML = data.list.map(location =>
      `<div class="search-result-card" data-city-name="${location.name}">
            ${location.name}, ${location.sys.country}
        </div>`
    ).join('');

    document.querySelectorAll('.search-result-card').forEach(card => {
        card.addEventListener('click', function() {
            const cityName = this.getAttribute('data-city-name');
            getWeatherByLocation(cityName);
        });
    });
}

const url = (city) =>
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherpath}`;

async function getWeatherByLocation(city) {
    const humidityRainBtn = document.getElementById("humidity-rain-btn");
    const humidityRainDisplay = document.getElementById("humidity-rain-display");

    if (humidityRainDisplay.style.display !== 'none') {
        humidityRainDisplay.style.display = 'none';
        humidityRainBtn.textContent = `View Humidity For ${city}`;
    }

    lastCity = city;

    document.getElementById("forecast-display").classList.remove('hide');
    document.getElementById( "forecast-display" ).classList.add( 'show' );

    document.getElementById("forecast-btn").textContent = `View Forecast For ${city}`;
    document.getElementById("aqi-btn").textContent = `View Air Quality Index For ${city}`;

    const feelsLikeInfoDiv = document.getElementById("feels-like-info");
    const windInfoDiv = document.getElementById("wind-info");

    feelsLikeInfoDiv.style.display = 'none';
    windInfoDiv.style.display = 'none';

    const feelsLikeBtn = document.getElementById("feels-like-btn");
    feelsLikeBtn.textContent = `View Feels Like Info for ${city}`;

    const windInfoBtn = document.getElementById("wind-info-btn");
    windInfoBtn.textContent = `View Wind Info for ${city}`;

    windInfoBtn.style.display = "block";
    feelsLikeBtn.style.display = "block";

    const resp = await fetch(url(city), { origin: "cors" });
    const respData = await resp.json();

    if (respData.cod === "404") {
        displayCityNotFound(city);
        return;
    }

    if (respData.visibility !== undefined) {
        displayAirQuality(respData.coord.lat, respData.coord.lon, respData.visibility);
    }

    addWeatherToPage(respData);
    showRefreshButton(city);
    addWindInfoToPage(respData);
    addFeelsLikeToPage(respData);
}

async function displayAirQuality(lat, lon, visibility) {
    const aqiElement = document.getElementById("aqi-display");
    aqiElement.innerHTML = 'Loading...';
    aqiElement.style.display = 'block';

    const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${weatherpath}`;

    try {
        const response = await fetch(aqiUrl, { origin: "cors" });
        const aqiData = await response.json();
        const aqi = aqiData.list[0].main.aqi;
        const airQuality = convertAQIToQuality(aqi);

        const visibilityKm = (visibility / 1000).toFixed(1);
        aqiElement.innerHTML = `
            <h3 class="aqi-text aqi-${aqi}">Air Quality Index: ${aqi} (${airQuality})</h3>
            <h3 style="color: black">Visibility: ${visibilityKm} km</h3>`;
    }
    catch (error) {
        aqiElement.innerHTML = 'Error loading data.';
    }
}

function updateBrowserURL(name) {
    const nameSlug = createNameSlug(name);
    const newURL = window.location.protocol + "//" + window.location.host + window.location.pathname + '?query=' + nameSlug;
    window.history.replaceState({ path: newURL }, '', newURL);
}

function createNameSlug(name) {
    return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
}

function createAQIDisplayElement() {
    const aqiElement = document.createElement("div");
    aqiElement.id = "aqi-display";
    aqiElement.style.display = 'none';
    document.body.appendChild(aqiElement);
    return aqiElement;
}

function convertAQIToQuality(aqi) {
    if (aqi === 1) {
        return "Good";
    }
    else if (aqi === 2) {
        return "Fair";
    }
    else if (aqi === 3) {
        return "Moderate";
    }
    else if (aqi === 4) {
        return "Poor";
    }
    else if (aqi === 5) {
        return "Very Poor";
    }
    else {
        return "Unknown";
    }
}

function setBackground(condition, data) {
    let backgroundImage = '';
    let textColor = 'black';
    let favoriteColor = 'black';

    const currentTime = new Date().getTime() / 1000;
    const sunrise = data.sys.sunrise;
    const sunset = data.sys.sunset;

    if (condition === 'Clear' && (currentTime < sunrise || currentTime > sunset)) {
        backgroundImage = 'url(https://hoangsonww.github.io/WeatherMate-App/utils/night.jpg)';
        textColor = 'black';
        favoriteColor = 'black';
    }
    else {
        switch (condition) {
            case 'Clouds':
                backgroundImage = 'url(https://hoangsonww.github.io/WeatherMate-App/utils/cloudy.jpg)';
                textColor = 'black';
                favoriteColor = 'black';
                document.getElementById('my-heading').style.color = 'black';
                document.getElementById('home-label').style.color = 'black';
                document.getElementById('local-time-label').style.color = 'black';
                break;
            case 'Clear':
                backgroundImage = 'url(https://hoangsonww.github.io/WeatherMate-App/utils/clear.jpg)';
                document.getElementById('home-label').style.color = 'black';
                document.getElementById('local-time-label').style.color = 'black';
                break;
            case 'Rain':
                backgroundImage = 'url(https://hoangsonww.github.io/WeatherMate-App/utils/rainy.jpg)';
                document.getElementById('home-label').style.color = 'black';
                document.getElementById('local-time-label').style.color = 'black';
                break;
            case 'Drizzle':
                backgroundImage = 'url(https://hoangsonww.github.io/WeatherMate-App/utils/rainy.jpg)';
                document.getElementById('home-label').style.color = 'black';
                document.getElementById('local-time-label').style.color = 'black';
                break;
            case 'Snow':
                backgroundImage = 'url(https://hoangsonww.github.io/WeatherMate-App/utils/snowy.jpg)';
                document.getElementById('home-label').style.color = 'black';
                document.getElementById('local-time-label').style.color = 'black';
                break;
            case 'Thunderstorm':
                backgroundImage = 'url(https://hoangsonww.github.io/WeatherMate-App/utils/thunderstorm.jpg)';
                document.getElementById('home-label').style.color = 'black';
                document.getElementById('local-time-label').style.color = 'black';
                break;
            default:
                backgroundImage = 'url(https://hoangsonww.github.io/WeatherMate-App/utils/clouds.jpg)';
                document.getElementById('home-label').style.color = 'black';
                document.getElementById('local-time-label').style.color = 'black';
                break;
        }
    }

    document.body.style.backgroundImage = backgroundImage;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.color = textColor;
    title.style.color = textColor;
    favorite.style.color = favoriteColor;
    forecast.style.color = favoriteColor;
}

function displayCityNotFound(city) {
    alert(`No weather data found for ${city}. Please try again with another location. Be sure to check the spelling!`);
    document.getElementById("wind-info-btn").style.display = 'none';
    document.getElementById("feels-like-btn").style.display = 'none';
    document.getElementById("forecast-btn").style.display = 'none';
    document.getElementById("aqi-btn").style.display = 'none';
    document.getElementById("humidity-rain-btn").style.display = 'none';
}

function addWeatherToPage(data) {
    const temp = KtoUnit(data.main.temp);
    const unit = isCelsius ? "°C" : "°F";
    const lat = data.coord.lat;
    const lon = data.coord.lon;

    const weather = document.createElement("div");
    weather.classList.add("weather");

    weather.innerHTML = `
        <h2 style="margin-left: 20px">${data.name} 
            <button style="margin-left: 10px" id="favorite-btn">❤️ </button>
        </h2>
        <h2><img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" /> ${temp}${unit} <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" /></h2>
        <small>${data.weather[0].main}</small>
    `;

    setBackground(data.weather[0].main, data);

    main.innerHTML = "";
    main.appendChild(weather);

    document.getElementById("favorite-btn").addEventListener("click", function() {
        toggleFavoriteCity(data.name);
    });

    displayLocalTime(data.timezone);

    generateLocalAdvice(data);

    const forecastBtn = document.getElementById("forecast-btn");
    forecastBtn.setAttribute("data-lat", data.coord.lat);
    forecastBtn.setAttribute("data-lon", data.coord.lon);
    forecastBtn.setAttribute("data-city", data.name);
    forecastBtn.textContent = `View Forecast For ${data.name}`;
    forecastBtn.style.display = "block";

    const aqiBtn = document.getElementById("aqi-btn");
    aqiBtn.setAttribute("data-lat", data.coord.lat);
    aqiBtn.setAttribute("data-lon", data.coord.lon);
    aqiBtn.setAttribute("data-city", data.name);
    aqiBtn.textContent = `View Air Quality Index For ${data.name}`;
    aqiBtn.style.display = "block";

    if (!aqiBtn.getAttribute('listener')) {
        aqiBtn.addEventListener("click", toggleAQI);
        aqiBtn.setAttribute('listener', 'true');
    }

    const aqiDisplay = document.getElementById("aqi-display") || createAQIDisplayElement();
    aqiDisplay.innerHTML = '';
    aqiDisplay.style.display = 'none';

    const humidityRainBtn = document.getElementById("humidity-rain-btn");
    humidityRainBtn.setAttribute("data-lat", data.coord.lat);
    humidityRainBtn.setAttribute("data-lon", data.coord.lon);
    humidityRainBtn.setAttribute("data-city", data.name);
    humidityRainBtn.textContent = `View Humidity For ${data.name}`;
    humidityRainBtn.style.display = "block";

    if (!humidityRainBtn.getAttribute('listener')) {
        humidityRainBtn.addEventListener("click", toggleHumidityRain);
        humidityRainBtn.setAttribute('listener', 'true');
    }

    const windInfoBtn = document.getElementById("wind-info-btn");
    windInfoBtn.textContent = `View Wind Info for ${data.name}`;
    windInfoBtn.style.display = 'block';

    const feelsLikeBtn = document.getElementById("feels-like-btn");
    feelsLikeBtn.textContent = `View Feels Like Info for ${data.name}`;
    feelsLikeBtn.style.display = 'block';

    addWindInfoToPage(data);
    addFeelsLikeToPage(data);
    popupStatus = { forecast: false, aqi: false, humidityRain: false, windInfo: false, feelsLike: false };
}

async function displayHumidityRain(lat, lon, displayElement) {
    displayElement.innerHTML = 'Loading...';
    displayElement.style.display = 'block';

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherpath}`;
    const weatherResp = await fetch(weatherUrl);
    const weatherData = await weatherResp.json();
    const humidity = weatherData.main.humidity;

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherpath}`;
    const forecastResp = await fetch(forecastUrl);
    const forecastData = await forecastResp.json();
    const chanceOfRain = forecastData.list[0].pop;

    displayElement.innerHTML = `<h3>Humidity: ${humidity}%</h3><h3>Chance of Rain: ${(chanceOfRain * 100).toFixed(0)}%</h3>`;
    displayElement.style.display = 'block';
}

function displayLocalTime(timezoneOffset) {
    const utcDate = new Date();
    const utcTime = utcDate.getTime() + utcDate.getTimezoneOffset() * 60000;
    const localTime = new Date(utcTime + timezoneOffset * 1000);
    const formattedTime = localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let timeElement = document.getElementById("local-time");

    if (!timeElement) {
        timeElement = document.createElement("div");
        timeElement.id = "local-time";
        timeElement.classList.add("local-time");
        main.appendChild(timeElement);
    }

    timeElement.innerHTML = `<h3>Local Time: ${formattedTime}</h3>`;
}

async function getForecastByLocation(lat, lon) {
    const forecastDisplay = document.getElementById("forecast-display");
    forecastDisplay.innerHTML = 'Loading...';
    forecastDisplay.style.display = 'grid';

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherpath}`;

    try {
        const resp = await fetch(forecastUrl, { origin: "cors" });
        const respData = await resp.json();
        addForecastToPage(respData);
    }
    catch (error) {
        forecastDisplay.innerHTML = 'Error loading data.';
    }
}

function addForecastToPage(respData) {
    const forecastDisplay = document.getElementById("forecast-display");

    const unit = isCelsius ? "°C" : "°F";

    forecastDisplay.style.display = 'grid';

    forecastDisplay.innerHTML = "";

    const forecastList = respData.list.slice(0, 5);

    forecastList.forEach(item => {
        const temp = KtoUnit(item.main.temp);

        const forecastItem = document.createElement("div");
        forecastItem.classList.add("forecast-item");
        forecastItem.innerHTML = `
            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
            ${temp}${unit} - ${item.weather[0].main}
            <small>${new Date(item.dt * 1000).toLocaleTimeString()}</small>
        `;

        forecastDisplay.appendChild(forecastItem);
    });
}

function KtoUnit(K) {
    const userPrefersCelsius = localStorage.getItem("isCelsius") === "true";
    return userPrefersCelsius ? Math.floor(K - 273.15) : Math.floor((K - 273.15) * 9/5 + 32);
}

function toggleTemperatureUnit() {
    isCelsius = !isCelsius;
    localStorage.setItem("isCelsius", isCelsius);
    const button = document.getElementById("toggle-temp");
    button.textContent = isCelsius ? "Displaying in °C" : "Displaying in °F";
    updateTemperatures();
}

function updateTemperatures() {
    if (lastCity) {
        getWeatherByLocation(lastCity);
        const forecastBtn = document.getElementById("forecast-btn");
        if (forecastBtn.textContent.includes("Close Forecast")) {
            const lat = forecastBtn.getAttribute("data-lat");
            const lon = forecastBtn.getAttribute("data-lon");
            getForecastByLocation(lat, lon);
        }
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    displayFavorites();
    fetchWeatherForCurrentLocation();
    isCelsius = localStorage.getItem("isCelsius") === "true";
    updateTemperatureButton();
    updateTemperatures();
    showRefreshButton(lastCity);
});

function updateTemperatureButton() {
    const button = document.getElementById("toggle-temp");
    button.textContent = isCelsius ? "Displaying in °C" : "Displaying in °F";
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const city = search.value;

    if (city) {
        getWeatherByLocation(city);
    }

    updateBrowserURL(city);
});

buttonSearch.addEventListener("click", (e) => {
    e.preventDefault();

    const city = search.value;

    if (city) {
        getWeatherByLocation(city);
    }

    updateBrowserURL(city);
});

function closeAllPopups() {
    document.getElementById("forecast-display").style.display = 'none';
    document.getElementById("aqi-display").style.display = 'none';
    document.getElementById("humidity-rain-display").style.display = 'none';
    document.getElementById("wind-info").style.display = 'none';
    document.getElementById("feels-like-info").style.display = 'none';

    const forecastBtn = document.getElementById("forecast-btn");
    if (forecastBtn) forecastBtn.textContent = `View Forecast For ${forecastBtn.getAttribute("data-city")}`;

    const aqiBtn = document.getElementById("aqi-btn");
    if (aqiBtn) aqiBtn.textContent = `View Air Quality Index For ${aqiBtn.getAttribute("data-city")}`;

    const humidityRainBtn = document.getElementById("humidity-rain-btn");
    if (humidityRainBtn) humidityRainBtn.textContent = `View Humidity For ${humidityRainBtn.getAttribute("data-city")}`;

    const windInfoBtn = document.getElementById("wind-info-btn");
    if (windInfoBtn) windInfoBtn.textContent = `View Wind Info for ${windInfoBtn.getAttribute("data-city")}`;

    const capitalizedCity = capitalizeCityName(lastCity);
    const feelsLikeBtn = document.getElementById("feels-like-btn");
    if (feelsLikeBtn) feelsLikeBtn.textContent = `View Feels Like Info for ${capitalizedCity}`;
}

let popupStatus = {
    forecast: false,
    aqi: false,
    humidityRain: false,
    windInfo: false,
    feelsLike: false
};

function toggleForecast() {
    closeAllPopups();

    const forecastDisplay = document.getElementById("forecast-display");
    const forecastBtn = document.getElementById("forecast-btn");

    if (!popupStatus.forecast) {
        getForecastByLocation(forecastBtn.getAttribute("data-lat"), forecastBtn.getAttribute("data-lon")).then(() => {
            forecastDisplay.classList.add("open");
            forecastBtn.textContent = `Close Forecast For ${forecastBtn.getAttribute("data-city")}`;
            displaySunriseSunset(forecastBtn.getAttribute("data-lat"), forecastBtn.getAttribute("data-lon"));
        });
        popupStatus.forecast = true;
    }
    else {
        forecastDisplay.classList.remove("open");
        forecastBtn.textContent = `View Forecast For ${forecastBtn.getAttribute("data-city")}`;
        popupStatus.forecast = false;
    }

    popupStatus.aqi = false;
    popupStatus.humidityRain = false;
    popupStatus.windInfo = false;
    popupStatus.feelsLike = false;
}

function toggleAQI() {
    closeAllPopups();
    const aqiDisplay = document.getElementById("aqi-display");
    const aqiBtn = document.getElementById("aqi-btn");

    if (!popupStatus.aqi) {
        if (!aqiDisplay.hasChildNodes()) {
            displayAirQuality(aqiBtn.getAttribute("data-lat"), aqiBtn.getAttribute("data-lon"));
        }

        aqiDisplay.style.display = 'block';
        aqiBtn.textContent = `Close Air Quality Index For ${aqiBtn.getAttribute("data-city")}`;
        popupStatus.aqi = true;
    }
    else {
        aqiDisplay.style.display = 'none';
        aqiBtn.textContent = `View Air Quality Index For ${aqiBtn.getAttribute("data-city")}`;
        popupStatus.aqi = false;
    }

    popupStatus.forecast = false;
    popupStatus.humidityRain = false;
    popupStatus.windInfo = false;
    popupStatus.feelsLike = false;
}

function toggleHumidityRain() {
    closeAllPopups();
    const humidityRainDisplay = document.getElementById("humidity-rain-display");
    const humidityRainBtn = document.getElementById("humidity-rain-btn");

    if (!popupStatus.humidityRain) {
        displayHumidityRain(humidityRainBtn.getAttribute("data-lat"), humidityRainBtn.getAttribute("data-lon"), humidityRainDisplay);
        humidityRainBtn.textContent = `Close Humidity For ${humidityRainBtn.getAttribute("data-city")}`;
        popupStatus.humidityRain = true;
    }
    else {
        humidityRainDisplay.style.display = 'none';
        humidityRainBtn.textContent = `View Humidity For ${humidityRainBtn.getAttribute("data-city")}`;
        popupStatus.humidityRain = false;
    }

    popupStatus.forecast = false;
    popupStatus.aqi = false;
    popupStatus.windInfo = false;
    popupStatus.feelsLike = false;
}

function toggleWindInfo() {
    const windInfoDiv = document.getElementById("wind-info");
    const windInfoBtn = document.getElementById("wind-info-btn");

    closeAllPopups();

    if (!popupStatus.windInfo) {
        windInfoDiv.style.display = "block";
        windInfoBtn.textContent = `Close Wind Info for ${windInfoBtn.getAttribute("data-city")}`;
        popupStatus.windInfo = true;
    }
    else {
        windInfoDiv.style.display = "none";
        windInfoBtn.textContent = `View Wind Info for ${windInfoBtn.getAttribute("data-city")}`;
        popupStatus.windInfo = false;
    }
}

function toggleFeelsLikeInfo() {
    closeAllPopups();
    const feelsLikeInfoDiv = document.getElementById("feels-like-info");
    const feelsLikeBtn = document.getElementById("feels-like-btn");
    const capitalizedCity = capitalizeCityName(lastCity);

    if (!popupStatus.feelsLike) {
        feelsLikeInfoDiv.style.display = 'block';
        feelsLikeBtn.textContent = `Close Feels Like Info for ${capitalizedCity}`;
        popupStatus.feelsLike = true;
    }
    else {
        feelsLikeInfoDiv.style.display = 'none';
        feelsLikeBtn.textContent = `View Feels Like Info for ${capitalizedCity}`;
        popupStatus.feelsLike = false;
    }

    popupStatus.forecast = false;
    popupStatus.aqi = false;
    popupStatus.humidityRain = false;
    popupStatus.windInfo = false;
}

function capitalizeCityName(cityName) {
    return cityName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

function displaySunriseSunset(lat, lon) {
    const data = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherpath}`;

    fetch(data)
        .then(response => response.json())
        .then(data => {
            const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
            const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString();

            const sunriseElement = document.createElement("p");
            const sunsetElement = document.createElement("p");

            sunriseElement.textContent = `Sunrise: ${sunriseTime}`;
            sunsetElement.textContent = `Sunset: ${sunsetTime}`;

            sunsetElement.style.cursor = "pointer";
            sunriseElement.style.cursor = "pointer";

            sunsetElement.addEventListener("mouseenter", () => {
                sunsetElement.style.backgroundColor = "#dcdcdc";
            });
            sunsetElement.addEventListener("mouseleave", () => {
                sunsetElement.style.backgroundColor = "white";
            });

            sunriseElement.addEventListener("mouseenter", () => {
                sunriseElement.style.backgroundColor = "#dcdcdc";
            });
            sunriseElement.addEventListener("mouseleave", () => {
                sunriseElement.style.backgroundColor = "white";
            });

            const forecastDisplay = document.getElementById("forecast-display");
            forecastDisplay.appendChild(sunriseElement);
            forecastDisplay.appendChild(sunsetElement);
        }
    );
}

document.getElementById("forecast-btn").addEventListener("click", toggleForecast);
document.getElementById("aqi-btn").addEventListener("click", toggleAQI);
document.getElementById("humidity-rain-btn").addEventListener("click", toggleHumidityRain);
document.getElementById("wind-info-btn").addEventListener("click", toggleWindInfo);
document.getElementById("feels-like-btn").addEventListener("click", toggleFeelsLikeInfo);

const forecastBtn = document.getElementById("forecast-btn");
forecastBtn.addEventListener("click", toggleForecast);

function toggleFavoriteCity(city) {
    let favorites = getFavorites();

    if (favorites.includes(city)) {
        favorites = favorites.filter(favCity => favCity !== city);
    }
    else {
        favorites.push(city);
    }

    localStorage.setItem("favoriteCities", JSON.stringify(favorites));
    updateFavoriteButton(city);
    displayFavorites();
}

function getFavorites(){
    const favorites = localStorage.getItem("favoriteCities");
    return favorites ? JSON.parse(favorites) : [];
}

function updateFavoriteButton(city) {
    const favoriteBtn = document.getElementById("favorite-btn");

    if (getFavorites().includes(city)) {
        favoriteBtn.style.color = "red";
    } else {
        favoriteBtn.style.color = "grey";
    }
}

function displayFavorites() {
    const favoritesSection = document.getElementById("favorites-section");
    const favoritesList = document.createElement("div");
    const favorites = getFavorites();

    favoritesSection.innerHTML = "";
    favoritesList.style.borderRadius = "12px";

    if (favorites.length === 0) {
        favoritesSection.innerHTML = "<h3>No favorite cities added.</h3>";
        return;
    }

    favoritesList.innerHTML = "<h3>Favorite Cities:</h3>";

    favorites.forEach(city => {
        const cityElem = document.createElement("div");
        cityElem.style.borderRadius = "8px";

        const cityLink = document.createElement("span");
        cityLink.innerText = city;
        cityLink.style.cursor = "pointer";
        cityLink.style.textDecoration = "underline";
        cityLink.addEventListener("click", function() {
            getWeatherByLocation(city);
        });

        cityElem.appendChild(cityLink);

        const removeBtn = document.createElement("button");
        removeBtn.innerText = "Remove";
        removeBtn.style.font = "inherit";
        removeBtn.style.fontSize = "14px";
        removeBtn.onclick = function() { removeFavorite(city); };

        cityElem.appendChild(removeBtn);

        favoritesList.appendChild(cityElem);
    });

    favoritesSection.appendChild(favoritesList);
}

function removeFavorite(city) {
    const favorites = getFavorites().filter(favCity => favCity !== city);
    localStorage.setItem("favoriteCities", JSON.stringify(favorites));
    displayFavorites();
}

function generateLocalAdvice(weatherData) {
    const adviceElement = document.getElementById("local-advice");
    let advice;

    switch (weatherData.weather[0].main) {
        case "Rain":
            advice = "It's raining. Don't forget your umbrella and raincoat!";
            break;
        case "Clear":
            advice = "The sky is clear. Great day for outdoor activities!";
            break;
        case "Snow":
            advice = "Snowfall is expected. Stay warm and drive safely!";
            break;
        case "Thunderstorm":
            advice = "Thunderstorms in the forecast. Best to stay indoors if you can!";
            break;
        case "Drizzle":
            advice = "Light drizzle outside. A light jacket and a hat should suffice.";
            break;
        case "Clouds":
            advice = "It's cloudy. Good weather to enjoy a walk outside!";
            break;
        case "Mist":
            advice = "Misty weather. Drive carefully and keep your headlights on!";
            break;
        case "Smoke":
            advice = "Smoke detected. Stay indoors and keep windows closed!";
            break;
        case "Haze":
            advice = "Hazy weather. Wear sunglasses and stay hydrated!";
            break;
        case "Dust":
            advice = "Dusty winds are blowing. Protect your eyes and skin!";
            break;
        case "Fog":
            advice = "Visibility might be low due to mist. Take care when driving!";
            break;
        case "Sand":
            advice = "Sandy winds are expected. Protect your eyes and skin.";
            break;
        case "Ash":
            advice = "Volcanic ash detected. Wear masks and avoid outdoor activities.";
            break;
        case "Squall":
            advice = "Sudden squalls could occur. Secure loose objects and be cautious if outside.";
            break;
        case "Tornado":
            advice = "Tornado alert! Seek shelter immediately and stay informed.";
            break;
        default:
            advice = "Enjoy your day and stay weather aware!";
            break;
    }

    adviceElement.textContent = advice || "Choose a city to get weather advice!";
}

const chatMessagesElem = document.querySelector(".chat-messages");
const chatInputElem = document.querySelector(".chat-input");
chatMessagesElem.style.display = "none";
chatInputElem.style.display = "none";

function fetchWeatherForCurrentLocation() {
    const locationWeatherUI = document.getElementById("current-location-weather");
    locationWeatherUI.textContent = "Loading Weather...";
    locationWeatherUI.style.color = 'black';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPositionWeather, handleLocationError);
    }
    else {
        updateLocationWeatherUI("Geolocation is not supported by your browser.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchWeatherForCurrentLocation();
});

function showPositionWeather(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    getWeatherByLocationCoords(lat, lon);
}

function showRefreshButton(city) {
    const refreshButton = document.getElementById('refresh-weather');

    if (city) {
        refreshButton.style.display = 'block';
        refreshButton.onclick = function() {
            getWeatherByLocation(city);
        };
    }
    else {
        refreshButton.style.display = 'none';
    }
}

function handleLocationError(error) {
    let message = "An error occurred while retrieving your location.";

    if (error.code === error.PERMISSION_DENIED) {
        message = "Enable location access then reload to view live weather in your area!";
    }

    updateLocationWeatherUI(message);
}

function updateLocationWeatherUI(message) {
    const locationWeatherUI = document.getElementById("current-location-weather");
    locationWeatherUI.textContent = message;
    locationWeatherUI.style.color = 'black';
}

fetchWeatherForCurrentLocation();

async function getWeatherByLocationCoords(lat, lon) {
    const dataUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherpath}`;

    try {
        const response = await fetch(dataUrl);
        const data = await response.json();

        if (data.cod === 200) {
            addWeatherToPageByCoords(data);
        }
        else {
            updateLocationWeatherUI(`Weather data not found for your location.`);
        }
    }
    catch (error) {
        updateLocationWeatherUI(`Unable to retrieve weather data: ${error.message}`);
    }
}

document.getElementById("toggle-temp").addEventListener("click", () => {
    fetchWeatherForCurrentLocation();
});

function addWeatherToPageByCoords(data) {
    const locationWeatherContainer = document.getElementById("current-location-weather");
    locationWeatherContainer.innerHTML = '';

    const temp = KtoUnit(data.main.temp);
    const unit = isCelsius ? "°C" : "°F";
    const weatherDescription = data.weather[0].description;
    const weatherIcon = data.weather[0].icon;
    const locationName = data.name;

    const weatherElement = document.createElement('div');
    weatherElement.classList.add('weather');
    weatherElement.innerHTML = `
        <h5 style="margin-bottom: -10px">Weather in Your Location</h5>
        <h5 style="margin-bottom: -10px">${locationName}</h5>
        <h6>${temp}${unit}, ${weatherDescription}</h6>
        <img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="${weatherDescription}" />
    `;

    locationWeatherContainer.appendChild(weatherElement);
}

function updateLocalTime() {
    const timeContainer = document.getElementById("local-time-container");
    const now = new Date();
    const timeParts = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).split(' ');

    timeContainer.innerHTML = '';

    const timeDiv = document.createElement('div');
    timeDiv.textContent = timeParts[0];
    timeContainer.appendChild(timeDiv);

    const amPmDiv = document.createElement('div');
    amPmDiv.textContent = timeParts[1];
    timeContainer.appendChild(amPmDiv);
    timeContainer.style.color = 'black';
    setTimeout(updateLocalTime, 60000);
}

updateLocalTime();

document.getElementById("wind-info-btn").addEventListener("click", toggleWindInfo);

function addWindInfoToPage(data) {
    if (data.wind && data.wind.speed !== undefined) {
        const windSpeedElement = document.getElementById("wind-speed");
        const windSpeedKmH = (data.wind.speed * 3.6).toFixed(1);
        windSpeedElement.textContent = `Speed: ${windSpeedKmH} km/h`;

        const windDirectionElement = document.getElementById("wind-direction");
        windDirectionElement.textContent = `Direction: ${getWindDirection(data.wind.deg)}`;

        const pressureElement = document.getElementById("wind-pressure");
        pressureElement.textContent = `Pressure: ${data.main.pressure} hPa`;

        const windInfoBtn = document.getElementById("wind-info-btn");
        windInfoBtn.setAttribute("data-city", data.name);
    }
    else {
        const windInfoDiv = document.getElementById("wind-info");
        windInfoDiv.textContent = "Wind data not available for this location.";
    }
}

function getWindDirection(degree) {
    const directions = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"];
    const index = Math.round(((degree %= 360) < 0 ? degree + 360 : degree) / 45) % 8;
    return directions[index];
}

document.getElementById("feels-like-btn").addEventListener("click", toggleFeelsLikeInfo);

function addFeelsLikeToPage(data) {
    const feelsLikeTempElement = document.getElementById("feels-like-temp");
    let feelsLikeTemp = isCelsius ? (data.main.feels_like - 273.15).toFixed(1) + ' °C' : ((data.main.feels_like - 273.15) * 9/5 + 32).toFixed(1) + ' °F';
    feelsLikeTempElement.textContent = `Feels Like: ${feelsLikeTemp}`;

    const minTemp = isCelsius ? (data.main.temp_min - 273.15).toFixed(1) + ' °C' : ((data.main.temp_min - 273.15) * 9/5 + 32).toFixed(1) + ' °F';
    const maxTemp = isCelsius ? (data.main.temp_max - 273.15).toFixed(1) + ' °C' : ((data.main.temp_max - 273.15) * 9/5 + 32).toFixed(1) + ' °F';

    const minTempElement = document.getElementById("min-temp");
    const maxTempElement = document.getElementById("max-temp");

    minTempElement.textContent = `Min Temperature: ${minTemp}`;
    maxTempElement.textContent = `Max Temperature: ${maxTemp}`;
}
