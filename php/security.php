<?php
class AdminSecurity {
    private $configFile;
    private $logFile;
    private $config;
    
    public function __construct() {
        $this->configFile = __DIR__ . '/../data/security_config.json';
        $this->logFile = __DIR__ . '/../data/admin_access.log';
        $this->loadConfig();
    }
    
    private function loadConfig() {
        if (file_exists($this->configFile)) {
            $this->config = json_decode(file_get_contents($this->configFile), true);
        } else {
            // Конфігурація за замовчуванням
            $this->config = [
                'allowed_ips' => ['127.0.0.1', '::1'], // localhost за замовчуванням
                'max_login_attempts' => 5,
                'lockout_duration' => 900, // 15 хвилин
                'session_timeout' => 3600, // 1 година
                'enable_ip_whitelist' => false, // вимкнено за замовчуванням
                'enable_rate_limiting' => true,
                'enable_logging' => true
            ];
            $this->saveConfig();
        }
    }
    
    private function saveConfig() {
        file_put_contents($this->configFile, json_encode($this->config, JSON_PRETTY_PRINT));
    }
    
    public function checkIPWhitelist() {
        if (!$this->config['enable_ip_whitelist']) {
            return true; // IP whitelist вимкнений
        }
        
        $clientIP = $this->getClientIP();
        $allowed = in_array($clientIP, $this->config['allowed_ips']);
        
        if (!$allowed) {
            $this->logAccess('IP_BLOCKED', $clientIP, 'IP not in whitelist');
            $this->sendSecurityHeaders();
            http_response_code(403);
            die('Access denied. Your IP address is not authorized.');
        }
        
        return true;
    }
    
    public function checkRateLimit($identifier = null) {
        if (!$this->config['enable_rate_limiting']) {
            return true;
        }
        
        if ($identifier === null) {
            $identifier = $this->getClientIP();
        }
        
        $attempts = $this->getLoginAttempts($identifier);
        
        if ($attempts >= $this->config['max_login_attempts']) {
            $lastAttempt = $this->getLastAttemptTime($identifier);
            $timeSinceLastAttempt = time() - $lastAttempt;
            
            if ($timeSinceLastAttempt < $this->config['lockout_duration']) {
                $remainingTime = $this->config['lockout_duration'] - $timeSinceLastAttempt;
                $this->logAccess('RATE_LIMITED', $identifier, "Too many attempts, {$remainingTime}s remaining");
                $this->sendSecurityHeaders();
                http_response_code(429);
                die("Too many login attempts. Please try again in " . ceil($remainingTime / 60) . " minutes.");
            } else {
                // Час блокування минув, скидаємо лічильник
                $this->resetLoginAttempts($identifier);
            }
        }
        
        return true;
    }
    
    public function recordLoginAttempt($identifier, $success = false) {
        if (!$this->config['enable_rate_limiting']) {
            return;
        }
        
        $attemptsFile = __DIR__ . '/../data/login_attempts.json';
        $attempts = [];
        
        if (file_exists($attemptsFile)) {
            $attempts = json_decode(file_get_contents($attemptsFile), true) ?: [];
        }
        
        if ($success) {
            // Успішний вхід - скидаємо лічильник
            unset($attempts[$identifier]);
            $this->logAccess('LOGIN_SUCCESS', $identifier, 'Successful login');
        } else {
            // Невдалий вхід - збільшуємо лічильник
            if (!isset($attempts[$identifier])) {
                $attempts[$identifier] = ['count' => 0, 'last_attempt' => 0];
            }
            $attempts[$identifier]['count']++;
            $attempts[$identifier]['last_attempt'] = time();
            $this->logAccess('LOGIN_FAILED', $identifier, 'Failed login attempt');
        }
        
        file_put_contents($attemptsFile, json_encode($attempts));
    }
    
    private function getLoginAttempts($identifier) {
        $attemptsFile = __DIR__ . '/../data/login_attempts.json';
        
        if (!file_exists($attemptsFile)) {
            return 0;
        }
        
        $attempts = json_decode(file_get_contents($attemptsFile), true) ?: [];
        return isset($attempts[$identifier]) ? $attempts[$identifier]['count'] : 0;
    }
    
