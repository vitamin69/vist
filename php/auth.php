<?php
session_start();
require_once __DIR__ . '/security.php';

class Auth {
    private $credentialsFile;
    private $security;
    
    public function __construct() {
        $this->credentialsFile = __DIR__ . '/../data/admin_credentials.json';
        $this->security = new AdminSecurity();
        $this->initializeCredentials();
        
        // Перевірка безпеки при створенні об'єкта
        $this->security->checkIPWhitelist();
        $this->security->sendSecurityHeaders();
    }
    
    private function initializeCredentials() {
        if (!file_exists($this->credentialsFile)) {
            // Default admin credentials - change these!
            $defaultCredentials = [
                'username' => 'admin',
                'password' => password_hash('admin123', PASSWORD_DEFAULT),
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            file_put_contents($this->credentialsFile, json_encode($defaultCredentials, JSON_PRETTY_PRINT));
        }
    }
    
    public function login($username, $password) {
        // Перевірка обмеження спроб входу
        $identifier = $this->getClientIP();
        $this->security->checkRateLimit($identifier);
        
        $credentials = $this->getCredentials();
        
        if ($credentials && 
            $username === $credentials['username'] && 
            password_verify($password, $credentials['password'])) {
            
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_username'] = $username;
            $_SESSION['admin_login_time'] = time();
            $_SESSION['csrf_token'] = $this->security->generateCSRFToken();
            
            // Записуємо успішний вхід
            $this->security->recordLoginAttempt($identifier, true);
            
            return true;
        }
        
        // Записуємо невдалу спробу входу
        $this->security->recordLoginAttempt($identifier, false);
        
        return false;
    }
    
    public function logout() {
        session_destroy();
        return true;
    }
    
    public function isLoggedIn() {
        if (!isset($_SESSION['admin_logged_in']) || !$_SESSION['admin_logged_in']) {
            return false;
        }
        
        // Перевірка тайм-ауту сесії через систему безпеки
        if (!$this->security->checkSessionTimeout()) {
            return false;
        }
        
        return true;
    }
    
    public function requireAuth() {
        if (!$this->isLoggedIn()) {
            // Очищуємо будь-який попередній вивід
            if (ob_get_length()) {
                ob_clean();
            }
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
            exit;
        }
    }
    
    public function changePassword($currentPassword, $newPassword) {
        $credentials = $this->getCredentials();
        
        if (!password_verify($currentPassword, $credentials['password'])) {
            return false;
        }
        
        $credentials['password'] = password_hash($newPassword, PASSWORD_DEFAULT);
        $credentials['updated_at'] = date('Y-m-d H:i:s');
        
        return file_put_contents($this->credentialsFile, json_encode($credentials, JSON_PRETTY_PRINT)) !== false;
    }
    
    private function getCredentials() {
        if (!file_exists($this->credentialsFile)) {
            return null;
        }
        
        $content = file_get_contents($this->credentialsFile);
        return json_decode($content, true);
    }
    
    private function getClientIP() {
        $ipKeys = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_X_CLUSTER_CLIENT_IP', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                $ip = $_SERVER[$key];
                if (strpos($ip, ',') !== false) {
                    $ip = explode(',', $ip)[0];
                }
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
    
    public function generateCSRFToken() {
        return $this->security->generateCSRFToken();
    }
    
    public function validateCSRFToken($token) {
        return $this->security->validateCSRFToken($token);
    }
    
    public function getSecurity() {
        return $this->security;
    }
}
?>