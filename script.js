const apikey = "593309284d3eb093ee96647eb294905b";

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");
const buttonSearch = document.getElementById("btn");
const favorite = document.getElementById("favorites-section");
const title = document.getElementById("my-heading");
const forecast = document.getElementById("forecast-display");

const url = (city) =>
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}`;

async function getWeatherByLocation(city) {
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
                backgroundImage = 'url(https://massago.ca/wp-content/uploads/2018/06/blog-post_rain.jpg)';
                break;
            case 'Snow':
                backgroundImage = 'url(https://wjla.com/resources/media2/16x9/full/1015/center/80/be94f27f-c70a-4e6c-b3cc-9a448da929b8-large16x9_SnowfallsinEllicottCityVeronicaJohnson.JPG)';
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
    document.body.style.backgroundSize = "cover"; // This will make sure the image covers the entire viewport
    document.body.style.backgroundPosition = "center"; // This will center the image
    document.body.style.backgroundRepeat = "no-repeat"; // This will prevent the image from repeating
    document.body.style.color = textColor;
    title.style.color = textColor;
    favorite.style.color = favoriteColor;
    forecast.style.color = favoriteColor;
}

function displayCityNotFound(city) {
    main.innerHTML = `<h2>NO WEATHER DATA FOR THE REGION OR CITY WITH THE NAME ${city.toUpperCase()} FOUND!</h2>`;
}

function addWeatherToPage(data) {
    const temp = KtoC(data.main.temp);
    const lat = data.coord.lat;
    const lon = data.coord.lon;

    const weather = document.createElement("div");
    weather.classList.add("weather");

    weather.innerHTML = `
        <h2 style="margin-left: 40px">${data.name} 
            <button style="margin-left: 10px" id="favorite-btn">❤️</button>
        </h2>
        <h2><img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" /> ${temp}°C <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" /></h2>
        <small>${data.weather[0].main}</small>
    `;

    setBackground(data.weather[0].main, data);

    // cleanup
    main.innerHTML = "";
    main.appendChild(weather);

    // Add event listener to the favorite button
    document.getElementById("favorite-btn").addEventListener("click", function() {
        toggleFavoriteCity(data.name);
    });

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

    // Set the display property to grid when adding forecast data
    forecastDisplay.style.display = 'grid';

    // Clear previous data
    forecastDisplay.innerHTML = "";

    const forecastList = respData.list.slice(0, 5);  // Get the next five 3-hourly predictions

    forecastList.forEach(item => {
        const temp = KtoC(item.main.temp);

        const forecastItem = document.createElement("div");
        forecastItem.classList.add("forecast-item");
        forecastItem.innerHTML = `
            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
            ${temp}°C - ${item.weather[0].main}
            <small>${new Date(item.dt * 1000).toLocaleTimeString()}</small>
        `;

        forecastDisplay.appendChild(forecastItem);
    });
}

function KtoC(K) {
    return Math.floor(K - 273.15);
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const city = search.value;

    if (city) {
        getWeatherByLocation(city);
    }
});

buttonSearch.addEventListener("click", (e) => {
    e.preventDefault();

    const city = search.value;

    if (city) {
        getWeatherByLocation(city);
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

    localStorage.setItem("favorites", JSON.stringify(favorites));
    updateFavoriteButton(city);
    displayFavorites();  // Refresh the favorites list
}

// Get list of favorite cities from local storage
function getFavorites() {
    const favorites = localStorage.getItem("favorites");
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
    localStorage.setItem("favorites", JSON.stringify(favorites));
    displayFavorites();
}

document.addEventListener('DOMContentLoaded', (event) => {
    displayFavorites();
});

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
        return "I'm Cumulus, your virtual meteorologist. I can forecast weather, offer climate trivia, and suggest the best times to enjoy the outdoors!";
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
toggleButton.onclick = function() {
    const chatMessagesElem = document.querySelector(".chat-messages");
    const chatInputElem = document.querySelector(".chat-input");

    if (chatMessagesElem.style.display === "none") {
        chatMessagesElem.style.display = "";
        chatInputElem.style.display = "";
        toggleButton.innerText = "-";
    } else {
        chatMessagesElem.style.display = "none";
        chatInputElem.style.display = "none";
        toggleButton.innerText = "+";
    }
};

const chatHeaderElem = document.querySelector(".chat-header");
chatHeaderElem.appendChild(toggleButton);

// Initially showing only header
const chatMessagesElem = document.querySelector(".chat-messages");
const chatInputElem = document.querySelector(".chat-input");
chatMessagesElem.style.display = "none";
chatInputElem.style.display = "none";

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
