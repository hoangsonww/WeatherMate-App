import Foundation

class ForecastService {

    let forecastAPIKey: String
    let forecastBaseURL: URL?

    init(APIKey: String) {
        self.forecastAPIKey = APIKey
        forecastBaseURL = URL(string: "https://api.openweathermap.org/data/2.5/forecast")
    }

    func getForecast(forLatitude lat: Double, longitude lon: Double, completion: @escaping (Forecast?) -> Void) {
        guard let forecastURL = URL(string: "?lat=\(lat)&lon=\(lon)&appid=\(forecastAPIKey)", relativeTo: forecastBaseURL) else {
            completion(nil)
            return
        }

        let task = URLSession.shared.dataTask(with: forecastURL) { (data, response, error) in
            if let error = error {
                print(error.localizedDescription)
                completion(nil)
                return
            }

            guard let data = data else {
                completion(nil)
                return
            }

            do {
                let forecastData = try JSONDecoder().decode(Forecast.self, from: data)
                completion(forecastData)
            } catch {
                print(error.localizedDescription)
                completion(nil)
            }
        }

        task.resume()
    }
}

struct Forecast: Codable {
    let list: [ForecastData]
}

struct ForecastData: Codable {
    let dt: Int
    let main: MainClass
    let weather: [Weather]
}

struct MainClass: Codable {
    let temp: Double
}

struct Weather: Codable {
    let description: String
    let icon: String
}
