const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const buttonSearch = document.getElementById('btn');
const favorite = document.getElementById('favorites-section');
const title = document.getElementById('my-heading');
const forecast = document.getElementById('forecast-display');
const weatherpath = getWeatherPath();
const searchInput = document.getElementById('search');
const resultsDiv = document.getElementById('search-results');

let isCelsius = localStorage.getItem('isCelsius') === 'true';
let lastCity = '';

searchInput.addEventListener('input', async e => {
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

    if (data.cod !== '200') {
      console.error('Error from API:', data.message);
      return;
    }
    displaySearchResults(data);
  } catch (error) {
    console.error('Error fetching search results:', error);
  }
});

function displaySearchResults(data) {
  if (!data || data.count === 0) {
    resultsDiv.innerHTML = '<div></div>';
    return;
  }

  resultsDiv.innerHTML = data.list
    .map(
      location =>
        `<div class="search-result-card" data-city-name="${location.name}">
            ${location.name}, ${location.sys.country}
        </div>`
    )
    .join('');

  document.querySelectorAll('.search-result-card').forEach(card => {
    card.addEventListener('click', function () {
      const cityName = this.getAttribute('data-city-name');
      // Trigger the weather lookup
      getWeatherByLocation(cityName);
      // Close/hide the results div when a result is clicked
      resultsDiv.innerHTML = '';
    });
  });
}

const url = city => `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherpath}`;

function getWeatherPath() {
  const keyArray = [
    53, 57, 51, 51, 48, 57, 50, 56, 52, 100, 51, 101, 98, 48, 57, 51, 101, 101, 57, 54, 54, 52, 55, 101, 98, 50, 57, 52, 57, 48, 53, 98,
  ];
  return keyArray.map(charCode => String.fromCharCode(charCode)).join('');
}

