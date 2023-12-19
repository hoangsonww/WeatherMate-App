const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");
const buttonSearch = document.getElementById("btn");
const favorite = document.getElementById("favorites-section");
const title = document.getElementById("my-heading");
const forecast = document.getElementById("forecast-display");

let isCelsius = localStorage.getItem("isCelsius") === "true";

const url = (city) =>
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}`;

async function getWeatherByLocation(city) {
    const humidityRainBtn = document.getElementById("humidity-rain-btn");
    const humidityRainDisplay = document.getElementById("humidity-rain-display");
    if (humidityRainDisplay.style.display !== 'none') {
        humidityRainDisplay.style.display = 'none';
        humidityRainBtn.textContent = `View Humidity & Chance of Rain For ${city}`;
    }
    lastCity = city; // Store the last searched city
    // Hide forecast before fetching new city data
    document.getElementById("forecast-display").style.display = 'none';
    document.getElementById("forecast-btn").textContent = `View Forecast For ${city}`;
    document.getElementById("aqi-btn").textContent = `View Air Quality Index For ${city}`;

    const resp = await fetch(url(city), { origin: "cors" });
    const respData = await resp.json();

    if(respData.cod === "404") {
        displayCityNotFound(city);
        return;
    }

    console.log(respData);
    addWeatherToPage(respData);
    showRefreshButton(city);

    const lat = respData.coord.lat;
    const lon = respData.coord.lon;

    fetchWeatherAlerts(lat, lon);
}

// Function to fetch and display AQI data
async function displayAirQuality(lat, lon) {
    const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apikey}`;
    const response = await fetch(aqiUrl, { origin: "cors" });
    const aqiData = await response.json();

    const aqiElement = document.getElementById("aqi-display");
    // Prevent adding multiple AQI instances: check if the AQI data is already there
    if (!aqiElement.hasChildNodes()) {
        const aqi = aqiData.list[0].main.aqi;
        const airQuality = convertAQIToQuality(aqi);
        aqiElement.innerHTML = `<h3 class="aqi-text aqi-${aqi}">Air Quality Index: ${aqi} (${airQuality})</h3>`;
        aqiElement.style.display = 'block'; // Show the AQI information
    }
}

function createAQIDisplayElement() {
    const aqiElement = document.createElement("div");
    aqiElement.id = "aqi-display";
    aqiElement.style.display = 'none'; // Start with the display set to none
    document.body.appendChild(aqiElement);
    return aqiElement;
}

// Function to convert AQI value to qualitative description
function convertAQIToQuality(aqi) {
    if (aqi === 1) {
        return "Good";
    } else if (aqi === 2) {
        return "Fair";
    } else if (aqi === 3) {
        return "Moderate";
    } else if (aqi === 4) {
        return "Poor";
    } else if (aqi === 5) {
        return "Very Poor";
    } else {
        return "Unknown";
    }
}

