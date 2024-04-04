import Foundation

class HumidityRainService {

    let weatherAPIKey: String
    let weatherBaseURL: URL?

    init(APIKey: String) {
        self.weatherAPIKey = APIKey
        weatherBaseURL = URL(string: "https://api.openweathermap.org/data/2.5/weather")
    }

    func getHumidityAndRain(forLatitude lat: Double, longitude lon: Double, completion: @escaping (HumidityRainData?) -> Void) {
        guard let weatherURL = URL(string: "?lat=\(lat)&lon=\(lon)&appid=\(weatherAPIKey)", relativeTo: weatherBaseURL) else {
            completion(nil)
            return
        }

        URLSession.shared.dataTask(with: weatherURL) { data, response, error in
            guard let data = data, error == nil else {
                completion(nil)
                return
            }
            do {
                let decodedData = try JSONDecoder().decode(HumidityRainData.self, from: data)
                completion(decodedData)
            }
            catch {
                completion(nil)
            }
        }.resume()
    }
}

struct HumidityRainData: Codable {
    let main: Main
    let rain: Rain?

    struct Main: Codable {
        let humidity: Double
    }

    struct Rain: Codable {
        let lastHour: Double?

        enum CodingKeys: String, CodingKey {
            case lastHour = "1h"
        }
    }
}
