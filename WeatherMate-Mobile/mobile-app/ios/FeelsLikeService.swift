import Foundation

class FeelsLikeService {

    let weatherAPIKey: String
    let weatherBaseURL: URL?

    init(APIKey: String) {
        self.weatherAPIKey = APIKey
        weatherBaseURL = URL(string: "https://api.openweathermap.org/data/2.5/weather")
    }

    func getFeelsLikeInfo(forLatitude lat: Double, longitude lon: Double, completion: @escaping (FeelsLikeData?) -> Void) {
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
                let decodedData = try JSONDecoder().decode(FeelsLikeData.self, from: data)
                completion(decodedData)
            }
            catch {
                completion(nil)
            }
        }.resume()
    }
}

struct FeelsLikeData: Codable {
    let main: Main

    struct Main: Codable {
        let feels_like: Double
    }
}