async function getWeatherByLocation(city) {
  const humidityRainBtn = document.getElementById('humidity-rain-btn');
  const humidityRainDisplay = document.getElementById('humidity-rain-display');

  if (humidityRainDisplay.style.display !== 'none') {
    humidityRainDisplay.style.display = 'none';
    humidityRainBtn.textContent = `View Humidity For ${city}`;
  }

  lastCity = city;

  document.getElementById('forecast-display').classList.remove('hide');
  document.getElementById('forecast-display').classList.add('show');

  document.getElementById('forecast-btn').textContent = `View Forecast For ${city}`;
  document.getElementById('aqi-btn').textContent = `View Air Quality Index For ${city}`;

  const feelsLikeInfoDiv = document.getElementById('feels-like-info');
  const windInfoDiv = document.getElementById('wind-info');

  feelsLikeInfoDiv.style.display = 'none';
  windInfoDiv.style.display = 'none';

  const feelsLikeBtn = document.getElementById('feels-like-btn');
  feelsLikeBtn.textContent = `View Feels Like Info for ${city}`;

  const windInfoBtn = document.getElementById('wind-info-btn');
  windInfoBtn.textContent = `View Wind Info for ${city}`;

  windInfoBtn.style.display = 'block';
  feelsLikeBtn.style.display = 'block';

  const resp = await fetch(url(city), { origin: 'cors' });
  const respData = await resp.json();

  if (respData.cod === '404') {
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
  const aqiElement = document.getElementById('aqi-display');
  aqiElement.innerHTML = 'Loading...';
  aqiElement.style.display = 'block';

  const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${weatherpath}`;

  try {
    const response = await fetch(aqiUrl, { origin: 'cors' });
    const aqiData = await response.json();
    const aqi = aqiData.list[0].main.aqi;
    const airQuality = convertAQIToQuality(aqi);

    // Determine the color based on the AQI level
    let aqiColor;
    switch (aqi) {
    case 1: // Good
      aqiColor = 'green';
      break;
    case 2: // Fair
      aqiColor = 'yellowgreen';
      break;
    case 3: // Moderate
      aqiColor = 'orange';
      break;
    case 4: // Poor
      aqiColor = 'orangered';
      break;
    case 5: // Very Poor
      aqiColor = 'red';
      break;
    default:
      aqiColor = 'gray';
    }

    // Create a simple progress bar for AQI.
    // Since AQI ranges from 1 to 5, we map that to a percentage.
    const aqiProgressPercent = (aqi / 5) * 100;
    const aqiBar = `
      <div style="background-color:#eee; width:100%; height:10px; border-radius:5px; margin: 5px 0;">
        <div style="background-color:${aqiColor}; width:${aqiProgressPercent}%; height:100%; border-radius:5px;"></div>
      </div>
    `;

    // For visibility, convert from meters to kilometers
    const visKm = visibility / 1000;

    // Determine a maximum visibility for the progress bar.
    // Many locations often report up to 10km in urban areas; adjust as needed.
    const maxVisibility = 10;
    const visProgressPercent = Math.min((visKm / maxVisibility) * 100, 100);

    // Set a color based on visibility thresholds:
    // less than 3 km: red, 3 to 7 km: orange, 7 km and above: green.
    let visibilityColor;
    if (visKm < 3) {
      visibilityColor = 'red';
    } else if (visKm < 7) {
      visibilityColor = 'orange';
    } else {
      visibilityColor = 'green';
    }

    // Create a simple progress bar for visibility.
    const visibilityBar = `
      <div style="background-color:#eee; width:100%; height:10px; border-radius:5px; margin: 5px 0;">
        <div style="background-color:${visibilityColor}; width:${visProgressPercent}%; height:100%; border-radius:5px;"></div>
      </div>
    `;

    aqiElement.innerHTML = `
      <h3 class="aqi-text" style="color:${aqiColor};">
        Air Quality Index: ${aqi} (${airQuality})
      </h3>
      ${aqiBar}
      <h3 style="color: black">Visibility: <span style="color: ${visibilityColor}">${visKm.toFixed(1)} km</span></h3>
      ${visibilityBar}
    `;
  } catch (error) {
    aqiElement.innerHTML = 'Error loading data.';
  }
}

function updateBrowserURL(name) {
  const nameSlug = createNameSlug(name);
  const newURL = window.location.protocol + '//' + window.location.host + window.location.pathname + '?query=' + nameSlug;
  window.history.replaceState({ path: newURL }, '', newURL);
}

function createNameSlug(name) {
  return name
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]/g, '');
}

function createAQIDisplayElement() {
  const aqiElement = document.createElement('div');
  aqiElement.id = 'aqi-display';
  aqiElement.style.display = 'none';
  document.body.appendChild(aqiElement);
  return aqiElement;
}

function convertAQIToQuality(aqi) {
  if (aqi === 1) {
    return 'Good';
  } else if (aqi === 2) {
    return 'Fair';
  } else if (aqi === 3) {
    return 'Moderate';
  } else if (aqi === 4) {
    return 'Poor';
  } else if (aqi === 5) {
    return 'Very Poor';
  } else {
    return 'Unknown';
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
  } else {
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
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
  document.body.style.backgroundRepeat = 'no-repeat';
  document.body.style.color = textColor;
  title.style.color = textColor;
  favorite.style.color = favoriteColor;
  forecast.style.color = favoriteColor;
}

function displayCityNotFound(city) {
  alert(`No weather data found for ${city}. Please try again with another location. Be sure to check the spelling!`);
  document.getElementById('wind-info-btn').style.display = 'none';
  document.getElementById('feels-like-btn').style.display = 'none';
  document.getElementById('forecast-btn').style.display = 'none';
  document.getElementById('aqi-btn').style.display = 'none';
  document.getElementById('humidity-rain-btn').style.display = 'none';
}

function addWeatherToPage(data) {
  const temp = KtoUnit(data.main.temp);
  const unit = isCelsius ? '°C' : '°F';
  const lat = data.coord.lat;
  const lon = data.coord.lon;

  const weather = document.createElement('div');
  weather.classList.add('weather');

  weather.innerHTML = `
        <h2 style="margin-left: 20px">${data.name} 
            <button style="margin-left: 10px" id="favorite-btn">❤️ </button>
        </h2>
        <h2><img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" /> ${temp}${unit} <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" /></h2>
        <small>${data.weather[0].main}</small>
    `;

  setBackground(data.weather[0].main, data);

  main.innerHTML = '';
  main.appendChild(weather);

  document.getElementById('favorite-btn').addEventListener('click', function () {
    toggleFavoriteCity(data.name);
  });

  displayLocalTime(data.timezone);

  generateLocalAdvice(data);

  const forecastBtn = document.getElementById('forecast-btn');
  forecastBtn.setAttribute('data-lat', data.coord.lat);
  forecastBtn.setAttribute('data-lon', data.coord.lon);
  forecastBtn.setAttribute('data-city', data.name);
  forecastBtn.textContent = `View Forecast For ${data.name}`;
  forecastBtn.style.display = 'block';

  const aqiBtn = document.getElementById('aqi-btn');
  aqiBtn.setAttribute('data-lat', data.coord.lat);
  aqiBtn.setAttribute('data-lon', data.coord.lon);
  aqiBtn.setAttribute('data-city', data.name);
  aqiBtn.textContent = `View Air Quality Index For ${data.name}`;
  aqiBtn.style.display = 'block';

  if (!aqiBtn.getAttribute('listener')) {
    aqiBtn.addEventListener('click', toggleAQI);
    aqiBtn.setAttribute('listener', 'true');
  }

  const aqiDisplay = document.getElementById('aqi-display') || createAQIDisplayElement();
  aqiDisplay.innerHTML = '';
  aqiDisplay.style.display = 'none';

  const humidityRainBtn = document.getElementById('humidity-rain-btn');
  humidityRainBtn.setAttribute('data-lat', data.coord.lat);
  humidityRainBtn.setAttribute('data-lon', data.coord.lon);
  humidityRainBtn.setAttribute('data-city', data.name);
  humidityRainBtn.textContent = `View Humidity For ${data.name}`;
  humidityRainBtn.style.display = 'block';

  if (!humidityRainBtn.getAttribute('listener')) {
    humidityRainBtn.addEventListener('click', toggleHumidityRain);
    humidityRainBtn.setAttribute('listener', 'true');
  }

  const windInfoBtn = document.getElementById('wind-info-btn');
  windInfoBtn.textContent = `View Wind Info for ${data.name}`;
  windInfoBtn.style.display = 'block';

  const feelsLikeBtn = document.getElementById('feels-like-btn');
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
  const chanceOfRain = forecastData.list[0].pop; // This is a value between 0 and 1
  const rainPercentage = chanceOfRain * 100;

  // Determine colors based on thresholds
  // For humidity: <30% is good (green), 30-70% is moderate (orange), >70% is high (red)
  let humidityColor = humidity < 30 ? 'green' : humidity < 70 ? 'orange' : 'red';

  // For chance of rain: <30% green, 30-70% orange, >70% red
  let rainColor = rainPercentage < 30 ? 'green' : rainPercentage < 70 ? 'orange' : 'red';

  // Create simple progress bars as visual indicators
  const humidityBar = `
    <div style="background-color:#eee; width:100%; height:10px; border-radius:5px; margin: 5px 0;">
      <div style="background-color:${humidityColor}; width:${humidity}%; height:100%; border-radius:5px;"></div>
    </div>
  `;
  const rainBar = `
    <div style="background-color:#eee; width:100%; height:10px; border-radius:5px; margin: 5px 0;">
      <div style="background-color:${rainColor}; width:${rainPercentage}%; height:100%; border-radius:5px;"></div>
    </div>
  `;

  // Set the innerHTML with both the text and the visual indicators
  displayElement.innerHTML = `
    <h3>
      Humidity: <span style="color:${humidityColor};">${humidity}%</span>
    </h3>
    ${humidityBar}
    <h3>
      Chance of Rain: <span style="color:${rainColor};">${rainPercentage.toFixed(0)}%</span>
    </h3>
    ${rainBar}
  `;
  displayElement.style.display = 'block';
}

function displayLocalTime(timezoneOffset) {
  // Create or get the local time element
  let timeElement = document.getElementById('local-time');
  if (!timeElement) {
    timeElement = document.createElement('div');
    timeElement.id = 'local-time';
    timeElement.classList.add('local-time');
    main.appendChild(timeElement);
  }

  // Function to update the local time
  function updateTime() {
    const utcDate = new Date();
    const utcTime = utcDate.getTime() + utcDate.getTimezoneOffset() * 60000;
    const localTime = new Date(utcTime + timezoneOffset * 1000);

    // Format the local time including seconds
    const formattedTime = localTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    timeElement.innerHTML = `<h3>Local Time: ${formattedTime}</h3>`;
  }

  // Update immediately, then every 1 second
  updateTime();
  setInterval(updateTime, 1000);
}

async function getForecastByLocation(lat, lon) {
  const forecastDisplay = document.getElementById('forecast-display');
  forecastDisplay.innerHTML = 'Loading...';
  forecastDisplay.style.display = 'grid';

  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherpath}`;

  try {
    const resp = await fetch(forecastUrl, { origin: 'cors' });
    const respData = await resp.json();
    addForecastToPage(respData);
  } catch (error) {
    forecastDisplay.innerHTML = 'Error loading data.';
  }
}

function addForecastToPage(respData) {
  const forecastDisplay = document.getElementById('forecast-display');
  const unit = isCelsius ? '°C' : '°F';

  // Show the forecast container (and the chart within it)
  forecastDisplay.style.display = 'grid';

  // Clear any previous forecast content (including any old canvas/chart)
  forecastDisplay.innerHTML = '';

  // Get the first 5 forecast items
  const forecastList = respData.list.slice(0, 5);

  // Arrays to hold data for the chart
  const chartLabels = [];
  const chartData = [];

  // Create forecast items and fill the chart data arrays
  forecastList.forEach(item => {
    const temp = KtoUnit(item.main.temp);
    const timeLabel = new Date(item.dt * 1000).toLocaleTimeString();
    chartLabels.push(timeLabel);
    chartData.push(temp);

    // Create a div for the forecast item
    const forecastItem = document.createElement('div');
    forecastItem.classList.add('forecast-item');
    forecastItem.innerHTML = `
      <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
      ${temp}${unit} - ${item.weather[0].main}
      <small>${timeLabel}</small>
    `;

    forecastDisplay.appendChild(forecastItem);
  });

  // Create a canvas element for the chart
  const canvas = document.createElement('canvas');
  canvas.id = 'forecast-chart';
  // Optionally, you can set a fixed size for the canvas:
  // canvas.width = 400;
  // canvas.height = 200;
  forecastDisplay.appendChild(canvas);

  // Create the chart using Chart.js
  const ctx = canvas.getContext('2d');

  // If you want to ensure that any previous Chart instance is removed before creating a new one,
  // you could store it in a variable and call .destroy() on it. For simplicity, this snippet creates a new chart.
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: [{
        label: `Temperature (${unit})`,
        data: chartData,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value) {
              return value + unit;
            }
          }
        }
      }
    }
  });
}

