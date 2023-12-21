package com.weathermate.weathermate;

import org.json.JSONObject;
import org.json.JSONException;

public class WeatherDataParser {

    private JSONObject weatherData;

    public WeatherDataParser(String jsonData) throws JSONException {
        this.weatherData = new JSONObject(jsonData);
    }

    public double getTemperature() throws JSONException {
        JSONObject main = weatherData.getJSONObject("main");
        return main.getDouble("temp") - 273.15; // Convert Kelvin to Celsius
    }

    public double getFeelsLikeTemperature() throws JSONException {
        JSONObject main = weatherData.getJSONObject("main");
        return main.getDouble("feels_like") - 273.15; // Convert Kelvin to Celsius
    }

    public int getHumidity() throws JSONException {
        JSONObject main = weatherData.getJSONObject("main");
        return main.getInt("humidity");
    }

    public double getWindSpeed() throws JSONException {
        JSONObject wind = weatherData.getJSONObject("wind");
        return wind.getDouble("speed") * 3.6; // Convert m/s to km/h
    }

    public String getWeatherCondition() throws JSONException {
        JSONObject weather = weatherData.getJSONArray("weather").getJSONObject(0);
        return weather.getString("main");
    }

    public String getWeatherDescription() throws JSONException {
        JSONObject weather = weatherData.getJSONArray("weather").getJSONObject(0);
        return weather.getString("description");
    }

    public String getCityName() throws JSONException {
        return weatherData.getString("name");
    }

    public String getCountryCode() throws JSONException {
        JSONObject sys = weatherData.getJSONObject("sys");
        return sys.getString("country");
    }

    public String getIcon() throws JSONException {
        JSONObject weather = weatherData.getJSONArray("weather").getJSONObject(0);
        return weather.getString("icon");
    }

    public String getIconUrl() throws JSONException {
        String icon = getIcon();
        return "https://openweathermap.org/img/w/" + icon + ".png";
    }

    public String getWeatherSunset() throws JSONException {
        JSONObject sys = weatherData.getJSONObject("sys");
        long sunset = sys.getLong("sunset");
        return new java.text.SimpleDateFormat("HH:mm").format(new java.util.Date (sunset * 1000));
    }

    public String getWeatherSunrise() throws JSONException {
        JSONObject sys = weatherData.getJSONObject("sys");
        long sunrise = sys.getLong("sunrise");
        return new java.text.SimpleDateFormat("HH:mm").format(new java.util.Date (sunrise * 1000));
    }

    public String getWeatherForecast() throws JSONException {
        JSONObject weather = weatherData.getJSONArray("weather").getJSONObject(0);
        return weather.getString("main");
    }

    public String getWeatherForecastDescription() throws JSONException {
        JSONObject weather = weatherData.getJSONArray("weather").getJSONObject(0);
        return weather.getString("description");
    }

    public String getLocalTime() throws JSONException {
        long dt = weatherData.getLong("dt");
        return new java.text.SimpleDateFormat("HH:mm").format(new java.util.Date (dt * 1000));
    }

    public String getLocalDate() throws JSONException {
        long dt = weatherData.getLong("dt");
        return new java.text.SimpleDateFormat("dd/MM/yyyy").format(new java.util.Date (dt * 1000));
    }

    public String getWeatherForecastIcon() throws JSONException {
        JSONObject weather = weatherData.getJSONArray("weather").getJSONObject(0);
        return weather.getString("icon");
    }

    public String getWeatherForecastIconUrl() throws JSONException {
        String icon = getWeatherForecastIcon();
        return "https://openweathermap.org/img/w/" + icon + ".png";
    }

}
