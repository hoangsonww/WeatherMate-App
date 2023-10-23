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

    console.log(respData);

    addWeatherToPage(respData);
}

function addWeatherToPage(data) {
    const temp = KtoC(data.main.temp);

    const weather = document.createElement("div");
    weather.classList.add("weather");

    weather.innerHTML = `
        <h2><img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" /> ${temp}°C <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" /></h2>
        <small>${data.weather[0].main}</small>
    `;

    // cleanup
    main.innerHTML = "";

    main.appendChild(weather);
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

const heading = document.getElementById('my-heading');
const subhead = document.getElementById('subhead');
const colors = ['#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffff00',
    '#00ffff',
    '#ff00ff'];
let timeoutID;

function changeColor(event) {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    event.target.style.color = randomColor;
    timeoutID = setTimeout(resetBackgroundColor, 500);
}

function resetColor(event) {
    event.target.style.color = 'black';
    clearTimeout(timeoutID);
}

function changeBackgroundColor(event) {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    event.target.style.backgroundColor = randomColor;
    timeoutID = setTimeout(resetBackgroundColor, 500);
}

function resetBackgroundColor(event) {
    event.target.style.backgroundColor = 'lightgrey';
    clearTimeout(timeoutID);
}

heading.addEventListener('mouseover', changeColor);
heading.addEventListener('mouseout', resetColor);
buttonSearch.addEventListener('mouseover', changeBackgroundColor);
buttonSearch.addEventListener('mouseout', resetBackgroundColor);
search.addEventListener('mouseover', changeBackgroundColor);
search.addEventListener('mouseout', resetBackgroundColor);
subhead.addEventListener('mouseover', changeColor);
subhead.addEventListener('mouseout', resetColor);
main.addEventListener('mouseover', changeColor);
main.addEventListener('mouseout', resetColor);