function KtoUnit(K) {
  const userPrefersCelsius = localStorage.getItem('isCelsius') === 'true';
  return userPrefersCelsius ? Math.floor(K - 273.15) : Math.floor(((K - 273.15) * 9) / 5 + 32);
}

function toggleTemperatureUnit() {
  isCelsius = !isCelsius;
  localStorage.setItem('isCelsius', isCelsius);
  const button = document.getElementById('toggle-temp');
  button.textContent = isCelsius ? 'Displaying in °C' : 'Displaying in °F';
  updateTemperatures();
}

function updateTemperatures() {
  if (lastCity) {
    getWeatherByLocation(lastCity);
    if (popupStatus.forecast === true) {
      toggleForecast();
    }
  }
}

document.addEventListener('DOMContentLoaded', event => {
  displayFavorites();
  fetchWeatherForCurrentLocation();
  isCelsius = localStorage.getItem('isCelsius') === 'true';
  updateTemperatureButton();
  updateTemperatures();
  showRefreshButton(lastCity);
});

function updateTemperatureButton() {
  const button = document.getElementById('toggle-temp');
  button.textContent = isCelsius ? 'Displaying in °C' : 'Displaying in °F';
}

form.addEventListener('submit', e => {
  e.preventDefault();

  const city = search.value;

  if (city) {
    getWeatherByLocation(city);
  }

  updateBrowserURL(city);
});

