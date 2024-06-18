import json
import sqlite3
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(filename='weathermate_analysis.log', level=logging.INFO)

# Database Management for Weather Data and User Subscriptions
class WeatherDataManager:
    def __init__(self, db_file):
        self.conn = sqlite3.connect(db_file)
        self.create_tables()

    def create_tables(self):
        cursor = self.conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS weather_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                city TEXT NOT NULL,
                data TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS user_subscriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                city TEXT NOT NULL,
                alert_type TEXT NOT NULL,
                active BOOLEAN DEFAULT TRUE
            );
        ''')
        self.conn.commit()

    def store_weather_data(self, city, data):
        cursor = self.conn.cursor()
        cursor.execute("INSERT INTO weather_data (city, data) VALUES (?, ?)", (city, json.dumps(data)))
        self.conn.commit()

    def retrieve_historical_data(self, city, days_back):
        cursor = self.conn.cursor()
        date_limit = datetime.now() - timedelta(days=days_back)
        cursor.execute("SELECT data FROM weather_data WHERE city = ? AND timestamp >= ?", (city, date_limit))
        return cursor.fetchall()

    def subscribe_user(self, user_id, city, alert_type):
        cursor = self.conn.cursor()
        cursor.execute("INSERT INTO user_subscriptions (user_id, city, alert_type) VALUES (?, ?, ?)", (user_id, city, alert_type))
        self.conn.commit()

    def unsubscribe_user(self, user_id, city, alert_type):
        cursor = self.conn.cursor()
        cursor.execute("UPDATE user_subscriptions SET active = FALSE WHERE user_id = ? AND city = ? AND alert_type = ?", (user_id, city, alert_type))
        self.conn.commit()

    def fetch_subscribers(self, alert):
        cursor = self.conn.cursor()
        cursor.execute("SELECT email FROM user_subscriptions WHERE city = ? AND alert_type = ? AND active = TRUE", (city, alert_type))
        return cursor.fetchall()

# Weather Alert System
class WeatherAlertSystem:
    def __init__(self, db_connection):
        self.db = db_connection

    def check_for_alerts(self, weather_data):
        # Example criteria for alerts
        if weather_data['temperature'] > 30:  # temperature in Celsius
            self.notify_subscribers(f"High temperature alert in {weather_data['city']}")
        elif weather_data['weather'] == 'Heavy Rain':
            self.notify_subscribers(f"Heavy rain alert in {weather_data['city']}")

    def notify_subscribers(self, alert):
        # Fetch subscribers from the database
        subscribers = self.fetch_subscribers(alert)

        for subscriber in subscribers:
            self.send_email(subscriber['email'], "Weather Alert", alert)

    def fetch_subscribers(self, alert):
        # Placeholder for fetching subscriber details from the database
        # Return a list of dictionaries containing subscriber details
        return [{'email': 'subscriber@example.com'}]  # Example

    def send_email(self, to_email, subject, message):
        msg = MIMEMultipart()
        msg['From'] = self.email_settings['email']
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(message, 'plain'))

        try:
            server = smtplib.SMTP(self.email_settings['smtp_server'], self.email_settings['smtp_port'])
            server.starttls()  # Secure the connection
            server.login(self.email_settings['email'], self.email_settings['password'])
            text = msg.as_string()
            server.sendmail(self.email_settings['email'], to_email, text)
            server.quit()
            print(f"Alert email sent to {to_email}")
        except Exception as e:
            print(f"Failed to send email: {str(e)}")

# Flask App Setup
app = Flask(__name__)

# Email settings
email_settings = {
    'email': 'hoangson091104@gmail.com',
    'password': '123456789',
    'smtp_server': 'smtp.example.com',
    'smtp_port': 587
}

# Initialize the alert system with email settings
alert_system = WeatherAlertSystem(db_connection, email_settings)

# Initialize the data manager and alert system
data_manager = WeatherDataManager('weathermate.db')
alert_system = WeatherAlertSystem(data_manager.conn)

@app.route('/weather', methods=['POST'])
def store_weather():
    data = request.json
    city = data['city']
    data_manager.store_weather_data(city, data)
    alert_system.check_for_alerts(data)
    return jsonify({"message": "Weather data stored successfully."})

@app.route('/weather/historical', methods=['GET'])
def historical_weather():
    city = request.args.get('city')
    days_back = int(request.args.get('days', 7))
    historical_data = data_manager.retrieve_historical_data(city, days_back)
    return jsonify({"city": city, "historical_data": historical_data})

if __name__ == '__main__':
    app.run(debug=True)
