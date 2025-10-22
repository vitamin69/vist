<?php
/**
 * Contact Form Handler for Vistav s.r.o.
 * Handles form submissions and saves leads to CSV file
 * 
 * Features:
 * - Input validation and sanitization
 * - CSV data storage
 * - Security measures against spam and attacks
 * - Multi-language support
 * - Telegram notifications
 */

// Include Telegram integration
require_once 'telegram.php';
// Security headers
require_once __DIR__ . '/security.php';
$__sec = new AdminSecurity();
$__sec->sendSecurityHeaders();

// ==================== CONFIGURATION ==================== //
header('Content-Type: application/json; charset=utf-8');
// Restrict CORS to same-host origin if provided
if (isset($_SERVER['HTTP_ORIGIN']) && isset($_SERVER['HTTP_HOST'])) {
    $origin = $_SERVER['HTTP_ORIGIN'];
    $originHost = parse_url($origin, PHP_URL_HOST);
    $host = $_SERVER['HTTP_HOST'];
    if ($originHost === $host) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }
}
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type');

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'errors.log');

// Configuration
$config = [
    'leads_file' => 'leads.csv',
    'max_file_size' => 10485760, // 10MB
    'allowed_extensions' => ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'],
    'rate_limit' => 5, // Max submissions per IP per hour
    'disable_rate_limit_local' => true, // bypass rate limit for localhost (::1, 127.0.0.1)
    'honeypot_field' => 'website', // Hidden field for spam detection
    'min_submission_delay' => 3, // seconds between CSRF issue and POST
    'csrf_token_name' => 'csrf_token', // CSRF token field name
    'csrf_token_expiry' => 3600, // 1 hour
];

// ==================== SECURITY FUNCTIONS ==================== //

/**
 * Generate or validate CSRF token
 */
function handleCsrfToken($validate = false) {
    global $config;
    
    if (!isset($_SESSION)) {
        session_start();
    }
    
    $token_name = $config['csrf_token_name'];
    $expiry_name = $token_name . '_expiry';
    
    // Validation mode
    if ($validate) {
        if (!isset($_POST[$token_name]) || !isset($_SESSION[$token_name]) || 
            !isset($_SESSION[$expiry_name])) {
            return false;
        }
        
        // Check if token has expired
        if ($_SESSION[$expiry_name] < time()) {
            unset($_SESSION[$token_name]);
            unset($_SESSION[$expiry_name]);
            return false;
        }
        
        // Validate token
        if ($_POST[$token_name] !== $_SESSION[$token_name]) {
            return false;
        }
        
        return true;
    }
    
    // Generation mode
    $token = bin2hex(random_bytes(32));
    $expiry = time() + $config['csrf_token_expiry'];
    
    $_SESSION[$token_name] = $token;
    $_SESSION[$expiry_name] = $expiry;
    
    return $token;
}

// ==================== CSRF TOKEN ENDPOINT ==================== //
// Provide CSRF token to client on GET request
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? '';
    if ($action === 'get_csrf_token') {
        $token = handleCsrfToken(false);
        $token_name = $config['csrf_token_name'];
        $expiry_name = $token_name . '_expiry';
        $expiry = isset($_SESSION[$expiry_name]) ? (int)$_SESSION[$expiry_name] : null;
        // Mark form start time to enable time-trap on POST (only once)
        if (!isset($_SESSION['form_start_ts'])) {
            $_SESSION['form_start_ts'] = time();
        }
        echo json_encode([
            'success' => true,
            'token' => $token,
            'expires' => $expiry,
            'min_submission_delay' => $config['min_submission_delay'] ?? 0
        ]);
        exit;
    }
}

/**
 * Rate limiting check
 */
