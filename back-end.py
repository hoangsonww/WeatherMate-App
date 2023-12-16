import requests
import sqlite3
import logging
from flask import Flask, request, jsonify, Response
from werkzeug.security import generate_password_hash, check_password_hash
import asyncio
import aiohttp
from apscheduler.schedulers.background import BackgroundScheduler
from functools import wraps
from cachetools import TTLCache

# Configure logging
logging.basicConfig(filename='weathermate.log', level=logging.INFO)

# API Key and Endpoint
API_KEY = "cxccx"
WEATHER_API_ENDPOINT = "http://api.weatherapi.com/v1/current.json"

# Backend API Integration
class WeatherMateBackend:
    def __init__(self, api_key):
        self.api_key = api_key

    async def fetch_weather_async(self, city_name):
        async with aiohttp.ClientSession() as session:
            params = {'key': self.api_key, 'q': city_name}
            async with session.get(WEATHER_API_ENDPOINT, params=params) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    raise Exception("API request failed")

# User Management with Authentication
class UserManager:
    def __init__(self, db_connection):
        self.db = db_connection

    def create_user(self, username, password):
        hashed_password = generate_password_hash(password)
        cursor = self.db.cursor()
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed_password))
        self.db.commit()

    def authenticate_user(self, username, password):
        cursor = self.db.cursor()
        cursor.execute("SELECT password FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        if user:
            return check_password_hash(user[0], password)
        return False

# Database Management
class DatabaseManager:
    def __init__(self, db_file):
        self.conn = sqlite3.connect(db_file)
        self.create_tables()

    def create_tables(self):
        cursor = self.conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS weather_data (
                city TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ''')
        self.conn.commit()

    def update_weather_data(self, city, data):
        cursor = self.conn.cursor()
        cursor.execute('''
            INSERT INTO weather_data (city, data) VALUES (?, ?)
            ON CONFLICT(city) DO UPDATE SET data = excluded.data, last_updated = CURRENT_TIMESTAMP;
        ''', (city, data))
        self.conn.commit()

# Error Handling Function
def handle_exception(exception):
    logging.error(f"Exception occurred: {exception}")

# Flask App Setup with Authentication
app = Flask(__name__)

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not user_manager.authenticate_user(auth.username, auth.password):
            return Response('Unauthorized', 401, {'WWW-Authenticate': 'Basic realm="Login Required"'})
        return f(*args, **kwargs)
    return decorated

@app.route('/weather', methods=['GET'])
@requires_auth
async def get_weather():
    city = request.args.get('city')
    weather_data = await weather_backend.fetch_weather_async(city)
    return jsonify(weather_data)

# Cache Implementation
cache = TTLCache(maxsize=100, ttl=3600)  # 100 items, 1 hour TTL

# Scheduled Tasks for Data Update
async def scheduled_weather_updates():
    cities = ["New York", "London", "Tokyo"]  # Example cities
    for city in cities:
        weather_data = await weather_backend.fetch_weather_async(city)
        # Update weather data in the database and cache
        db_manager.update_weather_data(city, json.dumps(weather_data))
        cache[city] = weather_data

# Main Execution Setup
def main():
    global user_manager, weather_backend, db_manager
    db_manager = DatabaseManager('weathermate.db')
    user_manager = UserManager(db_manager)
    weather_backend = WeatherMateBackend(API_KEY)

    scheduler = BackgroundScheduler()
    scheduler.add_job(lambda: asyncio.run(scheduled_weather_updates()), 'interval', hours=1)
    scheduler.start()

    app.run(debug=True)

if __name__ == "__main__":
    main()