    private function getLastAttemptTime($identifier) {
        $attemptsFile = __DIR__ . '/../data/login_attempts.json';
        
        if (!file_exists($attemptsFile)) {
            return 0;
        }
        
        $attempts = json_decode(file_get_contents($attemptsFile), true) ?: [];
        return isset($attempts[$identifier]) ? $attempts[$identifier]['last_attempt'] : 0;
    }
    
    private function resetLoginAttempts($identifier) {
        $attemptsFile = __DIR__ . '/../data/login_attempts.json';
        
        if (!file_exists($attemptsFile)) {
            return;
        }
        
        $attempts = json_decode(file_get_contents($attemptsFile), true) ?: [];
        unset($attempts[$identifier]);
        file_put_contents($attemptsFile, json_encode($attempts));
    }
    
    public function checkSessionTimeout() {
        if (isset($_SESSION['admin_login_time'])) {
            $sessionAge = time() - $_SESSION['admin_login_time'];
            if ($sessionAge > $this->config['session_timeout']) {
                $this->logAccess('SESSION_TIMEOUT', $this->getClientIP(), 'Session expired');
                session_destroy();
                return false;
            }
        }
        return true;
    }
    
    public function generateCSRFToken() {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
    
    public function validateCSRFToken($token) {
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }
    
    public function sendSecurityHeaders() {
        // Core security headers
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('Referrer-Policy: strict-origin-when-cross-origin');

        // Permissions Policy: disable potentially sensitive features by default
        header('Permissions-Policy: geolocation=(), microphone=(), camera=()');

        // Strict-Transport-Security (only on HTTPS)
        $isHttps = (
            (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
            (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443) ||
            (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
        );
        if ($isHttps) {
            header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
        }

        // Content Security Policy
        $cspParts = [
            "default-src 'self'",
            "base-uri 'self'",
            "frame-ancestors 'none'",
            "object-src 'none'",
            "form-action 'self'",
            "img-src 'self' data:",
            // Allow required CDNs for styles and fonts
            "font-src 'self' fonts.gstatic.com cdnjs.cloudflare.com cdn.jsdelivr.net",
            "style-src 'self' 'unsafe-inline' fonts.googleapis.com cdnjs.cloudflare.com unpkg.com cdn.jsdelivr.net",
            // Allow required CDNs for scripts
            "script-src 'self' 'unsafe-inline' cdnjs.cloudflare.com unpkg.com cdn.jsdelivr.net",
            // Network requests only to same origin
            "connect-src 'self'"
        ];
        if ($isHttps) {
            // Upgrade insecure requests when on HTTPS
            $cspParts[] = 'upgrade-insecure-requests';
        }
        header('Content-Security-Policy: ' . implode('; ', $cspParts) . ';');
    }
    
    public function logAccess($action, $identifier, $details = '') {
        if (!$this->config['enable_logging']) {
            return;
        }
        
        $timestamp = date('Y-m-d H:i:s');
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
        $logEntry = "[{$timestamp}] {$action} | IP: {$identifier} | {$details} | UA: {$userAgent}\n";
        
        file_put_contents($this->logFile, $logEntry, FILE_APPEND | LOCK_EX);
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
    
    public function addAllowedIP($ip) {
        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            if (!in_array($ip, $this->config['allowed_ips'])) {
                $this->config['allowed_ips'][] = $ip;
                $this->saveConfig();
                return true;
            }
        }
        return false;
    }
    
    public function removeAllowedIP($ip) {
        $key = array_search($ip, $this->config['allowed_ips']);
        if ($key !== false) {
            unset($this->config['allowed_ips'][$key]);
            $this->config['allowed_ips'] = array_values($this->config['allowed_ips']);
            $this->saveConfig();
            return true;
        }
        return false;
    }
    
    public function getConfig() {
        return $this->config;
    }
    
    public function updateConfig($newConfig) {
        $this->config = array_merge($this->config, $newConfig);
        $this->saveConfig();
    }
}
?>