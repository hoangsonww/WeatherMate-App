<?php
include 'db_config.php';

function getWeatherForecast($city) {
    $apiKey = 'YOUR_API_KEY'; // Replace with your API key
    $apiUrl = "http://api.openweathermap.org/data/2.5/weather?q=$city&appid=$apiKey";

    $response = file_get_contents($apiUrl);
    return json_decode($response, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $city = $_GET['city']; // Example: get city from query parameter
    $forecast = getWeatherForecast($city);
    echo json_encode($forecast);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $city = $_POST['city']; // Example: get city from form data
    $forecast = getWeatherForecast($city);
    echo json_encode($forecast);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    parse_str(file_get_contents("php://input"), $put_vars);
    $city = $put_vars['city']; // Example: get city from PUT data
    $forecast = getWeatherForecast($city);
    echo json_encode($forecast);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents("php://input"), $delete_vars);
    $city = $delete_vars['city']; // Example: get city from DELETE data
    $forecast = getWeatherForecast($city);
    echo json_encode($forecast);
}
?>
```
