import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

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
        const genAI = new GoogleGenerativeAI(getAIResponse());
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "You are an AI personal assistant for Son Nguyen. Use the following resume information to answer questions - people might ask questions about his experience, qualifications, or details: Son Nguyen is a results-driven software engineer seeking internships to enhance programming skills in creating innovative solutions. Experienced in contributing to large-scale projects, with a focus on efficiency and user experience. Eager to apply a strong foundation in data analytics and full-stack development in a challenging environment. Committed to continuous learning and adapting to new technologies. Contact information: +1 (413) 437-6759, hoangson091104@gmail.com, Portfolio Website: sonnguyenhoang.com, LinkedIn: linkedin.com/in/hoangsonw, GitHub: github.com/hoangsonww, Location: Chapel Hill, NC, USA 27514. Experience 1: VNG Corporation (Software Engineering Intern from June 2023 to August 2023) - Contributed to the design and development of vCloudcam’s security camera management website using Angular, React, and Beego, boosting site performance by 30%, and supporting user traffic of over 50,000 monthly visits. Enhanced the video fetching system using Web Assembly, improving live security camera stream efficiency by 20%. Experience 2: Huong Hua Co., Ltd. (Contract Full-Stack Software Engineer from December 2023 to February 2024) - Developed the company’s web application and job application database using PHP, React, Django, MongoDB, and MySQL. Experience 3: FPT Corporation (Software Engineering Intern - from June 2024 to August 2024) Contributed to the development of FPT ICDP, FPT Telecom’s internal communication platform, using Express, Node.js, MongoDB, RabbitMQ, Kafka, Redis, and React, enhancing collaboration and communication between FPT teams by 25%. Participated in AI initiatives, utilizing TensorFlow, PyTorch, and Optuna for a 15% improvement in ICDP’s AI model fine-tuning and optimization. Deployed using Docker & AWS Lambda, enhancing operational efficiency by 40%, handling over 50,000 users, and managing approximately 200 job applications per month. Education: University of North Carolina at Chapel Hill - Bachelor of Science in Computer Science & Bachelor of Artsin Economics & Data Science Minor (Cumulative GPA: 3.9 / 4.0) - Date Attended: August 2022 - December 2025. NOTABLE PROJECTS: MovieVerse (movie-verse.com): An extensive web-based movie database featuring detailed information on 900,000+ movies & TV shows and over 1 million actors & directors. Currently attracting over 320,000 monthly visitors, with more than 55,000 active users and 145,000 movie ratings to date. WeatherMate (hoangsonww.github.io/WeatherMate-App): A user-friendly weather tracking app that offers real-time weather and detailed forecast data for more than 200,000 locations worldwide. Currently attracting over 1,000 monthly visitors. AI Multitask Classifiers (hoangsonww.github.io/AI-ML-Classifiers/): Python-based AI classifiers for Object, Face, Mood, Vehicle, Flower, and Speech Recognition, utilizing OpenCV, Keras, Pandas, TensorFlow, YOLOv3, and PyTorch. Includes a self-trained custom sentiment analysis tool with an average accuracy of over 90%. SKILLS: Languages: Java, Python, JavaScript, Swift, C, Go, PHP. Databases: MySQL, MongoDB, Redis, PostgreSQL, Red5. Data Analytics: PowerBI, Tableau, Stata, R. Web Development: React, Vue, Angular, WASM, jQuery, Webpack, Django, Express, REST APIs. AI/ML: TensorFlow, PyTorch, Keras, NLP, Pandas, OCR,scikit-learn. Other: SEO, Docker, Git, RabbitMQ.",
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
    } catch (error) {
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

const chatInput = document.querySelector(".chat-input");
const chatMessages = document.querySelector(".chat-messages");

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

        setTimeout(async () => {
            const response = await getBotResponse(question);
            const elizaMsgElem = document.createElement("div");
            elizaMsgElem.innerText = `Eliza: ${response}`;
            chatMessages.appendChild(elizaMsgElem);
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