function checkRateLimit($ip, $limit = 5) {
    global $config;
    $rate_file = '../data/rate_limit.json';
    $current_time = time();
    $hour_ago = $current_time - 3600;

    // Bypass for localhost/dev if enabled
    $disableLocal = $config['disable_rate_limit_local'] ?? false;
    if ($disableLocal && ($ip === '127.0.0.1' || $ip === '::1')) {
        return true;
    }
    
    // Load existing rate limit data
    $rate_data = [];
    if (file_exists($rate_file)) {
        $content = file_get_contents($rate_file);
        $rate_data = json_decode($content, true) ?: [];
    }
    
    // Clean old entries
    foreach ($rate_data as $ip_addr => $timestamps) {
        $rate_data[$ip_addr] = array_filter($timestamps, function($timestamp) use ($hour_ago) {
            return $timestamp > $hour_ago;
        });
        
        if (empty($rate_data[$ip_addr])) {
            unset($rate_data[$ip_addr]);
        }
    }
    
    // Check current IP
    if (!isset($rate_data[$ip])) {
        $rate_data[$ip] = [];
    }
    
    if (count($rate_data[$ip]) >= $limit) {
        return false;
    }
    
    // Add current timestamp
    $rate_data[$ip][] = $current_time;
    
    // Save rate limit data
    file_put_contents($rate_file, json_encode($rate_data), LOCK_EX);
    
    return true;
}



/**
 * Sanitize input data
 */
