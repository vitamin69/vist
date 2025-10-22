<?php
require_once 'auth.php';

$auth = new Auth();
$auth->requireAuth();

header('Content-Type: application/json; charset=utf-8');

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'clear_logs':
        $logFile = '../data/admin_access.log';
        if (file_exists($logFile)) {
            if (unlink($logFile)) {
                echo json_encode(['success' => true, 'message' => 'Логи успішно очищені']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Помилка при очищенні логів']);
            }
        } else {
            echo json_encode(['success' => true, 'message' => 'Логи вже відсутні']);
        }
        break;
        
    case 'download_logs':
        $logFile = '../data/admin_access.log';
        if (file_exists($logFile)) {
            header('Content-Type: application/octet-stream');
            header('Content-Disposition: attachment; filename="admin_access_' . date('Y-m-d_H-i-s') . '.log"');
            header('Content-Length: ' . filesize($logFile));
            readfile($logFile);
            exit;
        } else {
            header('Content-Type: text/plain');
            echo 'Логи відсутні';
            exit;
        }
        break;
        
    case 'get_recent_logs':
        $logFile = '../data/admin_access.log';
        $logsHtml = '';
        
        if (file_exists($logFile)) {
            $logs = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            $recentLogs = array_slice(array_reverse($logs), 0, 10);
            
            foreach ($recentLogs as $logLine) {
                // Очікуваний формат: [YYYY-mm-dd HH:MM:SS] ACTION | IP: <ip> | <details> | UA: <userAgent>
                $pattern = '/^\[(.*?)\]\s+([A-Z_]+)\s+\|\s+IP:\s+([^|]+)\s+\|\s*(.*?)\s+\|\s+UA:\s*(.*)$/';
                if (preg_match($pattern, $logLine, $m)) {
                    $timestampStr = $m[1];
                    $action = $m[2];
                    $ip = trim($m[3]);
                    $details = trim($m[4]);
                    $userAgent = htmlspecialchars(trim($m[5]));

                    $logsHtml .= '<div class="log-entry">';
                    $logsHtml .= '<strong>' . htmlspecialchars($timestampStr) . '</strong> - ';
                    $logsHtml .= htmlspecialchars($action) . ' з IP: ' . htmlspecialchars($ip);
                    if ($details !== '') {
                        $logsHtml .= '<br><small class="text-muted">' . htmlspecialchars($details) . '</small>';
                    }
                    if ($userAgent !== '') {
                        $logsHtml .= '<br><small class="text-muted">' . $userAgent . '</small>';
                    }
                    $logsHtml .= '</div>';
                }
            }
        } else {
            $logsHtml = '<p class="text-muted">Логи поки що відсутні</p>';
        }
        
        echo json_encode(['success' => true, 'logs' => $logsHtml]);
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Невідома дія']);
        break;
}
?>