function setBackground(condition, data) {
    let backgroundImage = '';
    let textColor = 'black';
    let favoriteColor = 'black';

    const currentTime = new Date().getTime() / 1000; // Convert to UNIX timestamp
    const sunrise = data.sys.sunrise;
    const sunset = data.sys.sunset;

    if (condition === 'Clear' && (currentTime < sunrise || currentTime > sunset)) {
        backgroundImage = 'url(https://live.staticflickr.com/5698/30867056071_9b7f336f48_b.jpg)';
        textColor = 'white';
        favoriteColor = 'black';
    }
    else {
        switch (condition) {
            case 'Clouds':
                backgroundImage = 'url(https://images.unsplash.com/photo-1611928482473-7b27d24eab80?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2xvdWR5JTIwd2VhdGhlcnxlbnwwfHwwfHx8MA%3D%3D)';
                textColor = 'white';
                favoriteColor = 'black';
                break;
            case 'Clear':
                backgroundImage = 'url(https://clarksvillenow.sagacom.com/files/2020/10/shutterstock_206307496-1200x768.jpg)';
                break;
            case 'Rain':
                backgroundImage = 'url(https://cdn.zeebiz.com/sites/default/files/2023/09/21/261707-weather-effects-composition-1.jpg)';
                document.getElementById("local-time-label").style.color = 'white';
                document.getElementById("home-label").style.color = 'white';
                break;
            case 'Snow':
                backgroundImage = 'url(https://d.newsweek.com/en/full/1956691/winter-forest-landscape-snow-covered-trees.jpg)';
                textColor = 'white';
                favoriteColor = 'black';
                document.getElementById("main").style.color = 'white';
                break;
            case 'Thunderstorm':
                backgroundImage = 'url(https://s.w-x.co/thunderstormasthma.jpg)';
                break;
            default:
                backgroundImage = 'url(https://cbsnews1.cbsistatic.com/hub/i/2015/01/08/2a7e43f9-7cce-44a4-b0fa-949612fd9ef1/461133262.jpg)';
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
    main.innerHTML = `<h2>NO WEATHER DATA FOR THE REGION OR CITY WITH THE NAME ${city.toUpperCase()} FOUND!</h2>
                      <h3 style="align-self: center; text-align: center">PLEASE CHECK THE SPELLING AND TRY AGAIN!</h3>`;
}

document.getElementById("search").addEventListener("click", function() {
    main.innerHTML = "";
});

document.getElementById("search").addEventListener("keydown", function() {
    main.innerHTML = "";
});

function addWeatherToPage(data) {
    const temp = KtoUnit(data.main.temp);
    const unit = isCelsius ? "°C" : "°F"; // Determine the unit based on isCelsius
    const lat = data.coord.lat;
    const lon = data.coord.lon;

    // Update the weather HTML with the temperature and the correct unit
    const weather = document.createElement("div");
    weather.classList.add("weather");

    weather.innerHTML = `
        <h2 style="margin-left: 40px">${data.name} 
            <button style="margin-left: 10px" id="favorite-btn">❤️ </button>
        </h2>
        <h2><img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" /> ${temp}${unit} <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" /></h2>
        <small>${data.weather[0].main}</small>
    `;

    setBackground(data.weather[0].main, data);

    // cleanup
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
    forecastBtn.textContent = `View Forecast For ${data.name}`; // Set the button's initial text
    forecastBtn.style.display = "block"; // Show the button
    const aqiBtn = document.getElementById("aqi-btn");
    aqiBtn.setAttribute("data-lat", data.coord.lat);
    aqiBtn.setAttribute("data-lon", data.coord.lon);
    aqiBtn.setAttribute("data-city", data.name);
    aqiBtn.textContent = `View Air Quality Index For ${data.name}`; // Set the button's initial text
    aqiBtn.style.display = "block"; // Show the button

    // Add the click event listener if it has not already been set
    if (!aqiBtn.getAttribute('listener')) {
        aqiBtn.addEventListener("click", toggleAQI);
        aqiBtn.setAttribute('listener', 'true');
    }

    // Ensure AQI is not displayed immediately
    const aqiDisplay = document.getElementById("aqi-display") || createAQIDisplayElement();
    aqiDisplay.innerHTML = ''; // Clear previous AQI data
    aqiDisplay.style.display = 'none'; // Hide the AQI display initially

    const humidityRainBtn = document.getElementById("humidity-rain-btn");
    humidityRainBtn.setAttribute("data-lat", data.coord.lat);
    humidityRainBtn.setAttribute("data-lon", data.coord.lon);
    humidityRainBtn.setAttribute("data-city", data.name);
    humidityRainBtn.textContent = `View Humidity & Chance of Rain For ${data.name}`;
    humidityRainBtn.style.display = "block"; // Show the button

    // Add the click event listener if it has not already been set
    if (!humidityRainBtn.getAttribute('listener')) {
        humidityRainBtn.addEventListener("click", toggleHumidityRain);
        humidityRainBtn.setAttribute('listener', 'true');
    }
}

function toggleHumidityRain() {
    const displayElement = document.getElementById("humidity-rain-display");
    const btn = document.getElementById("humidity-rain-btn");
    const lat = btn.getAttribute("data-lat");
    const lon = btn.getAttribute("data-lon");

    if (btn.textContent.includes("Close")) {
        displayElement.style.display = 'none';
        btn.textContent = `View Humidity & Chance of Rain For ${btn.getAttribute("data-city")}`;
    }
    else {
        displayHumidityRain(lat, lon, displayElement);
        btn.textContent = `Close Humidity & Chance of Rain For ${btn.getAttribute("data-city")}`;
    }
}

async function displayHumidityRain(lat, lon, displayElement) {
    // Fetch current weather for humidity
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apikey}`;
    const weatherResp = await fetch(weatherUrl);
    const weatherData = await weatherResp.json();
    const humidity = weatherData.main.humidity;

    // Fetch forecast for chance of rain
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apikey}`;
    const forecastResp = await fetch(forecastUrl);
    const forecastData = await forecastResp.json();
    const chanceOfRain = forecastData.list[0].pop; // Probability of Precipitation

    // Display the information
    displayElement.innerHTML = `<h3>Humidity: ${humidity}%</h3><h3>Chance of Rain: ${(chanceOfRain * 100).toFixed(0)}%</h3>`;
    displayElement.style.display = 'block';
}

function displayLocalTime(timezoneOffset) {
    // Get the current UTC time, add the timezone offset, and convert to milliseconds
    const utcDate = new Date();
    const utcTime = utcDate.getTime() + utcDate.getTimezoneOffset() * 60000;
    const localTime = new Date(utcTime + timezoneOffset * 1000);

    // Format the time
    const formattedTime = localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Update or create the local time display element
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
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apikey}`;

    const resp = await fetch(forecastUrl, { origin: "cors" });
    const respData = await resp.json();

    console.log("Forecast Data:", respData);  // log the response

    addForecastToPage(respData);
}

function addForecastToPage(respData) {
    const forecastDisplay = document.getElementById("forecast-display");
    const unit = isCelsius ? "°C" : "°F";

    // Set the display property to grid when adding forecast data
    forecastDisplay.style.display = 'grid';

    // Clear previous data
    forecastDisplay.innerHTML = "";

    const forecastList = respData.list.slice(0, 5);  // Get the next five 3-hourly predictions

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
    // Check local storage for the user's preference
    const userPrefersCelsius = localStorage.getItem("isCelsius") === "true";
    return userPrefersCelsius ? Math.floor(K - 273.15) : Math.floor((K - 273.15) * 9/5 + 32);
}

// Add a function to toggle the temperature unit between C and F
function toggleTemperatureUnit() {
    isCelsius = !isCelsius; // Toggle the boolean value
    localStorage.setItem("isCelsius", isCelsius); // Store the preference
    const button = document.getElementById("toggle-temp");
    button.textContent = isCelsius ? "Displaying in °C" : "Displaying in °F"; // Update button text
    updateTemperatures(); // Call a new function to update temperatures
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
    button.textContent = isCelsius ? "Displaying in °C" : "Displaying in °F"; // Update button text based on stored preference
}

let lastCity = "";

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const city = search.value;

    if (city) {
        getWeatherByLocation(city);
        const subhead = document.getElementById("subhead");
        subhead.style.display = 'none';
    }
});

form.addEventListener("click", (e) => {
    const subhead = document.getElementById("subhead");
    subhead.style.display = 'block';
});

buttonSearch.addEventListener("click", (e) => {
    e.preventDefault();

    const city = search.value;

    if (city) {
        getWeatherByLocation(city);
        const subhead = document.getElementById("subhead");
        subhead.style.display = 'none';
    }
});

function toggleForecast() {
    const forecastDisplay = document.getElementById("forecast-display");
    const forecastBtn = document.getElementById("forecast-btn");

    if (forecastBtn.textContent.includes("Close Forecast")) {
        forecastDisplay.style.display = 'none';
        forecastBtn.textContent = `View Forecast For ${forecastBtn.getAttribute("data-city")}`;
    } else {
        const lat = forecastBtn.getAttribute("data-lat");
        const lon = forecastBtn.getAttribute("data-lon");
        getForecastByLocation(lat, lon).then(() => {
            forecastDisplay.style.display = 'grid';
            forecastBtn.textContent = `Close Forecast For ${forecastBtn.getAttribute("data-city")}`;
            // Add sunrise and sunset times
            displaySunriseSunset(lat, lon);
        });
    }
}

function toggleAQI() {
    const aqiDisplay = document.getElementById("aqi-display");
    const aqiBtn = document.getElementById("aqi-btn");
    const city = aqiBtn.getAttribute("data-city");
    const lat = aqiBtn.getAttribute("data-lat");
    const lon = aqiBtn.getAttribute("data-lon");

    if (aqiBtn.textContent.includes("Close Air Quality Index")) {
        aqiDisplay.style.display = 'none';
        aqiBtn.textContent = `View Air Quality Index For ${city}`;
    } else {
        // Check if AQI data is already fetched
        if (!aqiDisplay.innerHTML.trim()) {
            displayAirQuality(lat, lon);
        } else {
            aqiDisplay.style.display = 'block';
        }
        aqiBtn.textContent = `Close Air Quality Index For ${city}`;
    }
}

function displaySunriseSunset(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apikey}`;

    fetch(apiUrl)
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

const forecastBtn = document.getElementById("forecast-btn");
forecastBtn.addEventListener("click", toggleForecast); // Adjusted to use addEventListener

// Function to add or remove city from favorites
function toggleFavoriteCity(city) {
    console.log("Toggling favorite for city:", city);  // Added log

    let favorites = getFavorites();
    console.log("Current favorites before toggle:", favorites);  // Added log

    // If the city is already a favorite, remove it, otherwise add it
    if (favorites.includes(city)) {
        favorites = favorites.filter(favCity => favCity !== city);
    } else {
        favorites.push(city);
    }

    localStorage.setItem("favoriteCities", JSON.stringify(favorites));
    updateFavoriteButton(city);
    displayFavorites();  // Refresh the favorites list
}

// Get list of favorite cities from local storage
function getFavorites() {
    const favorites = localStorage.getItem("favoriteCities");
    return favorites ? JSON.parse(favorites) : [];
}

// Update the state of the favorite button based on if city is a favorite or not
function updateFavoriteButton(city) {
    const favoriteBtn = document.getElementById("favorite-btn");
    if (getFavorites().includes(city)) {
        favoriteBtn.style.color = "red";
    } else {
        favoriteBtn.style.color = "grey";
    }
}

// Display list of favorite cities for quick access and deletion
function displayFavorites() {
    const favoritesSection = document.getElementById("favorites-section");
    const favoritesList = document.createElement("div");
    const favorites = getFavorites();

    // Clear existing favorites if any
    favoritesSection.innerHTML = "";

    if (favorites.length === 0) {
        favoritesSection.innerHTML = "<h3>No favorite cities added.</h3>";
        return;
    }

    favoritesList.innerHTML = "<h3>Favorite Cities:</h3>";

    favorites.forEach(city => {
        const cityElem = document.createElement("div");

        // Making the city name clickable
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

function getBotResponse(message) {
    const weatherInCityRegex = /weather in (.*?)(?=\n|$)/;

    // Check if the message matches the 'weather in [city]' pattern
    const weatherInCityMatch = message.match(weatherInCityRegex);

    if (weatherInCityMatch && weatherInCityMatch[1]) {
        const city = weatherInCityMatch[1].trim(); // Trim the city name to remove any extra whitespace
        getWeatherByLocation(city); // Call the function to get weather by location
        return `Fetching weather for ${city}...`; // Respond to the user
    }

    // Greetings with dynamic weather comment
    if (["hello", "hey", "hola"].some(v => message.includes(v))) {
        // Ideally, integrate with a function that detects the user's current weather
        return "How can I assist with your weather queries today? I can also display weather for you! To make me do so, simply type 'weather in [a city's name]'";
    }

    if (message === "hi") {
        return "How can I assist with your weather queries today? I can also display weather for you! To make me do so, simply type 'weather in [a city's name]'";
    }

    // Farewells with a next-day weather teaser
    if (["bye", "goodbye", "see you", "later"].some(v => message.includes(v))) {
        // Potentially integrate with a function that provides a brief forecast for the next day
        return "Goodbye! By the way, tomorrow looks [summary of tomorrow's weather]. Check back for updates!";
    }

    // Bot's status with a weather update
    if (["how are you", "how's it going"].some(v => message.includes(v))) {
        // Include a fun weather-related status
        return "I'm as operational as a weather satellite! Currently tracking some interesting weather patterns. Need an update?";
    }

    // Enhanced capabilities including alerts and trends
    if (["what can you do", "help me", "features"].some(v => message.includes(v))) {
        return "I'm equipped to provide real-time weather updates, forecasts, alerts, and even educational tidbits about meteorology. Would you like a weather fact or a forecast?";
    }

    // Bot's identity with a fun weather twist
    if (["who are you", "your name"].some(v => message.includes(v))) {
        return "I'm WeatherMate, your virtual meteorologist. I can forecast weather, offer climate trivia, and suggest the best times to enjoy the outdoors!";
    }

    // Detailed real-time weather responses
    if (["how's the weather", "is it going to rain today", "weather today", "what's the temperature", "need an umbrella"].some(v => message.includes(v))) {
        // Code here should query the weather API and give a detailed response
        return "One moment, I’m scanning the skies for you... [Insert detailed weather information]";
    }

    // Offering a weather lesson when the user expresses confusion
    if (["i don't understand", "what do you mean"].some(v => message.includes(v))) {
        return "Let's clear the air! I can provide weather forecasts, climate facts, or explain meteorological terms. What weather topic can I illuminate for you?";
    }

    // Apologetic response with a proactive offer
    if (["you're bad", "you're terrible", "you're useless"].some(v => message.includes(v))) {
        return "I'm here to improve your day like a break in the clouds. Tell me what weather info you're after, and I'll do my best!";
    }

    // Weather compliments with gratitude and offers of more service
    if (["you're great", "you're awesome", "i like you"].some(v => message.includes(v))) {
        return "Thank you for the warm front of kindness! How can I further brighten your day with weather updates?";
    }

    // Weather jokes for a lighthearted moment
    if (["tell me a joke", "joke", "make me laugh"].some(v => message.includes(v))) {
        return "Why don't meteorologists like to go to the beach? They can't enjoy the sun with all that cloud judgment! Any other weather fun facts or forecasts I can provide?";
    }

    // Weather tips for various scenarios
    if (["i'm cold", "it's so hot", "what to wear"].some(v => message.includes(v))) {
        // Include practical advice based on the current weather
        return "Dressing in layers is key for cold weather. For heat, light-colored and loose-fitting clothing is best. Can I suggest something based on today’s weather?";
    }

    // Offering weather-related health advice
    if (["i have a headache", "i feel sick"].some(v => message.includes(v))) {
        return "Sometimes changes in weather, like barometric pressure, can affect your health. It's best to consult a doctor, but would you like to know if there’s a pressure change expected today?";
    }

    // Introducing weather safety tips
    if (["storm warning", "is it safe"].some(v => message.includes(v))) {
        // Potentially integrate with a function that provides safety tips during adverse weather conditions
        return "Safety first! There is a [current weather alert]. It's best to [safety advice]. Stay indoors and away from windows if you hear thunder.";
    }

    // If no patterns match, offer a range of weather services
    return "I seem to be out of my element. I'm best with cloud coverage than clouded questions. For weather forecasts, trivia, or wardrobe advice, I'm your bot. How may I assist?";
}

// Chat interaction with delay
const chatInput = document.querySelector(".chat-input");
const chatMessages = document.querySelector(".chat-messages");

// Create the chatbot title
const chatTitleElem = document.createElement("div");
chatTitleElem.className = "chat-header chat-title";
chatTitleElem.innerText = "Chat With Your WeatherMate!";
document.querySelector(".chatbot").prepend(chatTitleElem);

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
        const question = e.target.value.trim();

        const userMsgElem = document.createElement("div");
        userMsgElem.innerText = `You: ${question}`;
        chatMessages.appendChild(userMsgElem);

        setTimeout(() => {
            const response = getBotResponse(question);
            const elizaMsgElem = document.createElement("div");
            elizaMsgElem.innerText = `Eliza: ${response}`;
            chatMessages.appendChild(elizaMsgElem);
        }, 1000); // 1-second delay

        e.target.value = '';
    }
});

// Creating the chatbot's maximize/minimize button
const toggleButton = document.createElement("button");
toggleButton.innerText = "-";
toggleButton.className = "toggle-chat";
toggleButton.title = "Maximize/Minimize Chatbot";
toggleButton.onclick = function() {
    const chatMessagesElem = document.querySelector(".chat-messages");
    const chatInputElem = document.querySelector(".chat-input");
    if (chatMessagesElem.style.display === "none") {
        chatMessagesElem.style.display = "";
        chatInputElem.style.display = "";
        toggleButton.innerText = "-";
    }
    else {
        chatMessagesElem.style.display = "none";
        chatInputElem.style.display = "none";
        toggleButton.innerText = "+";
    }
};

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
        case "Smoke":
        case "Haze":
        case "Dust":
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

const chatHeaderElem = document.querySelector(".chat-header");
chatHeaderElem.appendChild(toggleButton);

// Initially showing only header
const chatMessagesElem = document.querySelector(".chat-messages");
const apikey = "593309284d3eb093ee96647eb294905b";
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

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeatherAlerts(lat, lon);
            },
            () => {
                // If location access is denied, hide the alert sidebar
                const sidebar = document.getElementById('weather-alert-sidebar');
                sidebar.classList.remove('active');
            }
        );
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
        refreshButton.style.display = 'block'; // Show button when a city is selected
        refreshButton.onclick = function() {
            getWeatherByLocation(city); // Fetch latest weather data for the selected city
        };
    }
    else {
        refreshButton.style.display = 'none'; // Hide button when no city is selected
    }
}