function sanitizeInput($data) {
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate email address
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate phone number
 */
function validatePhone($phone) {
    $phone = preg_replace('/[^\d+]/', '', $phone);
    return preg_match('/^\+?[0-9]{9,15}$/', $phone);
}

/**
 * Validate personal name: allow Unicode letters, marks, spaces, apostrophe, hyphen
 */
function validateName($name) {
    return preg_match('/^[\p{L}\p{M}\s\'-]{2,100}$/u', $name) === 1;
}

/**
 * Validate company name: allow letters, digits, common punctuation
 */
function validateCompanyName($company) {
    if ($company === '') return false; // company required is checked separately for business clients
    return preg_match('/^[\p{L}\p{M}\d\s\'&\.,-]{2,150}$/u', $company) === 1;
}

/**
 * Neutralize potential CSV injection by prefixing a single quote
 * when a value starts with characters interpreted by spreadsheet formulas.
 * Applies to leading '=', '+', '-', '@' (after optional whitespace).
 */
function neutralizeCsvField($value) {
    $value = (string)$value;
    $trimmed = ltrim($value);
    if ($trimmed !== '' && preg_match('/^[=+\-@]/u', $trimmed)) {
        return "'" . $value;
    }
    return $value;
}

/**
 * Map CSV injection neutralization across a row.
 */
function neutralizeCsvRow(array $row) {
    return array_map('neutralizeCsvField', $row);
}

/**
 * Check for spam keywords
 */
function isSpam($text) {
    $spam_keywords = [
        'viagra', 'cialis', 'casino', 'lottery', 'winner', 'congratulations',
        'million dollars', 'inheritance', 'bitcoin', 'cryptocurrency',
        'make money fast', 'work from home', 'click here', 'urgent',
        'limited time', 'act now', 'free money', 'guarantee'
    ];
    
    $text_lower = strtolower($text);
    foreach ($spam_keywords as $keyword) {
        if (strpos($text_lower, strtolower($keyword)) !== false) {
            return true;
        }
    }
    
    return false;
}

/**
 * Get client IP address
 */
function getClientIP() {
    $ip_keys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    
    foreach ($ip_keys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, 
                    FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

// ==================== MAIN PROCESSING ==================== //

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get client IP
$client_ip = getClientIP();

// Rate limiting check
if (!checkRateLimit($client_ip, $config['rate_limit'])) {
    http_response_code(429);
    echo json_encode([
        'success' => false, 
        'message' => 'Příliš mnoho požadavků. Zkuste to prosím později.'
    ]);
    exit;
}

// Check for honeypot field (spam protection)
if (!empty($_POST[$config['honeypot_field']])) {
    // Silent fail for bots
    echo json_encode(['success' => true, 'message' => 'Děkujeme za vaši zprávu.']);
    exit;
}

// Verify CSRF token
if (!handleCsrfToken(true)) {
    echo json_encode([
        'success' => false, 
        'message' => 'Neplatný nebo expirovaný token. Obnovte stránku a zkuste to znovu.'
    ]);
    exit;
}

// Time-trap: enforce minimal delay between token issuance and submission
$minDelay = $config['min_submission_delay'] ?? 3;
if (!isset($_SESSION)) {
    session_start();
}
$startTs = isset($_SESSION['form_start_ts']) ? (int)$_SESSION['form_start_ts'] : 0;
if ($startTs === 0 || (time() - $startTs) < $minDelay) {
    echo json_encode([
        'success' => false,
        'message' => 'Odeslání proběhlo příliš rychle. Zkuste to prosím znovu za chvíli.'
    ]);
    exit;
}
// Reset timestamp to prevent reuse
unset($_SESSION['form_start_ts']);



// ==================== DATA VALIDATION ==================== //

$errors = [];
$data = [];

// Required fields
$required_fields = ['name', 'phone', 'email', 'client_type', 'service', 'privacy'];

foreach ($required_fields as $field) {
    if (empty($_POST[$field])) {
        $errors[] = "Pole '{$field}' je povinné.";
    }
}

if (!empty($errors)) {
    echo json_encode([
        'success' => false, 
        'message' => 'Vyplňte prosím všechna povinná pole.',
        'errors' => $errors
    ]);
    exit;
}

// Sanitize and validate data
$data['name'] = sanitizeInput($_POST['name']);
$data['phone'] = sanitizeInput($_POST['phone']);
$data['email'] = sanitizeInput($_POST['email']);
$data['client_type'] = sanitizeInput($_POST['client_type']);
$data['company'] = sanitizeInput($_POST['company'] ?? '');
$data['service'] = sanitizeInput($_POST['service']);
$data['message'] = sanitizeInput($_POST['message'] ?? '');

// Privacy consent must be explicit
$privacy_raw = $_POST['privacy'] ?? '';
$privacyAccepted = in_array(strtolower($privacy_raw), ['on','1','true','yes'], true);
if (!$privacyAccepted) {
    $errors[] = 'Souhlas se zpracováním osobních údajů je povinný.';
}

// Validate name (Unicode letters, spaces, apostrof, hyphen)
if (!validateName($data['name'])) {
    $errors[] = 'Neplatné jméno. Povolené: písmena, mezery, apostrof, pomlčka (2–100).';
}

// Validate email
if (!validateEmail($data['email'])) {
    $errors[] = 'Neplatná emailová adresa.';
}

// Validate phone
if (!validatePhone($data['phone'])) {
    $errors[] = 'Neplatné telefonní číslo.';
}

// Validate client type
$allowed_client_types = ['individual', 'company'];
if (!in_array($data['client_type'], $allowed_client_types)) {
    $errors[] = 'Neplatný typ klienta.';
}

// Validate company field for business clients
if ($data['client_type'] === 'company') {
    if (empty($data['company'])) {
        $errors[] = 'Název společnosti je povinný pro firemní klienty.';
    } elseif (!validateCompanyName($data['company'])) {
        $errors[] = 'Neplatný název společnosti.';
    }
}

// Validate service
$allowed_services = ['commercial', 'residential', 'renovation'];
if (!in_array($data['service'], $allowed_services)) {
    $errors[] = 'Neplatný typ služby.';
}

// Check for spam
$full_text = $data['name'] . ' ' . $data['message'] . ' ' . $data['company'];
if (isSpam($full_text)) {
    echo json_encode(['success' => true, 'message' => 'Děkujeme za vaši zprávu.']);
    exit;
}

// Limit message length
if (mb_strlen($data['message'], 'UTF-8') > 2000) {
    $errors[] = 'Zpráva je příliš dlouhá.';
}

// If there are validation errors
if (!empty($errors)) {
    echo json_encode([
        'success' => false, 
        'message' => 'Opravte prosím následující chyby:',
        'errors' => $errors
    ]);
    exit;
}

// ==================== SAVE TO CSV ==================== //

try {
    // Prepare CSV data
    $csv_data = [
        date('Y-m-d H:i:s'),
        $data['name'],
        $data['phone'],
        $data['email'],
        $data['client_type'],
        $data['company'],
        $data['service'],
        $data['message'],
        $client_ip,
        $_SERVER['HTTP_USER_AGENT'] ?? ''
    ];
    
    // Check if CSV file exists, if not create with headers
    if (!file_exists($config['leads_file'])) {
        $headers = [
            'Datum a čas',
            'Jméno',
            'Telefon',
            'Email',
            'Typ klienta',
            'Společnost',
            'Typ služby',
            'Zpráva',
            'IP adresa',
            'User Agent'
        ];
        
        $file = fopen($config['leads_file'], 'w');
        if ($file === false) {
            throw new Exception('Nelze vytvořit soubor pro ukládání dat.');
        }
        
        // Add BOM for proper UTF-8 encoding in Excel
        fwrite($file, "\xEF\xBB\xBF");
        // Lock and write headers
        flock($file, LOCK_EX);
        fputcsv($file, $headers, ';');
        fflush($file);
        flock($file, LOCK_UN);
        fclose($file);
    }

    // Append new data
    $file = fopen($config['leads_file'], 'a');
    if ($file === false) {
        throw new Exception('Nelze otevřít soubor pro zápis.');
    }
    // Neutralize fields against CSV injection
    $csv_data_safe = neutralizeCsvRow($csv_data);
    // Lock, write, flush, unlock
    flock($file, LOCK_EX);
    fputcsv($file, $csv_data_safe, ';');
    fflush($file);
    flock($file, LOCK_UN);
    fclose($file);
    
} catch (Exception $e) {
    error_log('CSV Error: ' . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Došlo k chybě při ukládání dat. Zkuste to prosím znovu.'
    ]);
    exit;
}

// ==================== TELEGRAM NOTIFICATION ==================== //

try {
    $telegram = new TelegramBot();
    if ($telegram->isEnabled()) {
        // Prepare data for Telegram
        $telegram_data = $data;
        $telegram_data['ip'] = $client_ip;
        
        // Detect language (you can modify this logic as needed)
        $language = 'cs'; // Default to Czech
        if (isset($_POST['language'])) {
            $language = $_POST['language'];
        }
        
        // Send to Telegram
        $telegram_sent = $telegram->sendContactForm($telegram_data, $language);
        
        if ($telegram_sent) {
            error_log('Telegram notification sent successfully');
        } else {
            error_log('Failed to send Telegram notification');
        }
    }
} catch (Exception $e) {
    // Don't fail the form submission if Telegram fails
    error_log('Telegram Error: ' . $e->getMessage());
}

// ==================== SUCCESS RESPONSE ==================== //

echo json_encode([
    'success' => true,
    'message' => 'Děkujeme za vaši zprávu! Náš tým se vám ozve do 24 hodin.'
]);

// ==================== CLEANUP OLD FILES ==================== //

// Clean up old rate limit data (run occasionally)
if (rand(1, 100) === 1) {
    $rate_file = '../data/rate_limit.json';
    if (file_exists($rate_file)) {
        $content = file_get_contents($rate_file);
        $rate_data = json_decode($content, true) ?: [];
        $hour_ago = time() - 3600;
        
        foreach ($rate_data as $ip => $timestamps) {
            $rate_data[$ip] = array_filter($timestamps, function($timestamp) use ($hour_ago) {
                return $timestamp > $hour_ago;
            });
            
            if (empty($rate_data[$ip])) {
                unset($rate_data[$ip]);
            }
        }
        
        file_put_contents($rate_file, json_encode($rate_data), LOCK_EX);
    }
}

?>