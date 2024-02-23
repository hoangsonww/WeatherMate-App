import requests
import json

class WeatherMateBackend:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_weather_url = "https://api.openweathermap.org/data/2.5/weather"
        self.base_forecast_url = "https://api.openweathermap.org/data/2.5/forecast"
        self.base_air_quality_url = "https://api.openweathermap.org/data/2.5/air_pollution"
        self.user_preferences = {}  # Store user preferences like temperature unit and favorite cities

    def fetch_weather_by_city(self, city_name):
        """Fetch weather data for a given city."""
        params = {
            'q': city_name,
            'appid': self.api_key,
            'units': 'metric'  # Default units, can be changed based on user preference
        }
        response = requests.get(self.base_weather_url, params=params)
        return response.json()

    def fetch_weather_by_coordinates(self, latitude, longitude):
        """Fetch weather data for a given set of coordinates."""
        params = {
            'lat': latitude,
            'lon': longitude,
            'appid': self.api_key,
            'units': 'metric'
        }
        response = requests.get(self.base_weather_url, params=params)
        return response.json()

    def fetch_forecast_by_city(self, city_name):
        """Fetch weather forecast for a given city."""
        params = {
            'q': city_name,
            'appid': self.api_key,
            'units': 'metric'
        }
        response = requests.get(self.base_forecast_url, params=params)
        return response.json()

    def fetch_air_quality_by_coordinates(self, latitude, longitude):
        """Fetch air quality index for a given set of coordinates."""
        params = {
            'lat': latitude,
            'lon': longitude,
            'appid': self.api_key
        }
        response = requests.get(self.base_air_quality_url, params=params)
        return response.json()

    def set_user_preference(self, user_id, preference, value):
        """Set a user's preference (e.g., temperature unit, favorite cities)."""
        if user_id not in self.user_preferences:
            self.user_preferences[user_id] = {}
        self.user_preferences[user_id][preference] = value

    def get_user_preference(self, user_id, preference):
        """Get a user's preference."""
        return self.user_preferences.get(user_id, {}).get(preference, None)

    def convert_temperature(self, temp, to_celsius=True):
        """Convert temperature between Celsius and Fahrenheit."""
        if to_celsius:
            return (temp - 32) * 5.0/9.0
        else:
            return (temp * 9.0/5.0) + 32