function handleLocationError(error) {
    let message = "An error occurred while retrieving your location.";

    if (error.code === error.PERMISSION_DENIED) {
        // Show the location button as we don't have permission to access the location
        message = "Enable location access then reload to view live weather in your area!";
    }

    // Update the UI with the message
    updateLocationWeatherUI(message);
}

function updateLocationWeatherUI(message) {
    const locationWeatherUI = document.getElementById("current-location-weather");
    locationWeatherUI.textContent = message;
    locationWeatherUI.style.color = 'black';
}

fetchWeatherForCurrentLocation();

async function getWeatherByLocationCoords(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apikey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.cod === 200) {
            // Call function to add weather data to page, similar to addWeatherToPage but for coordinates
            addWeatherToPageByCoords(data);
        } else {
            // Handle any errors, such as location not found
            updateLocationWeatherUI(`Weather data not found for your location.`);
        }
    }
    catch (error) {
        // Handle general errors, such as network issues
        updateLocationWeatherUI(`Unable to retrieve weather data: ${error.message}`);
    }
}

function addWeatherToPageByCoords(data) {
    const locationWeatherContainer = document.getElementById("current-location-weather");
    locationWeatherContainer.innerHTML = ''; // Clear the "Loading Weather..." message

    const temp = Math.floor(data.main.temp);
    const weatherDescription = data.weather[0].description;
    const weatherIcon = data.weather[0].icon;
    const locationName = data.name;

    // Build the display element with the fetched data
    const weatherElement = document.createElement('div');
    weatherElement.classList.add('weather');
    weatherElement.innerHTML = `
        <h5 style="margin-bottom: -10px">Weather in Your Location</h5>
        <h5 style="margin-bottom: -10px">${locationName}</h5>
        <h6>${temp}°C, ${weatherDescription}</h6>
        <img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="${weatherDescription}" />
    `;

    // Append the weather info to the container
    locationWeatherContainer.appendChild(weatherElement);
}

