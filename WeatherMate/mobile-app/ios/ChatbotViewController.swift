import Foundation
import UIKit

class ChatbotViewController: UIViewController, UITextFieldDelegate {
    // UI Elements
    var chatTextField: UITextField!
    var sendButton: UIButton!
    var chatDisplay: UITextView!

    // Networking
    let weatherAPIKey = "YOUR_API_KEY" // Not published to GitHub
    var lastSearchedCity: String?

    // View Did Load
    override func viewDidLoad() {
        super.viewDidLoad()

        setupUI()
        chatTextField.delegate = self
    }

    // Set up UI
    private func setupUI() {
        chatTextField = UITextField()
        chatTextField.translatesAutoresizingMaskIntoConstraints = false
        chatTextField.placeholder = "Type a message..."
        chatTextField.borderStyle = .roundedRect
        chatTextField.returnKeyType = .send
        view.addSubview(chatTextField)

        sendButton = UIButton()
        sendButton.translatesAutoresizingMaskIntoConstraints = false
        sendButton.setTitle("Send", for: .normal)
        sendButton.setTitleColor(.systemBlue, for: .normal)
        sendButton.addTarget(self, action: #selector(sendMessage), for: .touchUpInside)
        view.addSubview(sendButton)

        chatDisplay = UITextView()
        chatDisplay.translatesAutoresizingMaskIntoConstraints = false
        chatDisplay.isEditable = false
        chatDisplay.isScrollEnabled = true
        chatDisplay.font = UIFont.systemFont(ofSize: 16)
        view.addSubview(chatDisplay)

        NSLayoutConstraint.activate([
            chatTextField.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor, constant: 16),
            chatTextField.trailingAnchor.constraint(equalTo: sendButton.leadingAnchor, constant: -16),
            chatTextField.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -16),
            chatTextField.heightAnchor.constraint(equalToConstant: 40),

            sendButton.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -16),
            sendButton.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -16),
            sendButton.heightAnchor.constraint(equalToConstant: 40),
            sendButton.widthAnchor.constraint(equalToConstant: 60),

            chatDisplay.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 16),
            chatDisplay.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor, constant: 16),
            chatDisplay.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -16),
            chatDisplay.bottomAnchor.constraint(equalTo: chatTextField.topAnchor, constant: -16)
        ])

        // Add a tap gesture recognizer to dismiss the keyboard
        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(dismissKeyboard))
        view.addGestureRecognizer(tapGesture)
    }

    // UITextFieldDelegate method
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        textField.resignFirstResponder()
        sendMessage()
        return true
    }

    // Send Button Action
    @objc private func sendMessage() {
        guard let message = chatTextField.text, !message.isEmpty else { return }
        displayUserMessage(message)
        handleUserMessage(message)
        chatTextField.text = ""
    }

    // Display User's Message
    private func displayUserMessage(_ message: String) {
        chatDisplay.text += "You: \(message)\n"
    }

    // Handle User's Message
    private func handleUserMessage(_ message: String) {
        if message.lowercased().starts(with: "weather in ") {
            let city = String(message.dropFirst("weather in ".count))
            fetchWeatherForCity(city)
        }
        else {
            let response = generateChatbotResponse(to: message)
            displayChatbotMessage(response)
        }
    }

    // Fetch Weather Data
    private func fetchWeatherForCity(_ city: String) {
        fetchWeatherForCity(city, completion: { [weak self] weatherData in
            guard let self = self else { return }
            guard let weatherData = weatherData else {
                self.displayChatbotMessage("Sorry, I couldn't find weather data for \(city).")
                return
            }
            self.lastSearchedCity = city
            self.displayWeatherData(weatherData)
        })
    }

    // Display Chatbot's Message
    private func displayChatbotMessage(_ message: String) {
        chatDisplay.text += "Chatbot: \(message)\n"
    }

    // Generate Chatbot Response
    private func generateChatbotResponse(to userMessage: String) -> String {
        let userMessage = userMessage.lowercased()
        if userMessage.contains("weather") {
            if let lastSearchedCity = lastSearchedCity {
                return "The weather in \(lastSearchedCity) is \(weatherData.main.temp)°C."
            } else {
                return "Sorry, I don't know the weather."
            }
        } else if userMessage.contains("hello") {
            return "Hello there!"
        } else if userMessage.contains("how are you") {
            return "I'm doing well, thanks for asking!"
        } else if userMessage.contains("what's your name") {
            return "My name is Chatbot."
        } else if userMessage.contains("what's the time") {
            let formatter = DateFormatter()
            formatter.dateFormat = "h:mm a"
            return "It's \(formatter.string(from: Date()))"
        } else if userMessage.contains("what's the date") {
            let formatter = DateFormatter()
            formatter.dateFormat = "MMMM d, yyyy"
            return "It's \(formatter.string(from: Date()))"
        } else if userMessage.contains("what's the weather") {
            return "The weather is \(weatherData.main.temp)°C."
        } else if userMessage.contains("what's the weather like") {
            return "The weather is \(weatherData.main.temp)°C."
        } else if userMessage.contains("what's the weather like today") {
            return "The weather is \(weatherData.main.temp)°C."
        } else if userMessage.contains("what's the weather like right now") {
            return "The weather is \(weatherData.main.temp)°C."
        } else if userMessage.contains("what's the weather like outside") {
            return "The weather is \(weatherData.main.temp)°C."
        } else if userMessage.contains("what's the weather like outside right now") {
            return "The weather is \(weatherData.main.temp)°C."
        } else if userMessage.contains("what's the weather like outside today") {
            return "The weather is \(weatherData.main.temp)°C."
        } else if userMessage.contains("what's the weather like in ") {
            let city = String(userMessage.dropFirst("what's the weather like in ".count))
            fetchWeatherForCity(city)
            return "The weather is \(weatherData.main.temp)°C."
        } else {
            return "Sorry, I didn't understand that."
        }
    }
}

// Networking and Parsing Extensions
extension ChatbotViewController {
    var chatbot = Chatbot();
}
