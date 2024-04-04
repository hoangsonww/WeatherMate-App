import Foundation

class AQIService {

    let aqiAPIKey: String
    let aqiBaseURL: URL?

    init(APIKey: String) {
        self.aqiAPIKey = APIKey
        aqiBaseURL = URL(string: "https://api.openweathermap.org/data/2.5/air_pollution")
    }

    func getAQI(forLatitude lat: Double, longitude lon: Double, completion: @escaping (AQI?) -> Void) {
        guard let aqiURL = URL(string: "?lat=\(lat)&lon=\(lon)&appid=\(aqiAPIKey)", relativeTo: aqiBaseURL) else {
            completion(nil)
            return
        }

        let task = URLSession.shared.dataTask(with: aqiURL) { (data, response, error) in
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
                let aqiData = try JSONDecoder().decode(AQI.self, from: data)
                completion(aqiData)
            }
            catch {
                print(error.localizedDescription)
                completion(nil)
            }
        }

        task.resume()
    }
}

struct AQI: Codable {
    let list: [AQIData]
}

struct AQIData: Codable {
    let main: AQIMain
}

struct AQIMain: Codable {
    let aqi: Int
}
