<?php
/**
 * Telegram Bot API Integration for Vistav s.r.o.
 * Handles sending contact form messages to Telegram
 */

class TelegramBot {
    private $bot_token;
    private $chat_id;
    private $config;
    private $enabled;
    
    public function __construct() {
        $this->loadConfig();
    }
    
    /**
     * Load Telegram configuration from JSON file
     */
    private function loadConfig() {
        // Try different paths depending on where the script is called from
        $possible_paths = [
            '../data/telegram_config.json',  // From php/ directory
            'data/telegram_config.json',     // From root directory
            __DIR__ . '/../data/telegram_config.json'  // Absolute path
        ];
        
        $config_file = null;
        foreach ($possible_paths as $path) {
            if (file_exists($path)) {
                $config_file = $path;
                break;
            }
        }
        
        if (!file_exists($config_file)) {
            error_log('Telegram config file not found: ' . $config_file);
            $this->enabled = false;
            return;
        }
        
        $config_content = file_get_contents($config_file);
        $this->config = json_decode($config_content, true);
        
        if (!$this->config) {
            error_log('Invalid Telegram config JSON');
            $this->enabled = false;
            return;
        }
        
        $this->bot_token = $this->config['bot_token'] ?? '';
        $this->chat_id = $this->config['chat_id'] ?? '';
        $this->enabled = $this->config['enabled'] ?? false;
        
        // Check if required fields are set
        if (empty($this->bot_token) || empty($this->chat_id) || 
            $this->bot_token === 'YOUR_BOT_TOKEN_HERE' || 
            $this->chat_id === 'YOUR_CHAT_ID_HERE') {
            $this->enabled = false;
        }
    }
    
    /**
     * Check if Telegram integration is enabled and configured
     */
    public function isEnabled() {
        return $this->enabled;
    }
    
    /**
     * Send contact form data to Telegram
     */
    public function sendContactForm($data, $language = 'cs') {
        if (!$this->isEnabled()) {
            error_log('Telegram integration is disabled or not configured');
            return false;
        }
        
        try {
            $message = $this->formatMessage($data, $language);
            return $this->sendMessage($message);
        } catch (Exception $e) {
            error_log('Telegram send error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Format contact form data into Telegram message
     */
    private function formatMessage($data, $language) {
        $template = $this->config['message_template'][$language] ?? $this->config['message_template']['cs'];
        $service_translations = $this->config['service_translations'][$language] ?? $this->config['service_translations']['cs'];
        
        // Translate service and client type
        $service_translated = $service_translations[$data['service']] ?? $data['service'];
        $client_type_translated = $service_translations[$data['client_type']] ?? $data['client_type'];
        
        // Prepare company info
        $company_info = '';
        if (!empty($data['company'])) {
            $company_info = ($language === 'en') ? 
                "🏢 *Company:* {$data['company']}\n" : 
                "🏢 *Společnost:* {$data['company']}\n";
        }
        
        // Format message
        $message = str_replace([
            '{name}',
            '{phone}',
            '{email}',
            '{client_type}',
            '{company_info}',
            '{service}',
            '{message}',
            '{date}',
            '{ip}'
        ], [
            $this->escapeMarkdown($data['name']),
            $this->escapeMarkdown($data['phone']),
            $this->escapeMarkdown($data['email']),
            $this->escapeMarkdown($client_type_translated),
            $company_info,
            $this->escapeMarkdown($service_translated),
            $this->escapeMarkdown($data['message'] ?: 'Bez zprávy'),
            $this->escapeMarkdown(date('d.m.Y H:i:s')),
            $this->escapeMarkdown($data['ip'] ?? 'Neznámá')
        ], $template);
        
        return $message;
    }
    
    /**
     * Escape special characters for Telegram Markdown
     */
    private function escapeMarkdown($text) {
        // MarkdownV2 special characters that need escaping
        $special_chars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
        
        // Convert to string if not already
        $text = (string) $text;
        
        // Escape each special character
        foreach ($special_chars as $char) {
            $text = str_replace($char, '\\' . $char, $text);
        }
        
        return $text;
    }
    
    /**
     * Send message to Telegram using Bot API
     */
    private function sendMessage($message) {
        $url = "https://api.telegram.org/bot{$this->bot_token}/sendMessage";
        
        $post_data = [
            'chat_id' => $this->chat_id,
            'text' => $message,
            'parse_mode' => 'MarkdownV2',
            'disable_web_page_preview' => true
        ];
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($post_data),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_USERAGENT => 'Vistav Contact Form Bot/1.0'
        ]);
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curl_error = curl_error($ch);
        curl_close($ch);
        
        if ($curl_error) {
            throw new Exception("cURL error: " . $curl_error);
        }
        
        if ($http_code !== 200) {
            $error_info = json_decode($response, true);
            $error_message = $error_info['description'] ?? "HTTP error: $http_code";
            throw new Exception("Telegram API error: " . $error_message);
        }
        
        $result = json_decode($response, true);
        
        if (!$result || !$result['ok']) {
            $error_message = $result['description'] ?? 'Unknown API error';
            throw new Exception("Telegram API error: " . $error_message);
        }
        
        return true;
    }
    
    /**
     * Test Telegram connection
     */
    public function testConnection() {
        if (!$this->isEnabled()) {
            return [
                'success' => false,
                'message' => 'Telegram integration is disabled or not configured'
            ];
        }
        
        try {
            $test_message = "🧪 *Test zpráva z VISTAV webu*\n\nTelegram integrace funguje správně\\!\n\n📅 " . $this->escapeMarkdown(date('d.m.Y H:i:s'));
            
            if ($this->sendMessage($test_message)) {
                return [
                    'success' => true,
                    'message' => 'Test message sent successfully'
                ];
            }
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Test failed: ' . $e->getMessage()
            ];
        }
        
        return [
            'success' => false,
            'message' => 'Unknown error occurred'
        ];
    }
}
?>