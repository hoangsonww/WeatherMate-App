<?php
$host = 'localhost';
$dbname = 'weathermate';
$username = 'root';
$password = '123xyz';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}
catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}

if (isset($_POST['submit'])) {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $message = $_POST['message'];

    try {
        $sql = "INSERT INTO contact (name, email, message) VALUES ('$name', '$email', '$message')";
        $conn->exec($sql);
        echo "New record created successfully";
    }
    catch(PDOException $e) {
        echo $sql . "<br>" . $e->getMessage();
    }
}
?>
