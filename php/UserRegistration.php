<?php
include 'config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST["username"];
    $password = password_hash($_POST["password"], PASSWORD_DEFAULT);
    $email = $_POST["email"];

    try {
        $stmt = $conn->prepare("INSERT INTO users (username, password, email) VALUES (?, ?, ?)");
        $stmt->execute([$username, $password, $email]);
        echo "User registered successfully";
    }
    catch(PDOException $e) {
        echo "Error: " . $e->getMessage();
    }
}

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    $username = $_GET["username"];
    $password = $_GET["password"];

    try {
        $stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (password_verify($password, $user["password"])) {
            echo "Login successful";
        } else {
            echo "Login failed";
        }
    }
    catch(PDOException $e) {
        echo "Error: " . $e->getMessage();
    }
}
?>
