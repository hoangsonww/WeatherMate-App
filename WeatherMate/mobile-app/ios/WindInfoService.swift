import Foundation

class WindInfoService {

    let weatherAPIKey: String
    let weatherBaseURL: URL?

    init(APIKey: String) {
        self.weatherAPIKey = APIKey
        weatherBaseURL = URL(string: "https://api.openweathermap.org/data/2.5/weather")
    }

    func getWindInfo(forLatitude lat: Double, longitude lon: Double, completion: @escaping (WindData?) -> Void) {
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
                let decodedData = try JSONDecoder().decode(WindData.self, from: data)
                completion(decodedData)
            } catch {
                completion(nil)
            }
        }.resume()
    }
}

struct WindData: Codable {
    let wind: Wind

    struct Wind: Codable {
        let speed: Double
        let deg: Int
    }
}
