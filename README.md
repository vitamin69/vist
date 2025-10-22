# VISTAV s.r.o. — структура проекту та обслуговування

Цей документ описує актуальну структуру сайту, джерела даних та ключові робочі файли після очищення невикористовуваних компонентів.

## Загальне
- Головна сторінка: `index.html`
- Стилі: `css/style.css`
- Скрипти: `js/script.js`
- Зображення: каталог `images/` (галерея підтримує `.JPG`)

## Галерея
- Галерея керується вручну в `index.html` (секція Portfolio).
- Додаткова логіка (переклади, UI) — у `js/script.js`.
- Генератори та допоміжні HTML для галереї видалені.

## Прайс (ціни)
- Динамічна сторінка прайсу: `price_dynamic.php` (корінь).
- Джерела даних: `data/prices_cs.json`, `data/prices_uk.json`, `data/prices_en.json`.
- Файл `data/prices.json` синхронізується для мови `cs` з адмін-панелі.
- Адмін-інтерфейс керування прайсом: `admin_prices.php` (логін через `php/auth.php`).

## Контактна форма
- Активний обробник: `php/handler.php`.
- Повідомлення в Telegram: `php/telegram.php` з конфігом `data/telegram_config.json`.
- В `docs/robots.txt` заборонено індексацію шляху `/php/handler.php`, щоб уникати спаму ботів.

## Безпека та адмін
- Авторизація: `php/auth.php`.
- Налаштування безпеки: `php/security.php`, `php/security_handler.php`.
- Дані безпеки: `data/admin_credentials.json`, `data/security_config.json`, `data/admin_access.log`, `data/login_attempts.json`.

## Очищення (видалені файли)
- Дублікати/застарілі: `php/price_dynamic.php`, кореневий `handler.php`, журнали `contact_log.txt`, `cookies.txt`.
- Невикористовувані адмін-ендпоїнти: `php/admin_handler.php`, `php/auth_check.php`, `php/login_handler.php`, `php/logout_handler.php`.
- Зайві дані: `data/pricing.json`, текстові заготовки `price/*.txt`.

## Обслуговування
- Оновлення прайсу: через `admin_prices.php`, редагуючи `prices_{lang}.json`.
- Додавання зображень: класти `.JPG` у відповідні папки `images/` і оновлювати розмітку `index.html`.
- Налаштування Telegram: перевірити `data/telegram_config.json` (token/chat_id) при змінах інфраструктури.