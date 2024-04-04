import UIKit

class FavoritesViewController: UIViewController, UITableViewDelegate, UITableViewDataSource {
    // UI Elements
    var favoritesTableView: UITableView!

    // Data
    var favoriteCities: [String] {
        get {
            UserDefaults.standard.stringArray(forKey: "favoriteCities") ?? []
        }
        set {
            UserDefaults.standard.set(newValue, forKey: "favoriteCities")
        }
    }

    // View Did Load
    override func viewDidLoad() {
        super.viewDidLoad()
        setupTableView()
    }

    // Set up TableView
    private func setupTableView() {
        favoritesTableView = UITableView()
        favoritesTableView.delegate = self
        favoritesTableView.dataSource = self
        view.addSubview(favoritesTableView)

        favoritesTableView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            favoritesTableView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            favoritesTableView.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor),
            favoritesTableView.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor),
            favoritesTableView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor)
        ])

        favoritesTableView.register(UITableViewCell.self, forCellReuseIdentifier: "FavoriteCityCell")
    }

    // TableView DataSource Methods
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return favoriteCities.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "FavoriteCityCell", for: indexPath)
        cell.textLabel?.text = favoriteCities[indexPath.row]
        return cell
    }

    // TableView Delegate Methods
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let selectedCity = favoriteCities[indexPath.row]
        fetchWeatherData(for: selectedCity)
    }

    func tableView(_ tableView: UITableView, commit editingStyle: UITableViewCell.EditingStyle, forRowAt indexPath: IndexPath) {
        if editingStyle == .delete {
            favoriteCities.remove(at: indexPath.row)
            tableView.deleteRows(at: [indexPath], with: .fade)
        }
    }

    // Add City to Favorites
    func addCityToFavorites(city: String) {
        if !favoriteCities.contains(city) {
            favoriteCities.append(city)
            favoritesTableView.reloadData()
        }
    }

    // Remove City from Favorites
    func removeCityFromFavorites(city: String) {
        if let index = favoriteCities.firstIndex(of: city) {
            favoriteCities.remove(at: index)
            favoritesTableView.reloadData()
        }
    }

    // Fetch Weather Data
    func weatherDataReceived(weatherData: WeatherData) {
        DispatchQueue.main.async {
            self.addCityToFavorites(city: weatherData.name)
        }
    }
}
