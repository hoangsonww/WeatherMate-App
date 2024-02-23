import requests
import sqlite3
import json
import schedule
import time
from datetime import datetime

# Database Configuration
DATABASE_FILE = "weathermate.db"

# Weather API Configuration
WEATHER_API_URL = "http://api.openweathermap.org/data/2.5/weather"

# Initialize database connection
conn = sqlite3.connect(DATABASE_FILE)
cursor = conn.cursor()

# Create tables
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL
)
''')
cursor.execute('''
CREATE TABLE IF NOT EXISTS weather_data (
    id INTEGER PRIMARY KEY,
    city TEXT NOT NULL,
    data TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')
cursor.execute('''
CREATE TABLE IF NOT EXISTS weather_data_history (
    id INTEGER PRIMARY KEY,
    city TEXT NOT NULL,
    data TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')
cursor.execute('''
CREATE TABLE IF NOT EXISTS weather_data_history (
    id INTEGER PRIMARY KEY,
    city TEXT NOT NULL,
    data TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')
conn.commit()

# User Management
def register_user(username, password, email):
    try:
        cursor.execute("INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
                       (username, password, email))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False

def get_user(username):
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    result = cursor.fetchone()
    return result

def get_user_by_email(email):
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    result = cursor.fetchone()
    return result

def get_user_by_id(user_id):
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    result = cursor.fetchone()
    return result

def validate_user(username, password):
    cursor.execute("SELECT password FROM users WHERE username = ?", (username,))
    result = cursor.fetchone()
    return result and result[0] == password

# Weather Data Management
def fetch_weather_data(city):
    params = {
        'q': city,
        'appid': WEATHER_API_URL
    }
    response = requests.get(WEATHER_API_URL, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return None

def store_weather_data(city, data):
    cursor.execute("INSERT INTO weather_data (city, data) VALUES (?, ?)",
                   (city, json.dumps(data)))
    conn.commit()

def store_weather_data_history(city, data):
    cursor.execute("INSERT INTO weather_data_history (city, data) VALUES (?, ?)",
                   (city, json.dumps(data)))
    conn.commit()

def store_weather_data_for_all_cities(data):
    cities = ['London', 'New York', 'Tokyo']  # Example cities
    for city in cities:
        store_weather_data(city, data)

def store_weather_data_history_for_all_cities(data):
    cities = ['London', 'New York', 'Tokyo']  # Example cities
    for city in cities:
        store_weather_data_history(city, data)

# Scheduled Task
def update_weather():
    cities = ['London', 'New York', 'Tokyo']  # Example cities
    for city in cities:
        data = fetch_weather_data(city)
        if data:
            store_weather_data(city, data)
            print(f"Weather data updated for {city}")
        else:
            print(f"Weather data not updated for {city}")

def update_weather_for_city(city):
    data = fetch_weather_data(city)
    if data:
        store_weather_data(city, data)
        print(f"Weather data updated for {city}")
    else:
        print(f"Weather data not updated for {city}")

def update_weather_for_all_cities():
    cities = ['London', 'New York', 'Tokyo']  # Example cities
    for city in cities:
        update_weather_for_city(city)

# Schedule the task to run every hour
schedule.every(1).hour.do(update_weather)

# API Endpoints
def get_weather_data(city):
    cursor.execute("SELECT data FROM weather_data WHERE city = ?", (city,))
    result = cursor.fetchone()
    return json.loads(result[0]) if result else None

def get_weather_data_for_all_cities():
    cursor.execute("SELECT data FROM weather_data")
    result = cursor.fetchall()
    return [json.loads(row[0]) for row in result]

def get_weather_data_for_all_cities_since(timestamp):
    cursor.execute("SELECT data FROM weather_data WHERE timestamp >= ?", (timestamp,))
    result = cursor.fetchall()
    return [json.loads(row[0]) for row in result]

def get_weather_data_for_city_since(city, timestamp):
    cursor.execute("SELECT data FROM weather_data WHERE city = ? AND timestamp >= ?", (city, timestamp))
    result = cursor.fetchone()
    return json.loads(result[0]) if result else None

def get_weather_data_for_city_between(city, start_timestamp, end_timestamp):
    cursor.execute("SELECT data FROM weather_data WHERE city = ? AND timestamp BETWEEN ? AND ?", (city, start_timestamp, end_timestamp))
    result = cursor.fetchall()
    return [json.loads(row[0]) for row in result]

def get_weather_data_for_all_cities_between(start_timestamp, end_timestamp):
    cursor.execute("SELECT data FROM weather_data WHERE timestamp BETWEEN ? AND ?", (start_timestamp, end_timestamp))
    result = cursor.fetchall()
    return [json.loads(row[0]) for row in result]

# Main
if __name__ == '__main__':
    # Example Usage
    register_user('alice', 'password123', 'alice@example.com')
    print(validate_user('alice', 'password123'))

    # Start the scheduled tasks
    while True:
        schedule.run_pending()
        time.sleep(1)
