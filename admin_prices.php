<?php
require_once 'php/auth.php';

$auth = new Auth();

if (isset($_POST['logout'])) {
    $auth->logout();
    header('Location: admin_prices.php');
    exit;
}

// Обробка логіну
if (isset($_POST['login'])) {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if ($auth->login($username, $password)) {
        header('Location: admin_prices.php');
        exit;
    } else {
        $error = "Неправильне ім'я користувача або пароль";
    }
}

// Перевірка аутентифікації (тільки якщо не показуємо форму логіну)
$isLoggedIn = $auth->isLoggedIn();
if (!$isLoggedIn && !isset($_POST['login'])) {
    // Показуємо форму логіну
} else if (!$isLoggedIn) {
    // Якщо спроба логіну не вдалася, показуємо форму знову
} else {
    // Користувач залогінений, продовжуємо
}

// Обробка збереження прайсу
if (isset($_POST['save_prices'])) {
    // Перевірка CSRF токена
    if (!isset($_POST['csrf_token']) || !$auth->validateCSRFToken($_POST['csrf_token'])) {
        $error = "Неправильний токен безпеки";
    } else {
        $lang = $_POST['lang'];
        $prices = json_decode($_POST['prices_data'], true);
        
        if ($prices) {
            $filename = "data/prices_{$lang}.json";
            file_put_contents($filename, json_encode($prices, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            
            // Синхронізуємо з основним файлом prices.json для чеської мови (за замовчуванням)
            if ($lang === 'cs') {
                file_put_contents("data/prices.json", json_encode($prices, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            }
            
            $success = "Прайс для мови {$lang} успішно збережено!";
        } else {
            $error = "Помилка в форматі JSON";
        }
    }
}

// Генерація CSRF токена
$csrfToken = $auth->generateCSRFToken();

// Завантаження даних прайсу
function loadPrices($lang) {
    $filename = "data/prices_{$lang}.json";
    if (file_exists($filename)) {
        return json_decode(file_get_contents($filename), true);
    }
    return [];
}

$languages = [
    'cs' => 'Чеська',
    'uk' => 'Українська', 
    'en' => 'Англійська'
];

$currentLang = isset($_GET['lang']) ? $_GET['lang'] : 'cs';
$prices = loadPrices($currentLang);
?>
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Адмін-панель - Управління прайсом</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/material.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/javascript/javascript.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/edit/matchbrackets.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/edit/closebrackets.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/fold/foldcode.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/fold/foldgutter.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/fold/brace-fold.min.js"></script>
    <style>
        .admin-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .admin-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            backdrop-filter: blur(10px);
        }
        
        .admin-header h1 {
            margin: 0;
            font-size: 1.8rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .login-form {
            max-width: 450px;
            margin: 100px auto;
            background: rgba(255,255,255,0.95);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            backdrop-filter: blur(10px);
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
        }
        
        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin-right: 10px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
        }
        
        .btn-success {
            background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
            box-shadow: 0 4px 15px rgba(86, 171, 47, 0.4);
        }
        
        .btn-success:hover {
            box-shadow: 0 8px 25px rgba(86, 171, 47, 0.6);
        }
        
        .btn-danger {
            background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
            box-shadow: 0 4px 15px rgba(255, 65, 108, 0.4);
        }
        
        .btn-danger:hover {
            box-shadow: 0 8px 25px rgba(255, 65, 108, 0.6);
        }
        
        .language-tabs {
            display: flex;
            margin-bottom: 30px;
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 5px;
            backdrop-filter: blur(10px);
        }
        
        .tab {
            padding: 12px 24px;
            background: transparent;
            border: none;
            cursor: pointer;
            margin-right: 5px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            transition: all 0.3s ease;
            flex: 1;
            text-align: center;
            text-decoration: none;
        }
        
        .tab:hover {
            background: rgba(255,255,255,0.2);
        }
        
        .tab.active {
            background: rgba(255,255,255,0.9);
            color: #667eea;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        .price-editor {
            background: rgba(255,255,255,0.95);
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            margin-bottom: 30px;
            backdrop-filter: blur(10px);
        }
        
        .category-section {
            border: 1px solid #ddd;
            border-radius: 5px;
            margin-bottom: 20px;
            padding: 15px;
        }
        
        .category-header {
            background: #f8f9fa;
            padding: 10px;
            margin: -15px -15px 15px -15px;
            border-radius: 5px 5px 0 0;
            font-weight: bold;
        }
        
        .price-item {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
            align-items: center;
        }
        
        .price-item input {
            flex: 1;
        }
        
        .remove-item {
            background: #e74c3c;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
        }
        
        .add-item {
            background: #27ae60;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
        }
        
        .alert {
            padding: 20px;
            margin-bottom: 25px;
            border: none;
            border-radius: 12px;
            font-weight: 500;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .alert-success {
            color: #155724;
            background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
            border-left: 4px solid #28a745;
        }
        
        .alert-error {
            color: #721c24;
            background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
            border-left: 4px solid #dc3545;
        }
        
        .alert-warning {
            color: #856404;
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            border-left: 4px solid #ffc107;
        }
        
        .validation-status {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            transition: all 0.3s ease;
            transform: translateX(100%);
        }
        
        .validation-status.show {
            transform: translateX(0);
        }
        
        .validation-status.valid {
            background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
        }
        
        .validation-status.invalid {
            background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
        }
        
        .json-error-line {
            background-color: rgba(255, 65, 108, 0.2) !important;
        }
        
        .json-warning {
            background: rgba(255, 193, 7, 0.1);
            border-left: 3px solid #ffc107;
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #495057;
        }
        
        .form-control {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e0e6ed;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s ease;
            background: white;
        }
        
        .form-control:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .json-editor-container {
            position: relative;
            margin-bottom: 20px;
        }
        
        .json-editor {
            width: 100%;
            height: 500px;
            font-family: 'Fira Code', 'Courier New', monospace;
            font-size: 14px;
            border: 2px solid #e0e6ed;
            border-radius: 12px;
            padding: 15px;
            resize: vertical;
            background: #fafbfc;
            transition: border-color 0.3s ease;
        }
        
        .json-editor:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .CodeMirror {
            height: 500px;
            border-radius: 12px;
            font-family: 'Fira Code', 'Courier New', monospace;
            font-size: 14px;
            border: 2px solid #e0e6ed;
        }
        
        .CodeMirror-focused {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .visual-editor {
            background: rgba(255,255,255,0.95);
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .category-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            border-left: 4px solid #667eea;
        }
        
        .service-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
            border: 1px solid #e0e6ed;
            transition: all 0.3s ease;
        }
        
        .service-item:hover {
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transform: translateY(-2px);
        }

        /* Стилі для візуального редактора */
        .visual-editor-content {
            padding: 20px;
        }

        .category-section {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 12px;
            margin-bottom: 25px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 1px solid rgba(103, 126, 234, 0.2);
        }

        .category-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .category-info h3 {
            margin: 0;
            font-size: 1.4em;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .category-key {
            opacity: 0.8;
            font-size: 0.85em;
            margin-top: 5px;
            display: block;
        }

        .category-actions {
            display: flex;
            gap: 10px;
        }

        .services-list {
            padding: 20px;
        }

        .service-item {
            background: rgba(248, 249, 250, 0.8);
            border: 1px solid rgba(103, 126, 234, 0.15);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.3s ease;
        }

        .service-item:hover {
            background: rgba(103, 126, 234, 0.05);
            border-color: rgba(103, 126, 234, 0.3);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .service-content {
            flex: 1;
        }

        .service-name strong {
            color: #2c3e50;
            font-size: 1.1em;
            display: block;
            margin-bottom: 8px;
        }

        .service-price {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .price-label {
            color: #6c757d;
            font-size: 0.9em;
            font-weight: 500;
        }

        .price {
            color: #28a745;
            font-weight: 600;
            background: rgba(40, 167, 69, 0.1);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.95em;
        }

        .service-actions {
            display: flex;
            gap: 8px;
        }

        .add-service-btn {
            width: 100%;
            margin-top: 15px;
            padding: 12px;
            border: 2px dashed rgba(103, 126, 234, 0.3);
            background: rgba(103, 126, 234, 0.05);
            color: #667eea;
            transition: all 0.3s ease;
        }

        .add-service-btn:hover {
            border-color: #667eea;
            background: rgba(103, 126, 234, 0.1);
            color: #667eea;
            transform: translateY(-2px);
        }

        .add-category-section {
            text-align: center;
            padding: 30px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 12px;
            border: 2px dashed rgba(103, 126, 234, 0.3);
        }

        .add-category-section .btn {
            padding: 15px 30px;
            font-size: 1.1em;
        }

        /* Модальні діалоги */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }

        .modal-dialog {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            min-width: 500px;
            max-width: 90vw;
            max-height: 90vh;
            overflow: hidden;
            animation: slideIn 0.3s ease;
        }

        .modal-header {
            padding: 20px 25px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255, 255, 255, 0.05);
        }

        .modal-header h3 {
            margin: 0;
            color: #fff;
            font-size: 18px;
            font-weight: 600;
        }

        .close-btn {
            background: none;
            border: none;
            color: #fff;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s ease;
        }

        .close-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: rotate(90deg);
        }

        .modal-body {
            padding: 25px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #fff;
            font-weight: 500;
            font-size: 14px;
        }

        .form-control {
            width: 100%;
            padding: 12px 15px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: #fff;
            font-size: 14px;
            transition: all 0.3s ease;
            box-sizing: border-box;
        }

        .form-control:focus {
            outline: none;
            border-color: #4CAF50;
            background: rgba(255, 255, 255, 0.15);
            box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
        }

        .form-control::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }

        .form-control[readonly] {
            background: rgba(255, 255, 255, 0.05);
            color: rgba(255, 255, 255, 0.7);
            cursor: not-allowed;
        }

        .help-text {
            display: block;
            margin-top: 5px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
        }

        .help-text a {
            color: #4CAF50;
            text-decoration: none;
        }

        .help-text a:hover {
            text-decoration: underline;
        }

        .modal-footer {
            padding: 20px 25px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            background: rgba(255, 255, 255, 0.02);
        }

        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .btn-primary {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
        }

        .btn-primary:hover {
            background: linear-gradient(135deg, #45a049, #3d8b40);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideIn {
             from { 
                 opacity: 0;
                 transform: translateY(-50px) scale(0.9);
             }
             to { 
                 opacity: 1;
                 transform: translateY(0) scale(1);
             }
         }

         /* Панель інструментів візуального редактора */
         .visual-editor-toolbar {
             display: flex;
             justify-content: space-between;
             align-items: center;
             padding: 15px 20px;
             background: rgba(255, 255, 255, 0.05);
             border-radius: 10px;
             margin-bottom: 20px;
             border: 1px solid rgba(255, 255, 255, 0.1);
         }

         .toolbar-left, .toolbar-right {
             display: flex;
             align-items: center;
             gap: 10px;
         }

         .search-box {
             position: relative;
             display: flex;
             align-items: center;
         }

         .search-box input {
             padding: 8px 40px 8px 15px;
             background: rgba(255, 255, 255, 0.1);
             border: 1px solid rgba(255, 255, 255, 0.2);
             border-radius: 20px;
             color: #fff;
             font-size: 14px;
             width: 300px;
             transition: all 0.3s ease;
         }

         .search-box input:focus {
             outline: none;
             border-color: #4CAF50;
             background: rgba(255, 255, 255, 0.15);
             box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
         }

         .search-box input::placeholder {
             color: rgba(255, 255, 255, 0.5);
         }

         .search-box button {
             position: absolute;
             right: 5px;
             background: none;
             border: none;
             color: rgba(255, 255, 255, 0.6);
             cursor: pointer;
             padding: 5px;
             border-radius: 50%;
             transition: all 0.3s ease;
         }

         .search-box button:hover {
             color: #fff;
             background: rgba(255, 255, 255, 0.1);
         }

         .btn-sm {
             padding: 6px 12px;
             font-size: 12px;
         }

         .btn-info {
             background: linear-gradient(135deg, #17a2b8, #138496);
             color: white;
         }

         .btn-info:hover {
             background: linear-gradient(135deg, #138496, #117a8b);
             transform: translateY(-2px);
             box-shadow: 0 5px 15px rgba(23, 162, 184, 0.3);
         }

         /* Сповіщення */
         .notification {
             position: fixed;
             top: 20px;
             right: 20px;
             padding: 15px 20px;
             border-radius: 10px;
             color: white;
             font-weight: 500;
             z-index: 10001;
             display: flex;
             align-items: center;
             gap: 10px;
             min-width: 300px;
             animation: slideInRight 0.3s ease;
             box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
         }

         .notification-success {
             background: linear-gradient(135deg, #4CAF50, #45a049);
             border-left: 4px solid #2e7d32;
         }

         .notification-error {
             background: linear-gradient(135deg, #f44336, #d32f2f);
             border-left: 4px solid #c62828;
         }

         .notification-info {
             background: linear-gradient(135deg, #2196F3, #1976D2);
             border-left: 4px solid #1565C0;
         }

         @keyframes slideInRight {
             from {
                 opacity: 0;
                 transform: translateX(100%);
             }
             to {
                 opacity: 1;
                 transform: translateX(0);
             }
         }

         /* Покращення візуального редактора */
         .visual-editor-content {
             max-height: 600px;
             overflow-y: auto;
             padding-right: 10px;
         }

         .visual-editor-content::-webkit-scrollbar {
             width: 8px;
         }

         .visual-editor-content::-webkit-scrollbar-track {
             background: rgba(255, 255, 255, 0.1);
             border-radius: 4px;
         }

         .visual-editor-content::-webkit-scrollbar-thumb {
             background: rgba(255, 255, 255, 0.3);
             border-radius: 4px;
         }

         .visual-editor-content::-webkit-scrollbar-thumb:hover {
             background: rgba(255, 255, 255, 0.5);
         }
    </style>
</head>
<body>
    <div class="admin-container">
        <?php if (!$isLoggedIn): ?>
            <!-- Login Form -->
            <div class="login-form">
                <h2 style="text-align: center; margin-bottom: 30px;">
                    <i class="fas fa-lock"></i> Вхід в адмін-панель
                </h2>
                
                <?php if (isset($error)): ?>
                    <div class="alert alert-error"><?php echo $error; ?></div>
                <?php endif; ?>
                
                <form method="POST">
                    <div class="form-group">
                        <label for="username">Ім'я користувача:</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Пароль:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit" name="login" class="btn" style="width: 100%;">
                        <i class="fas fa-sign-in-alt"></i> Увійти
                    </button>
                </form>
                
                <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px; color: white; font-size: 14px;">
                    <strong>Дані для входу:</strong><br>
                    Ім'я користувача: <code>admin</code><br>
                    Пароль: <code>admin123</code>
                </div>
            </div>
        <?php else: ?>
            <!-- Admin Panel -->
            <div class="admin-header">
                <h1><i class="fas fa-cogs"></i> Управління прайсом</h1>
                <div class="d-flex gap-2">
                    <a href="admin_security.php" class="btn btn-warning">
                        <i class="fas fa-shield-alt"></i> Безпека
                    </a>
                    <form method="POST" style="margin: 0;">
                        <button type="submit" name="logout" class="btn btn-danger">
                            <i class="fas fa-sign-out-alt"></i> Вийти
                        </button>
                    </form>
                </div>
            </div>
            
            <?php if (isset($success)): ?>
                <div class="alert alert-success"><?php echo $success; ?></div>
            <?php endif; ?>
            
            <?php if (isset($error)): ?>
                <div class="alert alert-error"><?php echo $error; ?></div>
            <?php endif; ?>
            
            <!-- Language Tabs -->
            <div class="language-tabs">
                <?php foreach ($languages as $langCode => $langName): ?>
                    <a href="?lang=<?php echo $langCode; ?>" 
                       class="tab <?php echo $currentLang === $langCode ? 'active' : ''; ?>">
                        <?php echo $langName; ?>
                    </a>
                <?php endforeach; ?>
            </div>
            
            <!-- Price Editor -->
            <div class="price-editor">
                <h3>Редактор цін (<?php echo strtoupper($currentLang); ?>)</h3>
                
                <!-- Перемикач між візуальним та JSON редактором -->
                <div class="editor-tabs" style="margin-bottom: 20px;">
                    <button type="button" class="btn" id="visualTab" onclick="switchEditor('visual')" style="margin-right: 10px;">
                        <i class="fas fa-eye"></i> Візуальний редактор
                    </button>
                    <button type="button" class="btn" id="jsonTab" onclick="switchEditor('json')">
                        <i class="fas fa-code"></i> JSON редактор
                    </button>
                </div>
                
                <!-- Візуальний редактор -->
                <div id="visualEditor" class="visual-editor" style="display: none;">
                    <!-- Панель інструментів -->
                    <div class="visual-editor-toolbar">
                        <div class="toolbar-left">
                            <div class="search-box">
                                <input type="text" id="visualSearch" placeholder="Пошук категорій та послуг..." onkeyup="searchInVisualEditor()">
                                <button type="button" onclick="clearSearch()" title="Очистити пошук">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <div class="toolbar-right">
                            <button type="button" class="btn btn-sm btn-info" onclick="sortAllCategories()" title="Сортувати всі категорії за алфавітом">
                                <i class="fas fa-sort-alpha-down"></i> Сортувати категорії
                            </button>
                            <button type="button" class="btn btn-sm btn-success" onclick="addCategory()">
                                <i class="fas fa-plus"></i> Додати категорію
                            </button>
                        </div>
                    </div>
                    
                    <div id="visualContent">
                        <!-- Контент буде згенеровано JavaScript -->
                    </div>
                </div>
                
                <!-- JSON редактор -->
                <div id="jsonEditor" class="json-editor-container">
                    <form method="POST" id="priceForm">
                        <input type="hidden" name="lang" value="<?php echo $currentLang; ?>">
                        <input type="hidden" name="prices_data" id="pricesData">
                        
                        <div class="form-group">
                            <label>JSON редактор (для досвідчених користувачів):</label>
                            <textarea class="json-editor" id="priceData" placeholder="Введіть JSON дані..."><?php echo json_encode($prices, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE); ?></textarea>
                        </div>
                    </form>
                </div>
                
                <div style="margin-top: 20px;">
                     <button type="button" class="btn btn-success" onclick="savePrices()">
                         <i class="fas fa-save"></i> Зберегти
                     </button>
                     <a href="price_dynamic.php?lang=<?php echo $currentLang; ?>" target="_blank" class="btn">
                         <i class="fas fa-eye"></i> Переглянути
                     </a>
                     <button type="button" class="btn" onclick="validateJSON()">
                         <i class="fas fa-check"></i> Перевірити JSON
                     </button>
                     <button type="button" class="btn" onclick="formatJSON()">
                         <i class="fas fa-magic"></i> Форматувати
                     </button>
                     <button type="button" class="btn" onclick="copyFromLanguage()">
                         <i class="fas fa-copy"></i> Копіювати з іншої мови
                     </button>
                 </div>
                 
                 <!-- Статус валідації -->
                 <div id="validationStatus" class="validation-status">
                     <i class="fas fa-check"></i> JSON валідний
                 </div>
                 
                 <!-- Попередження -->
                 <div id="warningsContainer" style="margin-top: 15px;"></div>
            </div>
            
            <!-- Instructions -->
            <div style="background: white; padding: 20px; border-radius: 10px; margin-top: 20px;">
                <h3><i class="fas fa-info-circle"></i> Інструкції</h3>
                <ul>
                    <li>Редагуйте JSON дані в текстовому полі вище</li>
                    <li>Структура: кожна категорія має назву, іконку та список послуг</li>
                    <li>Кожна послуга має назву (service) та ціну (price)</li>
                    <li>Після збереження перегляньте результат на сторінці прайсу</li>
                    <li>Переключайтеся між мовами за допомогою вкладок</li>
                </ul>
                
                <h4>Приклад структури:</h4>
                <pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto;">
{
  "category-name": {
    "title": "Назва категорії",
    "icon": "fas fa-icon-name",
    "items": [
      {
        "service": "Назва послуги",
        "price": "Ціна"
      }
    ]
  }
}
                </pre>
            </div>
        <?php endif; ?>
    </div>
    
    <script>
        let codeMirrorEditor;
        let currentEditorMode = 'json';
        let currentData = {};
        
        // Ініціалізація CodeMirror
         function initCodeMirror() {
             const textarea = document.getElementById('priceData');
             if (!textarea) {
                 console.error('Textarea with id "priceData" not found');
                 console.log('Available elements:', document.querySelectorAll('[id]'));
                 return false;
             }
             codeMirrorEditor = CodeMirror.fromTextArea(textarea, {
                mode: 'application/json',
                theme: 'material',
                lineNumbers: true,
                autoCloseBrackets: true,
                matchBrackets: true,
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                indentUnit: 2,
                tabSize: 2,
                lineWrapping: true
            });
            
            // Автозбереження та валідація в реальному часі
             codeMirrorEditor.on('change', function() {
                 localStorage.setItem('priceBackup_<?php echo $currentLang; ?>', codeMirrorEditor.getValue());
                 validateJSONRealTime();
             });
             
             return true;
        }
        
        // Перемикання між редакторами
        function switchEditor(mode) {
            const visualEditor = document.getElementById('visualEditor');
            const jsonEditor = document.getElementById('jsonEditor');
            const visualTab = document.getElementById('visualTab');
            const jsonTab = document.getElementById('jsonTab');
            
            if (!visualEditor || !jsonEditor) {
                console.error('Editor elements not found');
                return;
            }
            
            if (mode === 'visual') {
                visualEditor.style.display = 'block';
                jsonEditor.style.display = 'none';
                if (visualTab) visualTab.classList.add('active');
                if (jsonTab) jsonTab.classList.remove('active');
                currentEditorMode = 'visual';
                updateVisualEditor();
            } else {
                visualEditor.style.display = 'none';
                jsonEditor.style.display = 'block';
                if (visualTab) visualTab.classList.remove('active');
                if (jsonTab) jsonTab.classList.add('active');
                currentEditorMode = 'json';
            }
        }
        
        // Оновлення візуального редактора
        function updateVisualEditor() {
            if (!codeMirrorEditor) {
                console.log('CodeMirror not initialized yet');
                return;
            }
            
            try {
                const data = JSON.parse(codeMirrorEditor.getValue());
                currentData = data;
                renderVisualEditor(data);
            } catch (e) {
                const visualContent = document.getElementById('visualContent');
                if (visualContent) {
                    visualContent.innerHTML = '<div class="alert alert-error">Помилка в JSON: ' + e.message + '</div>';
                }
            }
        }
        
        // Рендеринг візуального редактора
        function renderVisualEditor(data) {
            const container = document.getElementById('visualContent');
            
            if (!data || typeof data !== 'object') {
                container.innerHTML = '<p>Помилка: неправильний формат даних</p>';
                return;
            }
            
            let html = '<div class="visual-editor-content">';
            
            Object.keys(data).forEach(categoryKey => {
                const category = data[categoryKey];
                html += `
                    <div class="category-section" data-category="${categoryKey}">
                        <div class="category-header">
                            <div class="category-info">
                                <h3>
                                    <i class="${category.icon || 'fas fa-folder'}"></i>
                                    ${category.title || categoryKey}
                                </h3>
                                <small class="category-key">Ключ: ${categoryKey}</small>
                            </div>
                            <div class="category-actions">
                                <button class="btn btn-sm btn-primary" onclick="editCategory('${categoryKey}')">
                                    <i class="fas fa-edit"></i> Редагувати
                                </button>
                                <button class="btn btn-sm btn-info" onclick="sortServices('${categoryKey}')" title="Сортувати послуги за алфавітом">
                                    <i class="fas fa-sort-alpha-down"></i> Сортувати
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteCategory('${categoryKey}')">
                                    <i class="fas fa-trash"></i> Видалити
                                </button>
                            </div>
                        </div>
                        <div class="services-list">
                `;
                
                if (category.items && Array.isArray(category.items)) {
                    category.items.forEach((item, index) => {
                        html += `
                            <div class="service-item" data-index="${index}">
                                <div class="service-content">
                                    <div class="service-name">
                                        <strong>${item.service}</strong>
                                    </div>
                                    <div class="service-price">
                                        <span class="price-label">Ціна:</span>
                                        <span class="price">${item.price}</span>
                                    </div>
                                </div>
                                <div class="service-actions">
                                    <button class="btn btn-sm btn-primary" onclick="editService('${categoryKey}', ${index})">
                                        <i class="fas fa-edit"></i> Редагувати
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteService('${categoryKey}', ${index})">
                                        <i class="fas fa-trash"></i> Видалити
                                    </button>
                                </div>
                            </div>
                        `;
                    });
                }
                
                html += `
                        <button class="btn btn-sm btn-success add-service-btn" onclick="addService('${categoryKey}')">
                            <i class="fas fa-plus"></i> Додати послугу
                        </button>
                        </div>
                    </div>
                `;
            });
            
            html += `
            </div>`;
            container.innerHTML = html;
        }
        
        // Функції для роботи з категоріями та послугами
         function addCategory() {
             showCategoryDialog('add');
         }
         
         function editCategory(categoryKey) {
             showCategoryDialog('edit', categoryKey);
         }
         
         function deleteCategory(categoryKey) {
             if (confirm('Видалити категорію "' + currentData[categoryKey].title + '"?\n\nВсі послуги в цій категорії також будуть видалені.')) {
                 delete currentData[categoryKey];
                 updateCodeMirrorFromData();
                 updateVisualEditor();
             }
         }
         
         function addService(categoryKey) {
             showServiceDialog('add', categoryKey);
         }
         
         function editService(categoryKey, index) {
             showServiceDialog('edit', categoryKey, index);
         }
         
         function deleteService(categoryKey, index) {
             const service = currentData[categoryKey].items[index];
             if (confirm('Видалити послугу "' + service.service + '"?')) {
                 currentData[categoryKey].items.splice(index, 1);
                 updateCodeMirrorFromData();
                 updateVisualEditor();
             }
         }

         // Діалог для редагування категорій
         function showCategoryDialog(mode, categoryKey = null) {
             const isEdit = mode === 'edit';
             const category = isEdit ? currentData[categoryKey] : null;
             
             const dialogHtml = `
                 <div class="modal-overlay" onclick="closeDialog()">
                     <div class="modal-dialog" onclick="event.stopPropagation()">
                         <div class="modal-header">
                             <h3>${isEdit ? 'Редагувати категорію' : 'Додати нову категорію'}</h3>
                             <button class="close-btn" onclick="closeDialog()">&times;</button>
                         </div>
                         <div class="modal-body">
                             <div class="form-group">
                                 <label for="categoryTitle">Назва категорії:</label>
                                 <input type="text" id="categoryTitle" class="form-control" 
                                        value="${isEdit ? category.title : ''}" 
                                        placeholder="Наприклад: Фасади">
                             </div>
                             <div class="form-group">
                                 <label for="categoryIcon">Іконка FontAwesome:</label>
                                 <input type="text" id="categoryIcon" class="form-control" 
                                        value="${isEdit ? category.icon : 'fas fa-folder'}" 
                                        placeholder="Наприклад: fas fa-building">
                                 <small class="help-text">
                                     Використовуйте іконки з <a href="https://fontawesome.com/icons" target="_blank">FontAwesome</a>
                                 </small>
                             </div>
                             ${!isEdit ? `
                             <div class="form-group">
                                 <label for="categoryKey">Ключ категорії (автоматично):</label>
                                 <input type="text" id="categoryKey" class="form-control" readonly>
                                 <small class="help-text">Генерується автоматично з назви</small>
                             </div>
                             ` : ''}
                         </div>
                         <div class="modal-footer">
                             <button class="btn btn-secondary" onclick="closeDialog()">Скасувати</button>
                             <button class="btn btn-primary" onclick="saveCategoryDialog('${mode}', '${categoryKey}')">
                                 ${isEdit ? 'Зберегти зміни' : 'Додати категорію'}
                             </button>
                         </div>
                     </div>
                 </div>
             `;
             
             document.body.insertAdjacentHTML('beforeend', dialogHtml);
             
             // Автоматичне генерування ключа для нових категорій
             if (!isEdit) {
                 document.getElementById('categoryTitle').addEventListener('input', function() {
                     const title = this.value;
                     const key = title.toLowerCase()
                         .replace(/[^\u0400-\u04FFa-z0-9\s]/g, '') // Дозволяємо кирилицю, латиницю, цифри та пробіли
                         .replace(/\s+/g, '-') // Замінюємо пробіли на дефіси
                         .replace(/[^\u0400-\u04FFa-z0-9-]/g, ''); // Видаляємо все інше
                     document.getElementById('categoryKey').value = key;
                 });
             }
         }

         // Діалог для редагування послуг
         function showServiceDialog(mode, categoryKey, index = null) {
             const isEdit = mode === 'edit';
             const service = isEdit ? currentData[categoryKey].items[index] : null;
             
             const dialogHtml = `
                 <div class="modal-overlay" onclick="closeDialog()">
                     <div class="modal-dialog" onclick="event.stopPropagation()">
                         <div class="modal-header">
                             <h3>${isEdit ? 'Редагувати послугу' : 'Додати нову послугу'}</h3>
                             <button class="close-btn" onclick="closeDialog()">&times;</button>
                         </div>
                         <div class="modal-body">
                             <div class="form-group">
                                 <label for="serviceName">Назва послуги:</label>
                                 <input type="text" id="serviceName" class="form-control" 
                                        value="${isEdit ? service.service : ''}" 
                                        placeholder="Наприклад: Утеплення фасадів">
                             </div>
                             <div class="form-group">
                                 <label for="servicePrice">Ціна з одиницями:</label>
                                 <input type="text" id="servicePrice" class="form-control" 
                                        value="${isEdit ? service.price : ''}" 
                                        placeholder="Наприклад: 425–450 крон/м² або від 500 Kč">
                                 <small class="help-text">
                                     Вкажіть ціну разом з одиницями вимірювання
                                 </small>
                             </div>
                         </div>
                         <div class="modal-footer">
                             <button class="btn btn-secondary" onclick="closeDialog()">Скасувати</button>
                             <button class="btn btn-primary" onclick="saveServiceDialog('${mode}', '${categoryKey}', ${index})">
                                 ${isEdit ? 'Зберегти зміни' : 'Додати послугу'}
                             </button>
                         </div>
                     </div>
                 </div>
             `;
             
             document.body.insertAdjacentHTML('beforeend', dialogHtml);
         }

         // Збереження категорії
         function saveCategoryDialog(mode, categoryKey) {
             const title = document.getElementById('categoryTitle').value.trim();
             const icon = document.getElementById('categoryIcon').value.trim();
             
             if (!title) {
                 alert('Будь ласка, введіть назву категорії');
                 return;
             }
             
             if (mode === 'add') {
                 const key = document.getElementById('categoryKey').value.trim();
                 if (!key) {
                     alert('Ключ категорії не може бути порожнім');
                     return;
                 }
                 if (currentData[key]) {
                     alert('Категорія з таким ключем вже існує');
                     return;
                 }
                 currentData[key] = {
                     title: title,
                     icon: icon || 'fas fa-folder',
                     items: []
                 };
             } else {
                 currentData[categoryKey].title = title;
                 currentData[categoryKey].icon = icon || 'fas fa-folder';
             }
             
             updateCodeMirrorFromData();
             updateVisualEditor();
             closeDialog();
         }

         // Збереження послуги
         function saveServiceDialog(mode, categoryKey, index) {
             const serviceName = document.getElementById('serviceName').value.trim();
             const servicePrice = document.getElementById('servicePrice').value.trim();
             
             if (!serviceName) {
                 alert('Будь ласка, введіть назву послуги');
                 return;
             }
             
             const serviceData = {
                 service: serviceName,
                 price: servicePrice || ''
             };
             
             if (mode === 'add') {
                 currentData[categoryKey].items.push(serviceData);
             } else {
                 currentData[categoryKey].items[index] = serviceData;
             }
             
             updateCodeMirrorFromData();
             updateVisualEditor();
             closeDialog();
         }

         // Закриття діалогу
         function closeDialog() {
             const overlay = document.querySelector('.modal-overlay');
             if (overlay) {
                 overlay.remove();
             }
         }

         // Сортування послуг в категорії
         function sortServices(categoryKey) {
             if (!currentData[categoryKey] || !currentData[categoryKey].items) {
                 return;
             }
             
             const items = currentData[categoryKey].items;
             items.sort((a, b) => {
                 return a.service.localeCompare(b.service, 'uk', { sensitivity: 'base' });
             });
             
             updateCodeMirrorFromData();
             updateVisualEditor();
             
             // Показуємо повідомлення
             showNotification('Послуги відсортовано за алфавітом', 'success');
         }

         // Сортування всіх категорій
         function sortAllCategories() {
             const sortedData = {};
             const sortedKeys = Object.keys(currentData).sort((a, b) => {
                 const titleA = currentData[a].title || a;
                 const titleB = currentData[b].title || b;
                 return titleA.localeCompare(titleB, 'uk', { sensitivity: 'base' });
             });
             
             sortedKeys.forEach(key => {
                 sortedData[key] = currentData[key];
             });
             
             currentData = sortedData;
             updateCodeMirrorFromData();
             updateVisualEditor();
             
             showNotification('Категорії відсортовано за алфавітом', 'success');
         }

         // Показ сповіщень
         function showNotification(message, type = 'info') {
             const notification = document.createElement('div');
             notification.className = `notification notification-${type}`;
             notification.innerHTML = `
                 <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
                 ${message}
             `;
             
             document.body.appendChild(notification);
             
             // Автоматичне видалення через 3 секунди
             setTimeout(() => {
                 if (notification.parentNode) {
                     notification.remove();
                 }
             }, 3000);
         }

         // Пошук в візуальному редакторі
         function searchInVisualEditor() {
             const searchTerm = document.getElementById('visualSearch').value.toLowerCase();
             const categories = document.querySelectorAll('.category-section');
             
             categories.forEach(category => {
                 const categoryTitle = category.querySelector('h3').textContent.toLowerCase();
                 const services = category.querySelectorAll('.service-item');
                 let categoryVisible = false;
                 
                 // Перевіряємо назву категорії
                 if (categoryTitle.includes(searchTerm)) {
                     categoryVisible = true;
                     services.forEach(service => service.style.display = '');
                 } else {
                     // Перевіряємо послуги
                     services.forEach(service => {
                         const serviceName = service.querySelector('.service-name').textContent.toLowerCase();
                         const servicePrice = service.querySelector('.price').textContent.toLowerCase();
                         
                         if (serviceName.includes(searchTerm) || servicePrice.includes(searchTerm)) {
                             service.style.display = '';
                             categoryVisible = true;
                         } else {
                             service.style.display = 'none';
                         }
                     });
                 }
                 
                 category.style.display = categoryVisible ? '' : 'none';
             });
         }

         // Очищення пошуку
         function clearSearch() {
             document.getElementById('visualSearch').value = '';
             const categories = document.querySelectorAll('.category-section');
             const services = document.querySelectorAll('.service-item');
             
             categories.forEach(category => category.style.display = '');
             services.forEach(service => service.style.display = '');
         }
        
        function updateCodeMirrorFromData() {
            codeMirrorEditor.setValue(JSON.stringify(currentData, null, 2));
        }
        
        function validateJSON() {
             try {
                 const data = codeMirrorEditor.getValue();
                 JSON.parse(data);
                 showValidationStatus(true, 'JSON валідний!');
                 return true;
             } catch (e) {
                 showValidationStatus(false, 'Помилка в JSON: ' + e.message);
                 return false;
             }
         }
         
         function validateJSONRealTime() {
             const warningsContainer = document.getElementById('warningsContainer');
             warningsContainer.innerHTML = '';
             
             try {
                 const data = codeMirrorEditor.getValue();
                 if (data.trim() === '') {
                     showValidationStatus(false, 'JSON порожній');
                     return;
                 }
                 
                 const parsed = JSON.parse(data);
                 
                 // Перевірка структури
                 const warnings = [];
                 Object.keys(parsed).forEach(categoryKey => {
                     const category = parsed[categoryKey];
                     
                     if (!category.title) {
                         warnings.push(`Категорія "${categoryKey}" не має назви`);
                     }
                     
                     if (!category.items || !Array.isArray(category.items)) {
                         warnings.push(`Категорія "${categoryKey}" не має послуг або послуги не є масивом`);
                     } else {
                         category.items.forEach((service, index) => {
                             if (!service.service) {
                                 warnings.push(`Послуга ${index + 1} в категорії "${categoryKey}" не має назви`);
                             }
                             if (!service.price) {
                                 warnings.push(`Послуга "${service.service || index + 1}" в категорії "${categoryKey}" не має ціни`);
                             }
                         });
                     }
                 });
                 
                 if (warnings.length > 0) {
                     showValidationStatus(true, 'JSON валідний, але є попередження');
                     warningsContainer.innerHTML = warnings.map(warning => 
                         `<div class="json-warning"><i class="fas fa-exclamation-triangle"></i> ${warning}</div>`
                     ).join('');
                 } else {
                     showValidationStatus(true, 'JSON валідний');
                 }
                 
             } catch (e) {
                 showValidationStatus(false, 'Помилка в JSON: ' + e.message);
                 
                 // Підсвічування рядка з помилкою
                 const match = e.message.match(/line (\d+)/);
                 if (match) {
                     const lineNumber = parseInt(match[1]) - 1;
                     codeMirrorEditor.addLineClass(lineNumber, 'background', 'json-error-line');
                     setTimeout(() => {
                         codeMirrorEditor.removeLineClass(lineNumber, 'background', 'json-error-line');
                     }, 3000);
                 }
             }
         }
         
         function showValidationStatus(isValid, message) {
             const statusElement = document.getElementById('validationStatus');
             statusElement.className = `validation-status ${isValid ? 'valid' : 'invalid'} show`;
             statusElement.innerHTML = `<i class="fas fa-${isValid ? 'check' : 'times'}"></i> ${message}`;
             
             setTimeout(() => {
                 statusElement.classList.remove('show');
             }, 3000);
         }
         
         function copyFromLanguage() {
             const languages = ['uk', 'en', 'ru'];
             const currentLang = '<?php echo $currentLang; ?>';
             const availableLanguages = languages.filter(lang => lang !== currentLang);
             
             if (availableLanguages.length === 0) {
                 alert('Немає інших мов для копіювання');
                 return;
             }
             
             const selectedLang = prompt(`Виберіть мову для копіювання (${availableLanguages.join(', ')}):`);
             
             if (!selectedLang || !availableLanguages.includes(selectedLang)) {
                 alert('Невірна мова');
                 return;
             }
             
             if (confirm(`Копіювати дані з мови "${selectedLang}"? Поточні дані будуть замінені.`)) {
                 fetch(`data/prices_${selectedLang}.json`)
                     .then(response => {
                         if (!response.ok) {
                             throw new Error('Файл не знайдено');
                         }
                         return response.json();
                     })
                     .then(data => {
                         codeMirrorEditor.setValue(JSON.stringify(data, null, 2));
                         alert('Дані скопійовано успішно!');
                     })
                     .catch(error => {
                         alert('Помилка копіювання: ' + error.message);
                     });
             }
         }
        
        function formatJSON() {
            try {
                const data = JSON.parse(codeMirrorEditor.getValue());
                codeMirrorEditor.setValue(JSON.stringify(data, null, 2));
                alert('JSON відформатовано!');
            } catch (e) {
                alert('Помилка в JSON: ' + e.message);
            }
        }
        
        function savePrices() {
            if (!validateJSON()) {
                return false;
            }
            
            const form = document.getElementById('priceForm');
            document.getElementById('pricesData').value = codeMirrorEditor.getValue();
            
            // Відправка форми
            const formData = new FormData(form);
            formData.append('save_prices', '1');
            formData.append('csrf_token', '<?php echo $csrfToken; ?>');
            
            fetch('admin_prices.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(data => {
                if (data.includes('успішно')) {
                    alert('Дані збережено успішно!');
                    localStorage.removeItem('priceBackup_<?php echo $currentLang; ?>');
                } else {
                    alert('Помилка збереження!');
                }
            })
            .catch(error => {
                alert('Помилка: ' + error);
            });
        }
        
        // Ініціалізація при завантаженні
        document.addEventListener('DOMContentLoaded', function() {
            // Функція для перевірки готовності елементів
            function waitForElements() {
                const priceData = document.getElementById('priceData');
                const visualEditor = document.getElementById('visualEditor');
                const jsonEditor = document.getElementById('jsonEditor');
                
                if (priceData && visualEditor && jsonEditor) {
                    console.log('All elements found, initializing...');
                    
                    // Ініціалізуємо CodeMirror
                    const codeMirrorInitialized = initCodeMirror();
                    
                    if (!codeMirrorInitialized) {
                        console.error('CodeMirror initialization failed');
                        return;
                    }
                    
                    // Ініціалізуємо візуальний редактор
                    updateVisualEditor();
                    
                    // Початково візуальний редактор
                    switchEditor('visual');
                    
                    // Відновлення з localStorage
                    const backup = localStorage.getItem('priceBackup_<?php echo $currentLang; ?>');
                    if (backup && codeMirrorEditor && backup !== codeMirrorEditor.getValue()) {
                        if (confirm('Знайдено збережену копію. Відновити?')) {
                            codeMirrorEditor.setValue(backup);
                            updateVisualEditor();
                        }
                    }
                } else {
                    console.log('Elements not ready yet, retrying...');
                    setTimeout(waitForElements, 100);
                }
            }
            
            // Запускаємо перевірку елементів
            waitForElements();
        });
    </script>
</body>
</html>