buttonSearch.addEventListener('click', e => {
  e.preventDefault();

  const city = search.value;

  if (city) {
    getWeatherByLocation(city);
  }

  updateBrowserURL(city);
});

function closeAllPopups() {
  document.getElementById('forecast-display').style.display = 'none';
  document.getElementById('aqi-display').style.display = 'none';
  document.getElementById('humidity-rain-display').style.display = 'none';
  document.getElementById('wind-info').style.display = 'none';
  document.getElementById('feels-like-info').style.display = 'none';

  const forecastBtn = document.getElementById('forecast-btn');
  if (forecastBtn) forecastBtn.textContent = `View Forecast For ${forecastBtn.getAttribute('data-city')}`;

  const aqiBtn = document.getElementById('aqi-btn');
  if (aqiBtn) aqiBtn.textContent = `View Air Quality Index For ${aqiBtn.getAttribute('data-city')}`;

  const humidityRainBtn = document.getElementById('humidity-rain-btn');
  if (humidityRainBtn) humidityRainBtn.textContent = `View Humidity For ${humidityRainBtn.getAttribute('data-city')}`;

  const windInfoBtn = document.getElementById('wind-info-btn');
  if (windInfoBtn) windInfoBtn.textContent = `View Wind Info for ${windInfoBtn.getAttribute('data-city')}`;

  const capitalizedCity = capitalizeCityName(lastCity);
  const feelsLikeBtn = document.getElementById('feels-like-btn');
  if (feelsLikeBtn) feelsLikeBtn.textContent = `View Feels Like Info for ${capitalizedCity}`;
}

let popupStatus = {
  forecast: false,
  aqi: false,
  humidityRain: false,
  windInfo: false,
  feelsLike: false,
};

function toggleForecast() {
  closeAllPopups();

  const forecastDisplay = document.getElementById('forecast-display');
  const forecastBtn = document.getElementById('forecast-btn');

  if (!popupStatus.forecast) {
    getForecastByLocation(forecastBtn.getAttribute('data-lat'), forecastBtn.getAttribute('data-lon')).then(() => {
      forecastDisplay.classList.add('open');
      forecastBtn.textContent = `Close Forecast For ${forecastBtn.getAttribute('data-city')}`;
      displaySunriseSunset(forecastBtn.getAttribute('data-lat'), forecastBtn.getAttribute('data-lon'));
    });
    popupStatus.forecast = true;
  } else {
    forecastDisplay.classList.remove('open');
    forecastBtn.textContent = `View Forecast For ${forecastBtn.getAttribute('data-city')}`;
    popupStatus.forecast = false;
  }

  popupStatus.aqi = false;
  popupStatus.humidityRain = false;
  popupStatus.windInfo = false;
  popupStatus.feelsLike = false;
}

