<?php
$host = 'localhost';
$dbname = 'weathermate';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}
catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

if (isset($_POST['submit'])) {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $message = $_POST['message'];

    try {
        $sql = "INSERT INTO contact (name, email, message) VALUES ('$name', '$email', '$message')";
        $pdo->exec($sql);
        echo "Message sent successfully";
    }
    catch (PDOException $e) {
        die("Message sending failed: " . $e->getMessage());
    }
}

if (isset($_POST['submit2'])) {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $message = $_POST['message'];

    try {
        $sql = "INSERT INTO subscribe (name, email, message) VALUES ('$name', '$email', '$message')";
        $pdo->exec($sql);
        echo "Message sent successfully";
    }
    catch (PDOException $e) {
        die("Message sending failed: " . $e->getMessage());
    }
}
?>