function updateLocalTime() {
    const timeContainer = document.getElementById("local-time-container");
    const now = new Date();
    const timeParts = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).split(' ');

    // Clear previous content
    timeContainer.innerHTML = '';

    // Create and append time part
    const timeDiv = document.createElement('div');
    timeDiv.textContent = timeParts[0];
    timeContainer.appendChild(timeDiv);

    // Create and append AM/PM part
    const amPmDiv = document.createElement('div');
    amPmDiv.textContent = timeParts[1];
    timeContainer.appendChild(amPmDiv);

    timeContainer.style.color = 'black';
    setTimeout(updateLocalTime, 60000);
}

updateLocalTime();

async function fetchWeatherAlerts(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily&appid=YOUR_API_KEY`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.alerts) {
            updateAlertSidebar(data.alerts);
        }
        else {
            // Handle no alerts
            updateAlertSidebar([]);
        }
    }
    catch (error) {
        console.error('Error fetching weather alerts:', error);
    }
}

function updateAlertSidebar(alerts) {
    const sidebar = document.getElementById('weather-alert-sidebar');
    sidebar.innerHTML = ''; // Clear previous alerts

    if (alerts.length === 0) {
        sidebar.innerHTML = '<p style="color: black; text-align: center">No current weather alerts.</p>';
    }
    else {
        alerts.forEach(alert => {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert';
            alertDiv.innerHTML = `<h4>${alert.event}</h4><p>${alert.description}</p>`;
            sidebar.appendChild(alertDiv);
        });
    }

    sidebar.classList.add('active'); // Show the sidebar
}

// Optional: Function to toggle the sidebar visibility
function toggleAlertSidebar() {
    const sidebar = document.getElementById('weather-alert-sidebar');
    sidebar.classList.toggle('active');
}


// const heading = document.getElementById('my-heading');
// const subhead = document.getElementById('subhead');
// const colors = ['#ff0000',
//     '#00ff00',
//     '#0000ff',
//     '#ffff00',
//     '#00ffff',
//     '#ff00ff'];
// let timeoutID;
//
// function changeColor(event) {
//     const randomColor = colors[Math.floor(Math.random() * colors.length)];
//     event.target.style.color = randomColor;
//     timeoutID = setTimeout(resetBackgroundColor, 500);
// }
//
// function resetColor(event) {
//     event.target.style.color = 'black';
//     clearTimeout(timeoutID);
// }
//
// function changeBackgroundColor(event) {
//     const randomColor = colors[Math.floor(Math.random() * colors.length)];
//     event.target.style.backgroundColor = randomColor;
//     timeoutID = setTimeout(resetBackgroundColor, 500);
// }
//
// function resetBackgroundColor(event) {
//     event.target.style.backgroundColor = 'lightgrey';
//     clearTimeout(timeoutID);
// }

// heading.addEventListener('mouseover', changeColor);
// heading.addEventListener('mouseout', resetColor);
// buttonSearch.addEventListener('mouseover', changeBackgroundColor);
// buttonSearch.addEventListener('mouseout', resetBackgroundColor);
// search.addEventListener('mouseover', changeBackgroundColor);
// search.addEventListener('mouseout', resetBackgroundColor);
// subhead.addEventListener('mouseover', changeColor);
// subhead.addEventListener('mouseout', resetColor);
// main.addEventListener('mouseover', changeColor);
// main.addEventListener('mouseout', resetColor);