function toggleAQI() {
  closeAllPopups();
  const aqiDisplay = document.getElementById('aqi-display');
  const aqiBtn = document.getElementById('aqi-btn');

  if (!popupStatus.aqi) {
    if (!aqiDisplay.hasChildNodes()) {
      displayAirQuality(aqiBtn.getAttribute('data-lat'), aqiBtn.getAttribute('data-lon'));
    }

    aqiDisplay.style.display = 'block';
    aqiBtn.textContent = `Close Air Quality Index For ${aqiBtn.getAttribute('data-city')}`;
    popupStatus.aqi = true;
  } else {
    aqiDisplay.style.display = 'none';
    aqiBtn.textContent = `View Air Quality Index For ${aqiBtn.getAttribute('data-city')}`;
    popupStatus.aqi = false;
  }

  popupStatus.forecast = false;
  popupStatus.humidityRain = false;
  popupStatus.windInfo = false;
  popupStatus.feelsLike = false;
}

function toggleHumidityRain() {
  closeAllPopups();
  const humidityRainDisplay = document.getElementById('humidity-rain-display');
  const humidityRainBtn = document.getElementById('humidity-rain-btn');

  if (!popupStatus.humidityRain) {
    displayHumidityRain(humidityRainBtn.getAttribute('data-lat'), humidityRainBtn.getAttribute('data-lon'), humidityRainDisplay);
    humidityRainBtn.textContent = `Close Humidity For ${humidityRainBtn.getAttribute('data-city')}`;
    popupStatus.humidityRain = true;
  } else {
    humidityRainDisplay.style.display = 'none';
    humidityRainBtn.textContent = `View Humidity For ${humidityRainBtn.getAttribute('data-city')}`;
    popupStatus.humidityRain = false;
  }

  popupStatus.forecast = false;
  popupStatus.aqi = false;
  popupStatus.windInfo = false;
  popupStatus.feelsLike = false;
}

function toggleWindInfo() {
  const windInfoDiv = document.getElementById('wind-info');
  const windInfoBtn = document.getElementById('wind-info-btn');

  closeAllPopups();

  if (!popupStatus.windInfo) {
    windInfoDiv.style.display = 'block';
    windInfoBtn.textContent = `Close Wind Info for ${windInfoBtn.getAttribute('data-city')}`;
    popupStatus.windInfo = true;
  } else {
    windInfoDiv.style.display = 'none';
    windInfoBtn.textContent = `View Wind Info for ${windInfoBtn.getAttribute('data-city')}`;
    popupStatus.windInfo = false;
  }
}

