<?php
require_once 'php/auth.php';
$auth = new Auth();
$auth->requireAuth();
$security = $auth->getSecurity();
?>
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Безпека адмінки - Управління прайсами</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .security-container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            margin: 20px auto;
            max-width: 1200px;
        }
        .security-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 20px 20px 0 0;
            text-align: center;
        }
        .security-card {
            background: white;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
            transition: transform 0.3s ease;
        }
        .security-card:hover {
            transform: translateY(-5px);
        }
        .status-active {
            color: #28a745;
        }
        .status-inactive {
            color: #dc3545;
        }
        .log-entry {
            border-left: 4px solid #667eea;
            padding: 10px;
            margin: 5px 0;
            background: #f8f9fa;
            border-radius: 0 5px 5px 0;
        }
    </style>
</head>
<body>

    <div class="container-fluid">
        <div class="security-container">
            <div class="security-header">
                <h1><i class="fas fa-shield-alt"></i> Панель безпеки адмінки</h1>
                <p class="mb-0">Управління та моніторинг безпеки системи</p>
            </div>

            <div class="container p-4">
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="d-flex justify-content-between align-items-center">
                            <h3>Статус безпеки</h3>
                            <a href="admin_prices.php" class="btn btn-primary">
                                <i class="fas fa-arrow-left"></i> Назад до адмінки
                            </a>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <!-- IP Whitelist Status -->
                    <div class="col-md-6 col-lg-4">
                        <div class="security-card p-4">
                            <div class="d-flex align-items-center mb-3">
                                <i class="fas fa-list-alt fa-2x text-primary me-3"></i>
                                <div>
                                    <h5 class="mb-0">IP Whitelist</h5>
                                    <span class="status-active">
                                        <i class="fas fa-check-circle"></i> Активний
                                    </span>
                                </div>
                            </div>
                            <p class="text-muted">Дозволені IP адреси мають доступ до адмінки</p>
                            <small class="text-info">
                                Ваш IP: <?php echo $_SERVER['REMOTE_ADDR'] ?? 'Невідомо'; ?>
                            </small>
                        </div>
                    </div>

                    <!-- Rate Limiting Status -->
                    <div class="col-md-6 col-lg-4">
                        <div class="security-card p-4">
                            <div class="d-flex align-items-center mb-3">
                                <i class="fas fa-tachometer-alt fa-2x text-warning me-3"></i>
                                <div>
                                    <h5 class="mb-0">Rate Limiting</h5>
                                    <span class="status-active">
                                        <i class="fas fa-check-circle"></i> Активний
                                    </span>
                                </div>
                            </div>
                            <p class="text-muted">Обмеження спроб входу: 5 за 15 хвилин</p>
                        </div>
                    </div>

                    <!-- Session Security -->
                    <div class="col-md-6 col-lg-4">
                        <div class="security-card p-4">
                            <div class="d-flex align-items-center mb-3">
                                <i class="fas fa-clock fa-2x text-success me-3"></i>
                                <div>
                                    <h5 class="mb-0">Session Timeout</h5>
                                    <span class="status-active">
                                        <i class="fas fa-check-circle"></i> Активний
                                    </span>
                                </div>
                            </div>
                            <p class="text-muted">Автоматичний вихід через 30 хвилин неактивності</p>
                        </div>
                    </div>

                    <!-- CSRF Protection -->
                    <div class="col-md-6 col-lg-4">
                        <div class="security-card p-4">
                            <div class="d-flex align-items-center mb-3">
                                <i class="fas fa-key fa-2x text-info me-3"></i>
                                <div>
                                    <h5 class="mb-0">CSRF Protection</h5>
                                    <span class="status-active">
                                        <i class="fas fa-check-circle"></i> Активний
                                    </span>
                                </div>
                            </div>
                            <p class="text-muted">Захист від міжсайтових запитів</p>
                        </div>
                    </div>

                    <!-- Security Headers -->
                    <div class="col-md-6 col-lg-4">
                        <div class="security-card p-4">
                            <div class="d-flex align-items-center mb-3">
                                <i class="fas fa-shield-virus fa-2x text-danger me-3"></i>
                                <div>
                                    <h5 class="mb-0">Security Headers</h5>
                                    <span class="status-active">
                                        <i class="fas fa-check-circle"></i> Активний
                                    </span>
                                </div>
                            </div>
                            <p class="text-muted">HTTP заголовки безпеки встановлені</p>
                        </div>
                    </div>

                    <!-- Access Logging -->
                    <div class="col-md-6 col-lg-4">
                        <div class="security-card p-4">
                            <div class="d-flex align-items-center mb-3">
                                <i class="fas fa-file-alt fa-2x text-secondary me-3"></i>
                                <div>
                                    <h5 class="mb-0">Access Logging</h5>
                                    <span class="status-active">
                                        <i class="fas fa-check-circle"></i> Активний
                                    </span>
                                </div>
                            </div>
                            <p class="text-muted">Логування всіх дій адміністратора</p>
                        </div>
                    </div>
                </div>

                <!-- Recent Security Logs -->
                <div class="row mt-5">
                    <div class="col-12">
                        <div class="security-card p-4">
                            <h5><i class="fas fa-history"></i> Останні події безпеки</h5>
                            <div id="security-logs">
                                <?php
                                $logFile = 'data/admin_access.log';
                                if (file_exists($logFile)) {
                                    $logs = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                                    $recentLogs = array_slice(array_reverse($logs), 0, 10);
                                    
                                    foreach ($recentLogs as $logLine) {
                                        // Очікуваний формат: [YYYY-mm-dd HH:MM:SS] ACTION | IP: <ip> | <details> | UA: <userAgent>
                                        if (preg_match('/^\[(.*?)\]\s+([A-Z_]+)\s+\|\s+IP:\s+([^|]+)\s+\|\s*(.*?)\s+\|\s+UA:\s*(.*)$/', $logLine, $m)) {
                                            $timestampStr = $m[1];
                                            $action = $m[2];
                                            $ip = trim($m[3]);
                                            $details = trim($m[4]);
                                            $userAgent = htmlspecialchars(trim($m[5]));

                                            echo '<div class="log-entry">';
                                            echo '<strong>' . htmlspecialchars($timestampStr) . '</strong> - ';
                                            echo htmlspecialchars($action) . ' з IP: ' . htmlspecialchars($ip);
                                            if ($details !== '') {
                                                echo '<br><small class="text-muted">' . htmlspecialchars($details) . '</small>';
                                            }
                                            if ($userAgent !== '') {
                                                echo '<br><small class="text-muted">' . $userAgent . '</small>';
                                            }
                                            echo '</div>';
                                        }
                                    }
                                } else {
                                    echo '<p class="text-muted">Логи поки що відсутні</p>';
                                }
                                ?>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Security Actions -->
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="security-card p-4">
                            <h5><i class="fas fa-tools"></i> Дії безпеки</h5>
                            <div class="row">
                                <div class="col-md-4">
                                    <button class="btn btn-warning w-100 mb-2" onclick="clearLogs()">
                                        <i class="fas fa-trash"></i> Очистити логи
                                    </button>
                                </div>
                                <div class="col-md-4">
                                    <button class="btn btn-info w-100 mb-2" onclick="downloadLogs()">
                                        <i class="fas fa-download"></i> Завантажити логи
                                    </button>
                                </div>
                                <div class="col-md-4">
                                    <button class="btn btn-success w-100 mb-2" onclick="refreshStatus()">
                                        <i class="fas fa-sync"></i> Оновити статус
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        function clearLogs() {
            if (confirm('Ви впевнені, що хочете очистити всі логи безпеки?')) {
                fetch('php/security_handler.php?action=clear_logs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert('Помилка: ' + data.message);
                    }
                });
            }
        }

        function downloadLogs() {
            window.open('php/security_handler.php?action=download_logs', '_blank');
        }

        function refreshStatus() {
            location.reload();
        }

        // Auto-refresh logs every 30 seconds
        setInterval(() => {
            fetch('php/security_handler.php?action=get_recent_logs')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('security-logs').innerHTML = data.logs;
                    }
                });
        }, 30000);
    </script>
</body>
</html>