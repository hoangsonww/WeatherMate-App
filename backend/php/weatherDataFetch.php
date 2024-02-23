<?php
include 'config.php';

$city = 'city_name';
$apiKey = 'none';
$apiUrl = "http://api.openweathermap.org/data/2.5/weather?q=$city&appid=$apiKey";

$weatherData = file_get_contents($apiUrl);
$weatherData = json_decode($weatherData, true);

try {
    $stmt = $conn->prepare("INSERT INTO weather_data (city, data) VALUES (?, ?)");
    $stmt->execute([$city, json_encode($weatherData)]);
    echo "Weather data stored successfully";
}
catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}

$conn = null;

?>
