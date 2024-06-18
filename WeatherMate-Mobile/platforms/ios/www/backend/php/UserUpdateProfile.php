<?php
include 'db_config.php';

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SESSION['user_id'])) {
    $userId = $_SESSION['user_id'];  // Assume user ID is stored in session
    $newEmail = $_POST['email']; // Example field to update

    $stmt = $pdo->prepare("UPDATE users SET email = ? WHERE id = ?");
    $stmt->execute([$newEmail, $userId]);

    echo "Profile updated successfully";
}

if (isset($_SESSION['user_id'])) {
    $userId = $_SESSION['user_id'];  // Assume user ID is stored in session

    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    echo "Welcome " . $user['name'];
}
else {
    echo "You are not logged in";
}

if (isset($_SESSION['user_id'])) {
    echo "You are logged in";
}
else {
    echo "You are not logged in";
}
?>
```