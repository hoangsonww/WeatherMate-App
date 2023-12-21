import UIKit
import CoreLocation

class WeatherViewController: UIViewController, CLLocationManagerDelegate {

    @IBOutlet weak var temperatureLabel: UILabel!
    @IBOutlet weak var humidityLabel: UILabel!
    @IBOutlet weak var windSpeedLabel: UILabel!
    @IBOutlet weak var cityNameLabel: UILabel!
    @IBOutlet weak var weatherIconImageView: UIImageView!

    let locationManager = CLLocationManager()
    var currentLocation: CLLocation?
    var weatherData: WeatherData?

    override func viewDidLoad() {
        super.viewDidLoad()
        locationManager.delegate = self
        locationManager.requestWhenInUseAuthorization()
        locationManager.startUpdatingLocation()
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        if let location = locations.first {
            currentLocation = location
            locationManager.stopUpdatingLocation()
            fetchWeatherData()
        }
    }

    func fetchWeatherData() {
        guard let currentLocation = currentLocation else { return }
        let lat = currentLocation.coordinate.latitude
        let lon = currentLocation.coordinate.longitude
        let urlStr = "https://api.openweathermap.org/data/2.5/weather?lat=\(lat)&lon=\(lon)&appid=YOUR_API_KEY"
        guard let url = URL(string: urlStr) else { return }

        let task = URLSession.shared.dataTask(with: url) { data, response, error in
            guard let data = data, error == nil else { return }
            do {
                let decoder = JSONDecoder()
                self.weatherData = try decoder.decode(WeatherData.self, from: data)
                DispatchQueue.main.async {
                    self.updateUI()
                }
            } catch {
                print("Error decoding weather data: \(error)")
            }
        }
        task.resume()
    }

    func updateUI() {
        if let weatherData = weatherData {
            temperatureLabel.text = "Temperature: \(weatherData.main.temp)°"
            humidityLabel.text = "Humidity: \(weatherData.main.humidity)%"
            windSpeedLabel.text = "Wind Speed: \(weatherData.wind.speed) km/h"
            cityNameLabel.text = weatherData.name
            updateWeatherIcon(for: weatherData.weather[0].main)
        }
    }

    func updateWeatherIcon(for weatherCondition: String) {
        switch weatherCondition {
        case "Clear":
            weatherIconImageView.image = UIImage(named: "clear")
        case "Clouds":
            weatherIconImageView.image = UIImage(named: "cloudy")
        case "Rain":
            weatherIconImageView.image = UIImage(named: "rainy")
        case "Snow":
            weatherIconImageView.image = UIImage(named: "snowy")
        case "Thunderstorm":
            weatherIconImageView.image = UIImage(named: "thunderstorm")
        case "Drizzle":
            weatherIconImageView.image = UIImage(named: "drizzle")
        default:
            weatherIconImageView.image = UIImage(named: "default")
        }
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Failed to find user's location: \(error.localizedDescription)")
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        if let location = locations.first {
            currentLocation = location
            locationManager.stopUpdatingLocation()
            fetchWeatherData()
        }
    }
}

struct WeatherData: Codable {
    let name: String
    let main: Main
    let weather: [Weather]
    let wind: Wind
}

struct Main: Codable {
    let temp: Double
    let humidity: Int
}

struct Weather: Codable {
    let main: String
}

struct Wind: Codable {
    let speed: Double
}

struct WeatherData: Codable {
    let name: String
    let main: Main
    let weather: [Weather]
    let wind: Wind
}

struct Main: Codable {
    let temp: Double
    let humidity: Int
}