function toggleFeelsLikeInfo() {
  closeAllPopups();
  const feelsLikeInfoDiv = document.getElementById('feels-like-info');
  const feelsLikeBtn = document.getElementById('feels-like-btn');
  const capitalizedCity = capitalizeCityName(lastCity);

  if (!popupStatus.feelsLike) {
    feelsLikeInfoDiv.style.display = 'block';
    feelsLikeBtn.textContent = `Close Feels Like Info for ${capitalizedCity}`;
    popupStatus.feelsLike = true;
  } else {
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
  return cityName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function displaySunriseSunset(lat, lon) {
  const data = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherpath}`;

  fetch(data)
    .then(response => response.json())
    .then(data => {
      const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
      const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString();

      const sunriseElement = document.createElement('p');
      const sunsetElement = document.createElement('p');

      sunriseElement.textContent = `Sunrise: ${sunriseTime}`;
      sunsetElement.textContent = `Sunset: ${sunsetTime}`;

      sunsetElement.style.cursor = 'pointer';
      sunriseElement.style.cursor = 'pointer';

      sunsetElement.addEventListener('mouseenter', () => {
        sunsetElement.style.backgroundColor = '#dcdcdc';
      });
      sunsetElement.addEventListener('mouseleave', () => {
        sunsetElement.style.backgroundColor = 'white';
      });

      sunriseElement.addEventListener('mouseenter', () => {
        sunriseElement.style.backgroundColor = '#dcdcdc';
      });
      sunriseElement.addEventListener('mouseleave', () => {
        sunriseElement.style.backgroundColor = 'white';
      });

      const forecastDisplay = document.getElementById('forecast-display');
      forecastDisplay.appendChild(sunriseElement);
      forecastDisplay.appendChild(sunsetElement);
    });
}

document.getElementById('forecast-btn').addEventListener('click', toggleForecast);
document.getElementById('aqi-btn').addEventListener('click', toggleAQI);
document.getElementById('humidity-rain-btn').addEventListener('click', toggleHumidityRain);
document.getElementById('wind-info-btn').addEventListener('click', toggleWindInfo);
document.getElementById('feels-like-btn').addEventListener('click', toggleFeelsLikeInfo);

const forecastBtn = document.getElementById('forecast-btn');
forecastBtn.addEventListener('click', toggleForecast);

function toggleFavoriteCity(city) {
  let favorites = getFavorites();

  if (favorites.includes(city)) {
    favorites = favorites.filter(favCity => favCity !== city);
  } else {
    favorites.push(city);
  }

  localStorage.setItem('favoriteCities', JSON.stringify(favorites));
  updateFavoriteButton(city);
  displayFavorites();
}

function getFavorites() {
  const favorites = localStorage.getItem('favoriteCities');
  return favorites ? JSON.parse(favorites) : [];
}

function updateFavoriteButton(city) {
  const favoriteBtn = document.getElementById('favorite-btn');

  if (getFavorites().includes(city)) {
    favoriteBtn.style.color = 'red';
  } else {
    favoriteBtn.style.color = 'grey';
  }
}

function displayFavorites() {
  const favoritesSection = document.getElementById('favorites-section');
  const favoritesList = document.createElement('div');
  const favorites = getFavorites();

  favoritesSection.innerHTML = '';
  favoritesList.style.borderRadius = '12px';

  if (favorites.length === 0) {
    favoritesSection.innerHTML = '<h3>No favorite cities added.</h3>';
    return;
  }

  favoritesList.innerHTML = '<h3>Favorite Cities:</h3>';

  favorites.forEach(city => {
    const cityElem = document.createElement('div');
    cityElem.style.borderRadius = '8px';

    const cityLink = document.createElement('span');
    cityLink.innerText = city;
    cityLink.style.cursor = 'pointer';
    cityLink.style.textDecoration = 'underline';
    cityLink.addEventListener('click', function () {
      getWeatherByLocation(city);
    });

    cityElem.appendChild(cityLink);

    const removeBtn = document.createElement('button');
    removeBtn.innerText = 'Remove';
    removeBtn.style.font = 'inherit';
    removeBtn.style.fontSize = '14px';
    removeBtn.onclick = function () {
      removeFavorite(city);
    };

    cityElem.appendChild(removeBtn);

    favoritesList.appendChild(cityElem);
  });

  favoritesSection.appendChild(favoritesList);
}

function removeFavorite(city) {
  const favorites = getFavorites().filter(favCity => favCity !== city);
  localStorage.setItem('favoriteCities', JSON.stringify(favorites));
  displayFavorites();
}

function generateLocalAdvice(weatherData) {
  const adviceElement = document.getElementById('local-advice');
  let advice;

  switch (weatherData.weather[0].main) {
    case 'Rain':
      advice = "It's raining. Don't forget your umbrella and raincoat!";
      break;
    case 'Clear':
      advice = 'The sky is clear. Great day for outdoor activities!';
      break;
    case 'Snow':
      advice = 'Snowfall is expected. Stay warm and drive safely!';
      break;
    case 'Thunderstorm':
      advice = 'Thunderstorms in the forecast. Best to stay indoors if you can!';
      break;
    case 'Drizzle':
      advice = 'Light drizzle outside. A light jacket and a hat should suffice.';
      break;
    case 'Clouds':
      advice = "It's cloudy. Good weather to enjoy a walk outside!";
      break;
    case 'Mist':
      advice = 'Misty weather. Drive carefully and keep your headlights on!';
      break;
    case 'Smoke':
      advice = 'Smoke detected. Stay indoors and keep windows closed!';
      break;
    case 'Haze':
      advice = 'Hazy weather. Wear sunglasses and stay hydrated!';
      break;
    case 'Dust':
      advice = 'Dusty winds are blowing. Protect your eyes and skin!';
      break;
    case 'Fog':
      advice = 'Visibility might be low due to mist. Take care when driving!';
      break;
    case 'Sand':
      advice = 'Sandy winds are expected. Protect your eyes and skin.';
      break;
    case 'Ash':
      advice = 'Volcanic ash detected. Wear masks and avoid outdoor activities.';
      break;
    case 'Squall':
      advice = 'Sudden squalls could occur. Secure loose objects and be cautious if outside.';
      break;
    case 'Tornado':
      advice = 'Tornado alert! Seek shelter immediately and stay informed.';
      break;
    default:
      advice = 'Enjoy your day and stay weather aware!';
      break;
  }

  adviceElement.textContent = advice || 'Choose a city to get weather advice!';
}

const chatMessagesElem = document.querySelector('.chat-messages');
const chatInputElem = document.querySelector('.chat-input');
chatMessagesElem.style.display = 'none';
chatInputElem.style.display = 'none';

function fetchWeatherForCurrentLocation() {
  const locationWeatherUI = document.getElementById('current-location-weather');
  locationWeatherUI.textContent = 'Loading Weather...';
  locationWeatherUI.style.color = 'black';

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPositionWeather, handleLocationError);
  } else {
    updateLocationWeatherUI('Geolocation is not supported by your browser.');
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
    refreshButton.onclick = function () {
      getWeatherByLocation(city);
    };
  } else {
    refreshButton.style.display = 'none';
  }
}

function handleLocationError(error) {
  let message = 'An error occurred while retrieving your location.';

  if (error.code === error.PERMISSION_DENIED) {
    message = 'Enable location access then reload to view live weather in your area!';
  }

  updateLocationWeatherUI(message);
}

function updateLocationWeatherUI(message) {
  const locationWeatherUI = document.getElementById('current-location-weather');
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
    } else {
      updateLocationWeatherUI(`Weather data not found for your location.`);
    }
  } catch (error) {
    updateLocationWeatherUI(`Unable to retrieve weather data: ${error.message}`);
  }
}

document.getElementById('toggle-temp').addEventListener('click', () => {
  fetchWeatherForCurrentLocation();
});

function addWeatherToPageByCoords(data) {
  const locationWeatherContainer = document.getElementById('current-location-weather');
  locationWeatherContainer.innerHTML = '';

  const temp = KtoUnit(data.main.temp);
  const unit = isCelsius ? '°C' : '°F';
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
  const timeContainer = document.getElementById('local-time-container');
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

document.getElementById('wind-info-btn').addEventListener('click', toggleWindInfo);

function addWindInfoToPage(data) {
  if (data.wind && data.wind.speed !== undefined) {
    // Calculate wind speed in km/h
    const windSpeedKmH = (data.wind.speed * 3.6).toFixed(1);

    // Determine color based on wind speed thresholds:
    // - Less than 20 km/h: green
    // - 20 to 40 km/h: orange
    // - Greater than 40 km/h: red
    let windSpeedColor;
    if (windSpeedKmH < 20) {
      windSpeedColor = 'green';
    } else if (windSpeedKmH < 40) {
      windSpeedColor = 'orange';
    } else {
      windSpeedColor = 'red';
    }

    // Create a progress bar for wind speed.
    // We'll assume a maximum of 100 km/h for visual scaling.
    const maxWindSpeed = 100;
    const windSpeedPercent = Math.min((windSpeedKmH / maxWindSpeed) * 100, 100);
    const windSpeedBar = `
      <div style="background-color:#eee; width:100%; height:10px; border-radius:5px; margin: 5px 0;">
        <div style="background-color:${windSpeedColor}; width:${windSpeedPercent}%; height:100%; border-radius:5px;"></div>
      </div>
    `;

    // Function to get color for wind direction based on degree.
    // North: blue, East: red, South: green, West: orange.
    function getWindDirectionColor(deg) {
      if ((deg >= 0 && deg < 45) || (deg >= 315 && deg <= 360)) {
        return 'blue';
      } else if (deg >= 45 && deg < 135) {
        return 'red';
      } else if (deg >= 135 && deg < 225) {
        return 'green';
      } else if (deg >= 225 && deg < 315) {
        return 'orange';
      } else {
        return 'gray';
      }
    }

    const windDirColor = getWindDirectionColor(data.wind.deg);
    const windDirText = getWindDirection(data.wind.deg);

    // Update the wind speed element with text and the progress bar.
    const windSpeedElement = document.getElementById('wind-speed');
    windSpeedElement.innerHTML = `
      Speed: <span style="color:${windSpeedColor};">${windSpeedKmH} km/h</span>
      ${windSpeedBar}
    `;

    // Update wind direction element.
    // An arrow rotates based on the wind degree, and the text is color-coded.
    const windDirectionElement = document.getElementById('wind-direction');
    windDirectionElement.innerHTML = `
      Direction: <span style="color:${windDirColor};">${windDirText}</span>
      <span style="display:inline-block; transform: rotate(${data.wind.deg}deg); font-size: 24px; color:${windDirColor};">&#8593;</span>
    `;

    // Determine color for pressure:
    // For example, lower pressures might be concerning (red),
    // moderate pressures in orange, and higher pressures in green.
    const pressure = data.main.pressure;
    let pressureColor;
    if (pressure < 1000) {
      pressureColor = 'red';
    } else if (pressure < 1020) {
      pressureColor = 'orange';
    } else {
      pressureColor = 'green';
    }

    // Update the pressure element with color coding.
    const pressureElement = document.getElementById('wind-pressure');
    pressureElement.innerHTML = `Pressure: <span style="color:${pressureColor};">${pressure} hPa</span>`;

    // Update wind info button with city data.
    const windInfoBtn = document.getElementById('wind-info-btn');
    windInfoBtn.setAttribute('data-city', data.name);
  } else {
    // If wind data is not available, update the wind info container with a message.
    const windInfoDiv = document.getElementById('wind-info');
    windInfoDiv.textContent = 'Wind data not available for this location.';
  }
}

function getWindDirection(degree) {
  const directions = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
  const index = Math.round(((degree %= 360) < 0 ? degree + 360 : degree) / 45) % 8;
  return directions[index];
}

document.getElementById('feels-like-btn').addEventListener('click', toggleFeelsLikeInfo);

function addFeelsLikeToPage(data) {
  // Convert Kelvin to Celsius or Fahrenheit and store as numbers
  let feelsLikeTempNum, minTempNum, maxTempNum;
  if (isCelsius) {
    feelsLikeTempNum = data.main.feels_like - 273.15;
    minTempNum = data.main.temp_min - 273.15;
    maxTempNum = data.main.temp_max - 273.15;
  } else {
    feelsLikeTempNum = ((data.main.feels_like - 273.15) * 9) / 5 + 32;
    minTempNum = ((data.main.temp_min - 273.15) * 9) / 5 + 32;
    maxTempNum = ((data.main.temp_max - 273.15) * 9) / 5 + 32;
  }

  // Format temperatures for display
  let unitSymbol = isCelsius ? '°C' : '°F';
  let feelsLikeTempStr = feelsLikeTempNum.toFixed(1) + ' ' + unitSymbol;
  let minTempStr = minTempNum.toFixed(1) + ' ' + unitSymbol;
  let maxTempStr = maxTempNum.toFixed(1) + ' ' + unitSymbol;

  // Helper function to determine the color based on temperature thresholds.
  // For Celsius:
  //   < 0: blue, 0-15: lightblue, 15-25: green, 25-35: orange, >=35: red
  // For Fahrenheit:
  //   < 32: blue, 32-59: lightblue, 59-77: green, 77-95: orange, >=95: red
  function getTempColor(temp) {
    if (isCelsius) {
      if (temp < 0) return 'blue';
      if (temp < 15) return 'lightblue';
      if (temp < 25) return 'green';
      if (temp < 35) return 'orange';
      return 'red';
    } else {
      if (temp < 32) return 'blue';
      if (temp < 59) return 'lightblue';
      if (temp < 77) return 'green';
      if (temp < 95) return 'orange';
      return 'red';
    }
  }

  const feelsLikeColor = getTempColor(feelsLikeTempNum);
  const minTempColor = getTempColor(minTempNum);
  const maxTempColor = getTempColor(maxTempNum);

  // Define a scale for the progress bars.
  // For Celsius, assume a scale from -20°C to 40°C.
  // For Fahrenheit, assume a scale from -4°F to 104°F.
  let progressMin, progressMax;
  if (isCelsius) {
    progressMin = -20;
    progressMax = 40;
  } else {
    progressMin = -4;
    progressMax = 104;
  }

  // Helper function to create a progress bar given a temperature and its color.
  function createProgressBar(temp, color) {
    let percent = ((temp - progressMin) / (progressMax - progressMin)) * 100;
    // Ensure percent is within 0 to 100%
    percent = Math.max(0, Math.min(100, percent));
    return `
      <div style="background-color:#eee; width:100%; height:10px; border-radius:5px; margin: 5px 0;">
        <div style="background-color:${color}; width:${percent}%; height:100%; border-radius:5px;"></div>
      </div>
    `;
  }

  const feelsLikeBar = createProgressBar(feelsLikeTempNum, feelsLikeColor);
  const minTempBar = createProgressBar(minTempNum, minTempColor);
  const maxTempBar = createProgressBar(maxTempNum, maxTempColor);

  // Update the DOM elements with both the color-coded values and progress bars
  const feelsLikeTempElement = document.getElementById('feels-like-temp');
  feelsLikeTempElement.innerHTML = `
    Feels Like: <span style="color:${feelsLikeColor};">${feelsLikeTempStr}</span>
    ${feelsLikeBar}
  `;

  const minTempElement = document.getElementById('min-temp');
  minTempElement.innerHTML = `
    Min Temperature: <span style="color:${minTempColor};">${minTempStr}</span>
    ${minTempBar}
  `;

  const maxTempElement = document.getElementById('max-temp');
  maxTempElement.innerHTML = `
    Max Temperature: <span style="color:${maxTempColor};">${maxTempStr}</span>
    ${maxTempBar}
  `;
}
