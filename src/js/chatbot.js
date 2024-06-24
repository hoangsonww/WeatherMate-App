import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

function scrollToBottom() {
    const chatMessages = document.querySelector(".chat-messages");
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendInstructionalMessage() {
    const instructionMessage = "Hello! I am your WeatherMate Assistant 🌤. I can provide weather information for you. To get started, type 'weather in [a city's name]' to get the weather for that city. Or you can also ask me any general weather-related questions or any other queries you may have. How can I assist you today? 🌤";
    const instructionElem = document.createElement("div");
    instructionElem.innerText = instructionMessage;
    document.querySelector(".chat-messages").appendChild(instructionElem);
}

document.addEventListener("DOMContentLoaded", () => {
    sendInstructionalMessage();
    scrollToBottom();
});

async function getBotResponse(message) {
    const weatherInCityRegex = /weather in (.*?)(?=\n|$)/;
    const weatherInCityMatch = message.match(weatherInCityRegex);

    if (weatherInCityMatch && weatherInCityMatch[1]) {
        const city = weatherInCityMatch[1].trim();
        getWeatherByLocation(city);
        return `Fetching weather for ${city}...`;
    }

    if (message.toLowerCase().includes("hello") || message.toLowerCase().startsWith("hi") || message.toLowerCase().includes("hey")) {
        return "How can I assist with your weather queries today? I can also display weather for you! To make me do so, simply type 'weather in [a city's name]'";
    }

    const conversationHistory = [];
    let fullResponse = "Loading...";

    try {
        showLoadingMessage();

        const genAI = new GoogleGenerativeAI(getAIResponse());
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "You are a weather assistant, also known as WeatherMate Assistant, for the WeatherMate App. The app is created by Son Nguyen in 2023. Your task is to provide weather information to users. You can also provide general information about weather and answer weather-related questions, or any other queries the user may have, with appropriate responses.",
        });

        conversationHistory.push({role: "user", parts: [{text: message}]});

        const chatSession = model.startChat({
            generationConfig: {
                temperature: 1,
                topP: 0.95,
                topK: 64,
                maxOutputTokens: 8192,
                responseMimeType: "text/plain"
            },
            safetySettings: [
                {category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE},
                {category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE},
                {category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE},
                {category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE}
            ],
            history: conversationHistory
        });

        const result = await chatSession.sendMessage(message);
        fullResponse = result.response.text();
        conversationHistory.push({role: "model", parts: [{text: fullResponse}]});
        hideLoadingMessage();
    }
    catch (error) {
        console.error('Error fetching response:', error.message);
        fullResponse = "An error occurred while generating the response, possibly due to high traffic or safety concerns. Please understand that I am trained by MovieVerse to provide safe and helpful responses within my limitations. I apologize for any inconvenience caused. Please try again with a different query or contact MovieVerse support for further assistance.";
    }

    return removeMarkdown(fullResponse);
}

function getAIResponse() {
    const response = 'QUl6YVN5Q1RoUWVFdmNUb01ka0NqWlM3UTNxNzZBNUNlNjVyMW9r';
    return atob(response);
}

function removeMarkdown(text) {
    const converter = new showdown.Converter();
    const html = converter.makeHtml(text);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
}

function showLoadingMessage() {
    const chatMessages = document.querySelector(".chat-messages");
    const loadingElem = document.createElement("div");
    loadingElem.className = "chat-message";
    loadingElem.innerText = "Loading";

    function animateLoadingDots() {
        if (loadingElem.innerText.endsWith("...")) {
            loadingElem.innerText = "Loading";
        }
        else {
            loadingElem.innerText += ".";
        }
    }

    setInterval(animateLoadingDots, 500);
    chatMessages.appendChild(loadingElem);
}

function hideLoadingMessage() {
    const chatMessages = document.querySelector(".chat-messages");
    chatMessages.removeChild(chatMessages.lastChild);
}

const chatInput = document.querySelector(".chat-input");
const chatMessages = document.querySelector(".chat-messages");

const chatTitleElem = document.createElement("div");
chatTitleElem.className = "chat-header chat-title";
chatTitleElem.innerText = "Chat With Your WeatherMate!";
document.querySelector(".chatbot").prepend(chatTitleElem);

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
        scrollToBottom();
        const question = e.target.value.trim();
        const userMsgElem = document.createElement("div");
        userMsgElem.innerText = `You: ${question}`;
        chatMessages.appendChild(userMsgElem);
        scrollToBottom();

        setTimeout(async () => {
            const response = await getBotResponse(question);
            const elizaMsgElem = document.createElement("div");
            elizaMsgElem.innerText = `WeatherMate: ${response}`;
            chatMessages.appendChild(elizaMsgElem);
            scrollToBottom();
        }, 1000);

        e.target.value = '';
    }
});

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

const chatHeaderElem = document.querySelector(".chat-header");
chatHeaderElem.appendChild(toggleButton);
