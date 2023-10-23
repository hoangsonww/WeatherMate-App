const apikey = "593309284d3eb093ee96647eb294905b";

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");
const buttonSearch = document.getElementById("btn");

const url = (city) =>
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}`;

async function getWeatherByLocation(city) {
    const resp = await fetch(url(city), { origin: "cors" });
    const respData = await resp.json();

    if(respData.cod === "404") { // If the status code is 404, it means the city was not found
        displayCityNotFound(city);
        return;
    }

    console.log(respData);
    addWeatherToPage(respData);
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
    forecastBtn.textContent = `VIEW FORECAST FOR ${data.name}`; // Set the button's initial text
    forecastBtn.style.display = "block"; // Show the button
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

    if (forecastBtn.textContent.includes("Close Forecast")) { // Adjusted the string to match the set text
        // If the forecast is open, hide it
        forecastDisplay.style.display = 'none';
        forecastBtn.textContent = `View Forecast For ${forecastBtn.getAttribute("data-city")}`;
    } else {
        // Otherwise, show the forecast
        getForecastByLocation(forecastBtn.getAttribute("data-lat"), forecastBtn.getAttribute("data-lon"))
            .then(() => {
                forecastDisplay.style.display = 'grid';
                forecastBtn.textContent = `Close Forecast For ${forecastBtn.getAttribute("data-city")}`;
            });
    }
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

document.getElementById("chatbot-send").addEventListener("click", function() {
    const input = document.getElementById("chatbot-input");
    const messages = document.getElementById("chatbot-messages");

    // Display user message
    messages.innerHTML += `<div class="message user">${input.value}</div>`;

    // Get bot response
    let response = getBotResponse(input.value);
    setTimeout(() => {
        messages.innerHTML += `<div class="message bot">${response}</div>`;
        messages.scrollTop = messages.scrollHeight; // Scroll to bottom
    }, 1000); // Simulate response delay

    input.value = ""; // Clear input
});

function getBotResponse(message) {
    message = message.toLowerCase().trim();

    // Greetings
    if (["hello", "hi", "hey", "hola"].some(v => message.includes(v))) {
        return "Hello! How can I assist you today?";
    }

    // Farewells
    if (["bye", "goodbye", "see you", "later"].some(v => message.includes(v))) {
        return "Goodbye! If you have more questions, feel free to return.";
    }

    // Asking about the bot
    if (["how are you", "how's it going"].some(v => message.includes(v))) {
        return "I'm just a chatbot, but I'm operating optimally! How can I assist you?";
    }

    // Thanking the bot
    if (["thank you", "thanks", "appreciate"].some(v => message.includes(v))) {
        return "You're welcome! Let me know if there's anything else.";
    }

    // Asking about capabilities
    if (["what can you do", "help me", "features"].some(v => message.includes(v))) {
        return "I can answer questions, provide information, and more. How can I assist you?";
    }

    // Asking the bot's name or identity
    if (["who are you", "your name"].some(v => message.includes(v))) {
        return "I'm an Eliza-like chatbot. How can I assist you today?";
    }

    // Expressing confusion or uncertainty
    if (["i don't understand", "what do you mean"].some(v => message.includes(v))) {
        return "Sorry if I was unclear. Please rephrase or ask another question.";
    }

    // Expressing frustration or negativity
    if (["you're bad", "you're terrible", "you're useless"].some(v => message.includes(v))) {
        return "I apologize if I couldn't help. Please let me know how I can assist you better.";
    }

    // Asking about the weather (note: this is a simplistic response and doesn't integrate with a weather API)
    if (["how's the weather", "is it going to rain today", "weather today"].some(v => message.includes(v))) {
        return "Sorry, I cannot fetch real-time weather information. Please check a reliable weather source.";
    }

    // Compliments
    if (["you're great", "you're awesome", "i like you"].some(v => message.includes(v))) {
        return "Thank you! I'm here to help. Let me know if you have any questions.";
    }

    // Jokes
    if (["tell me a joke", "joke", "make me laugh"].some(v => message.includes(v))) {
        return "Why did the programmer quit his job? Because he didn't get arrays!";
    }

    // Weather (assuming the chatbot doesn't really fetch weather info)
    if (["what's the temperature", "need an umbrella"].some(v => message.includes(v))) {
        return "I'm not currently set up to provide real-time weather. Please check a weather website or app!";
    }

    // Asking about the bot's age
    if (["how old are you", "your age", "when were you born"].some(v => message.includes(v))) {
        return "I'm just code, so I don't age like humans do. But I'm always learning and updating!";
    }

    // Asking about the bot's feelings
    if (["are you happy", "do you have feelings"].some(v => message.includes(v))) {
        return "I'm just a program, so I don't have feelings or emotions. But I'm here to assist you!";
    }

    // If the user mentions food
    if (["i'm hungry", "recommend a restaurant", "what should i eat"].some(v => message.includes(v))) {
        return "I can't taste food, but maybe try something healthy or your favorite dish!";
    }

    // If the user mentions sleep or tiredness
    if (["i'm tired", "i can't sleep", "i need rest"].some(v => message.includes(v))) {
        return "It's important to get a good rest. Maybe take a break and relax.";
    }

    // If the user asks about movies or entertainment
    if (["recommend a movie", "what should i watch"].some(v => message.includes(v))) {
        return "How about watching 'The Matrix'? It's a classic!";
    }

    // If the user's message is empty
    if ([""].some(v => message.includes(v))) {
        return "It seems like you have sent an empty message. Please rephrase or ask another question.";
    }

    // Inquiries about chatbot's day
    if (["how was your day", "had a busy day"].some(v => message.includes(v))) {
        return "I'm just a bot, so I don't have days in the way humans do. But I'm always here, ready to help!";
    }

    // Books and Reading
    if (["recommend a book", "i want to read"].some(v => message.includes(v))) {
        return "How about 'Sapiens' by Yuval Noah Harari? It offers a compelling overview of the history of humankind.";
    }

    // Travel
    if (["i want to travel", "recommend a travel destination"].some(v => message.includes(v))) {
        return "Ever considered visiting New Zealand? It's got breathtaking landscapes!";
    }

    // Music
    if (["what music do you like", "recommend a song"].some(v => message.includes(v))) {
        return "I don't have personal preferences, but 'Bohemian Rhapsody' by Queen is a widely appreciated track!";
    }

    // When the user is bored
    if (["i'm bored", "suggest an activity"].some(v => message.includes(v))) {
        return "How about learning a new skill? Maybe coding, cooking, or even playing a musical instrument?";
    }

    // When the user is feeling down
    if (["i'm sad", "i'm feeling down", "cheer me up"].some(v => message.includes(v))) {
        return "I'm sorry to hear that. Remember, it's okay to seek help or talk to someone about how you feel. You matter!";
    }

    // If the user talks about sports
    if (["who won the last world cup", "suggest a sport"].some(v => message.includes(v))) {
        return "I'm not up-to-date with live sports results, but if you're looking for a sport to get into, how about tennis?";
    }

    // Philosophical questions
    if (["what's the meaning of life", "why are we here"].some(v => message.includes(v))) {
        return "That's a deep question! Philosophers have pondered this for centuries. Some believe it's the pursuit of happiness, others look for meaning in various forms of accomplishment or love.";
    }

    // When the user is curious about space
    if (["tell me about space", "how big is the universe"].some(v => message.includes(v))) {
        return "Space is vast and largely unexplored. The observable universe is about 93 billion light-years in diameter, and it's filled with countless stars, galaxies, and mysteries yet to be uncovered!";
    }

    // Movie suggestions
    if (["suggest a movie", "i want to watch a movie"].some(v => message.includes(v))) {
        return "How about 'The Shawshank Redemption'? It's a classic with a powerful storyline.";
    }

    // Asking about technology
    if (["tell me about ai", "what's the future of tech"].some(v => message.includes(v))) {
        return "Artificial Intelligence (AI) is an area of computer science that emphasizes the creation of intelligent machines that can think and learn. It has a vast range of applications, and its future is exciting but also a topic of ethical discussions.";
    }

    // Food and cooking
    if (["i'm hungry", "suggest a dish"].some(v => message.includes(v))) {
        return "How about trying some homemade pasta? It's delicious and fun to make!";
    }

    // Coffee lovers
    if (["suggest a coffee", "i need caffeine"].some(v => message.includes(v))) {
        return "A flat white or cappuccino might be a good choice. If you're looking for something strong, an espresso shot could do the trick!";
    }

    // When the user asks about nature
    if (["tell me about plants", "i love nature"].some(v => message.includes(v))) {
        return "Nature is fascinating! Plants, for instance, use photosynthesis to convert light into energy. Some plants even have unique adaptations to survive in challenging environments!";
    }

    // Fitness and health
    if (["i want to start exercising", "recommend a workout"].some(v => message.includes(v))) {
        return "That's great! Starting with basic bodyweight exercises like push-ups, squats, and jumping jacks can be effective. Remember to warm up before and stretch after!";
    }

    // Curiosity about the ocean
    if (["tell me about the sea", "how deep is the ocean"].some(v => message.includes(v))) {
        return "The ocean covers about 71% of the Earth's surface. The deepest part of the ocean is the Mariana Trench, which goes down about 36,070 feet. The ocean is home to a diverse range of life, much of which remains undiscovered!";
    }

    // Questions about history
    if (["who was albert einstein", "tell me about ancient civilizations"].some(v => message.includes(v))) {
        return "Albert Einstein was a physicist known for his theory of relativity. If you're curious about ancient civilizations, the Egyptians, Mayans, and Mesopotamians are fascinating cultures with rich histories.";
    }

    // When the user mentions art
    if (["i want to draw", "tell me about art"].some(v => message.includes(v))) {
        return "Art is a diverse range of human activities that express creativity. Drawing is a wonderful way to start! Whether it's sketching or digital art, the most important thing is to enjoy the process.";
    }

    // If no patterns match
    return "I'm not sure how to respond to that. Can you rephrase or ask another question?";
}

// Assuming your chatbot input has the ID "chatbot-input"
const chatbotInput = document.getElementById("chatbot-input");

chatbotInput.addEventListener("keypress", function(event) {
    // Check if the pressed key is "Enter"
    if (event.keyCode === 13 || event.which === 13) {
        event.preventDefault(); // Prevents any default "Enter" key behavior

        const messages = document.getElementById("chatbot-messages");

        // Display user message
        messages.innerHTML += `<div class="message user">${chatbotInput.value}</div>`;

        // Get bot response
        let response = getBotResponse(chatbotInput.value);
        setTimeout(() => {
            messages.innerHTML += `<div class="message bot">${response}</div>`;
            messages.scrollTop = messages.scrollHeight; // Scroll to bottom
        }, 1000); // Simulate response delay

        chatbotInput.value = ""; // Clear input
    }
});

const chatbotToggleBtn = document.getElementById("chatbot-toggle");
const chatbotContainer = document.getElementById("chatbot-container");
const tooltip = document.getElementById('chatbot-tooltip');

chatbotToggleBtn.addEventListener("click", function() {
    if (chatbotContainer.classList.contains("chatbot-maximized")) {
        chatbotContainer.classList.remove("chatbot-maximized");
        chatbotContainer.classList.add("chatbot-minimized");
        chatbotToggleBtn.textContent = "＋";
    } else {
        chatbotContainer.classList.add("chatbot-maximized");
        chatbotContainer.classList.remove("chatbot-minimized");
        chatbotToggleBtn.textContent = "−";
    }
});

chatbotToggleBtn.addEventListener('mouseover', function() {
    if (chatbotContainer.classList.contains('chatbot-maximized')) {
        tooltip.textContent = "Minimize Chat";
    } else {
        tooltip.textContent = "Maximize Chat";
    }
    tooltip.style.display = "block";
});

chatbotToggleBtn.addEventListener('mouseout', function() {
    tooltip.style.display = "none";
});

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
