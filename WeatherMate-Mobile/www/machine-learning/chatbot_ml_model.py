import nltk
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
import pandas as pd

# Example dataset of user inputs and expected responses
data = {
    'user_input': [
        "What's the weather like today?",
        "Show me the weather forecast",
        "Is it going to rain tomorrow?",
        "I need a weather update",
        "Tell me a weather joke",
        "What's the weather like in London?",
        "What's the weather like in New York?",
        "What's the weather like in Tokyo?",
        "What's the weather like in Paris?",
        "What's the weather like in Berlin?",
        "What's the weather like in Rome?",
        "What's the weather like in Madrid?",
        "What's the weather like in Moscow?",
        "What's the weather like in Beijing?",
        "What's the weather like in Seoul?",
        "What's the weather like in Delhi?",
        "What's the weather like in Mumbai?",
        "What's the weather like in Shanghai?",
        "What's the weather like in Sao Paulo?",
        "What's the weather like in Jakarta?",
        "What's the weather like in Cairo?",
        "What's the weather like in Istanbul?",
        "What's the weather like in Buenos Aires?",
        "What's the weather like in Mexico City?",
        "What's the weather like in Manila?",
        "What's the weather like in Moscow?",
        "What's the weather like in Dhaka?",
    ],
    'bot_response': [
        "Sure, let me check the weather for you.",
        "Displaying the weather forecast.",
        "Checking the rain forecast for tomorrow.",
        "Here's the latest weather update.",
        "Why don't scientists trust atoms? Because they make up everything!",
        "Checking the weather in London.",
        "Checking the weather in New York.",
        "Checking the weather in Tokyo.",
        "Checking the weather in Paris.",
        "Checking the weather in Berlin.",
        "Checking the weather in Rome.",
        "Checking the weather in Madrid.",
        "Checking the weather in Moscow.",
        "Checking the weather in Beijing.",
        "Checking the weather in Seoul.",
        "Checking the weather in Delhi.",
        "Checking the weather in Mumbai.",
        "Checking the weather in Shanghai.",
        "Checking the weather in Sao Paulo.",
        "Checking the weather in Jakarta.",
        "Checking the weather in Cairo.",
        "Checking the weather in Istanbul.",
        "Checking the weather in Buenos Aires.",
        "Checking the weather in Mexico City.",
        "Checking the weather in Manila.",
        "Checking the weather in Moscow.",
        "Checking the weather in Dhaka.",
    ]
}

# Preprocess and train the model
def train_chatbot_model(data):
    nltk.download('wordnet')
    lemmatizer = WordNetLemmatizer()

    # Lemmatize the user inputs for better generalization
    data['lemmatized_input'] = [' '.join([lemmatizer.lemmatize(word) for word in nltk.word_tokenize(sentence)]) for sentence in data['user_input']]

    # Create a pipeline with TF-IDF and Naive Bayes classifier
    model = make_pipeline(TfidfVectorizer(), MultinomialNB())

    # Train the model
    model.fit(data['lemmatized_input'], data['bot_response'])

    return model

# Train the model
chatbot_model = train_chatbot_model(pd.DataFrame(data))

# Function to get response from the model
def get_bot_response(user_input):
    lemmatized_input = ' '.join([lemmatizer.lemmatize(word) for word in nltk.word_tokenize(user_input)])
    response = chatbot_model.predict([lemmatized_input])[0]
    return response

def main():
    # Test the model
    user_query = "Can you tell me about today's weather?"
    response = get_bot_response(user_query)
    print("Bot:", response)
