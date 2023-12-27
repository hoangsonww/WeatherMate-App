package com.weathermate.weathermate;

import android.os.Bundle;
import android.os.AsyncTask;
import android.widget.TextView;
import android.view.View;
import org.json.JSONObject;
import org.json.JSONException;
import java.io.IOException;
import java.net.URL;
import java.net.HttpURLConnection;
import java.io.InputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import androidx.appcompat.app.AppCompatActivity;

public class WeatherActivity extends AppCompatActivity {

    private TextView temperatureTextView;
    private TextView humidityTextView;
    private TextView windSpeedTextView;
    private TextView cityNameTextView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_weather);

        temperatureTextView = findViewById(R.id.temperature_text_view);
        humidityTextView = findViewById(R.id.humidity_text_view);
        windSpeedTextView = findViewById(R.id.wind_speed_text_view);
        cityNameTextView = findViewById(R.id.city_name_text_view);

        new FetchWeatherTask().execute("city");
    }

    private class FetchWeatherTask extends AsyncTask<String, Void, String> {

        @Override
        protected String doInBackground(String... params) {
            String city = params[0];
            String apiKey = "xxx";
            String urlString = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey;

            try {
                URL url = new URL(urlString);
                HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
                InputStream inputStream = urlConnection.getInputStream();
                BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));

                StringBuilder stringBuilder = new StringBuilder();
                String line;
                while ((line = bufferedReader.readLine()) != null) {
                    stringBuilder.append(line);
                }

                return stringBuilder.toString();

            }
            catch (IOException e) {
                e.printStackTrace();
                return null;
            }
        }

        @Override
        protected void onPostExecute(String s) {
            super.onPostExecute(s);
            if (s != null) {
                try {
                    JSONObject jsonObject = new JSONObject(s);

                    double temperature = jsonObject.getJSONObject("main").getDouble("temp") - 273.15; // Kelvin to Celsius
                    int humidity = jsonObject.getJSONObject("main").getInt("humidity");
                    double windSpeed = jsonObject.getJSONObject("wind").getDouble("speed") * 3.6; // m/s to km/h

                    temperatureTextView.setText(String.format("%.2f°C", temperature));
                    humidityTextView.setText(humidity + "%");
                    windSpeedTextView.setText(String.format("%.2f km/h", windSpeed));
                    cityNameTextView.setText(jsonObject.getString("name"));

                }
                catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    private class fetchForecastTask extends AsyncTask<String, Void, String> {

        @Override
        protected String doInBackground(String... params) {
            String city = params[0];
            String apiKey = "xxx";
            String urlString = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=" + apiKey;

            try {
                URL url = new URL(urlString);
                HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
                InputStream inputStream = urlConnection.getInputStream();
                BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));

                StringBuilder stringBuilder = new StringBuilder();
                String line;
                while ((line = bufferedReader.readLine()) != null) {
                    stringBuilder.append(line);
                }

                return stringBuilder.toString();

            }
            catch (IOException e) {
                e.printStackTrace();
                return null;
            }
        }

        @Override
        protected void onPostExecute(String s) {
            super.onPostExecute(s);
            if (s != null) {
                try {
                    JSONObject jsonObject = new JSONObject(s);
                }
                catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    private void refreshWeather(View view) {
        new FetchWeatherTask().execute(view);
    }

}
