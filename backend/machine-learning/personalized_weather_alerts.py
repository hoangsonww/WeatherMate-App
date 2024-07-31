import pandas as pd
from sklearn.ensemble import RandomForestClassifier

def train_model(weather_data, user_preferences):
    """
    Trains a machine learning model to predict personalized weather alerts based on user preferences and weather data.
    :param weather_data: DataFrame with weather data
    :param user_preferences: DataFrame with user preferences data
    :return: trained model
    """
    # Merge datasets and prepare them for training
    data = pd.merge(weather_data, user_preferences, on='user_id')
    features = data.drop('alert_needed', axis=1)
    labels = data['alert_needed']

    # Train a random forest classifier
    model = RandomForestClassifier()
    model.fit(features, labels)
    return model

def predict(model, weather_data, user_preferences):
    """
    Predicts personalized weather alerts based on user preferences and weather data.
    :param model: trained model
    :param weather_data: DataFrame with weather data
    :param user_preferences: DataFrame with user preferences data
    :return: DataFrame with predictions
    """
    # Merge datasets and prepare them for prediction
    data = pd.merge(weather_data, user_preferences, on='user_id')
    features = data.drop('alert_needed', axis=1)

    # Predict
    predictions = model.predict(features)
    data['alert_needed'] = predictions
    return data

def main():
    # Load weather data
    weather_data = pd.read_csv('weather_data.csv')

    # Load user preferences
    user_preferences = pd.read_csv('user_preferences.csv')

    # Train model
    model = train_model(weather_data, user_preferences)

    # Predict
    predictions = predict(model, weather_data, user_preferences)
    print(predictions)

if __name__ == '__main__':
    main()