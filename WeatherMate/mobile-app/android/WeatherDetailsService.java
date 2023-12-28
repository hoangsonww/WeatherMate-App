import org.json.JSONObject;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class WeatherDetailsService {

    private static final String API_KEY = "get_from_dot_env";
    private static final String WEATHER_DETAILS_URL = "https://api.openweathermap.org/data/2.5/weather";

    public void getWeatherDetails(double lat, double lon, ResponseListener listener) {
        new Thread(() -> {
            try {
                URL url = new URL(WEATHER_DETAILS_URL + "?lat=" + lat + "&lon=" + lon + "&appid=" + API_KEY);
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                InputStream inputStream = connection.getInputStream();
                inputStream.close();
                JSONObject responseObject = new JSONObject(convertStreamToString(inputStream));
                responseObject = responseObject.getJSONArray("list").getJSONObject(0);
                responseObject = responseObject.getJSONObject("main");
                responseObject.put("aqi", aqi);
                responseObject.put("forecast", forecast);
                responseObject.put("weather", weather);
                responseObject.put("wind", wind);
                responseObject.put("name", name);
                listener.onResponse(responseObject);
                connection.disconnect();
            }
            catch (Exception e) {
                e.printStackTrace();
                listener.onError(e.getMessage());
            }
        }).start();
    }

    private String convertStreamToString(InputStream is) {
        java.util.Scanner s = new java.util.Scanner(is).useDelimiter("\\A");
        return s.hasNext() ? s.next() : "";
    }

    public interface ResponseListener {
        void onResponse(JSONObject response);
        void onError(String error);
    }
}
