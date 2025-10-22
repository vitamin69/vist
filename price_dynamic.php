<?php
// Отримуємо мову з параметра URL або використовуємо чеську за замовчуванням
$lang = isset($_GET['lang']) ? $_GET['lang'] : 'cs';

// Перевіряємо, чи підтримується мова
$supportedLangs = ['cs', 'uk', 'en'];
if (!in_array($lang, $supportedLangs)) {
    $lang = 'cs';
}

// Завантажуємо дані прайсу для обраної мови
$priceFile = "data/prices_{$lang}.json";
$prices = [];

if (file_exists($priceFile)) {
    $pricesJson = file_get_contents($priceFile);
    $prices = json_decode($pricesJson, true);
}

// Мовні налаштування
$langSettings = [
    'cs' => [
        'title' => 'Ceník - VISTAV s.r.o.',
        'nav_home' => 'Domů',
        'nav_about' => 'O nás',
        'nav_services' => 'Služby',
        'nav_portfolio' => 'Portfolio',
        'nav_price' => 'Ceník',
        'nav_contact' => 'Kontakt',
        'back_to_main' => 'Zpět na hlavní stránku',
        'price_title' => 'Ceník služeb',
        'price_subtitle' => 'Transparentní ceny pro všechny naše služby',
        'filter_all' => 'VŠE',
        'info_section_title' => 'Důležité informace o cenách',
        'info_title1' => 'Orientační ceny',
        'info_text1' => 'Uvedené ceny jsou orientační a mohou se lišit podle konkrétních podmínek projektu.',
        'info_title2' => 'Nezávazná kalkulace',
        'info_text2' => 'Pro přesnou kalkulaci kontaktujte naše odborníky, kteří vám připraví detailní nabídku.',
        'info_title3' => 'Individuální přístup',
        'info_text3' => 'Každý projekt je jedinečný a zaslouží si individuální přístup a řešení na míru.',
        'show_more' => 'Zobrazit více',
        'show_less' => 'Zobrazit méně',
        'footer_description' => 'Profesionální stavební služby s důrazem na kvalitu a spokojenost zákazníků.',
        'footer_contact_title' => 'Kontakt',
        'footer_address' => 'Hudcova 246/43, Brno, Česká republika',
        'footer_services_title' => 'Služby',
        'footer_service1' => 'Komerční výstavba',
        'footer_service2' => 'Nekomerční výstavba',
        'footer_service3' => 'Rekonstrukce',
        'footer_service4' => 'Renovace',
        'footer_links_title' => 'Odkazy',
        'footer_link1' => 'Domů',
        'footer_link2' => 'O nás',
        'footer_link3' => 'Portfolio',
        'footer_link4' => 'Kontakt',
        'footer_copyright' => '© 2024 VISTAV s.r.o. Všechna práva vyhrazena.',
        'footer_navigation_title' => 'Navigace',
        'footer_rights' => 'Všechna práva vyhrazena.',
        'cta_call' => 'Zavolat',
        'cta_whatsapp' => 'WhatsApp',
        'categories' => [
            'komunikace' => 'Komunikace',
            'kzs' => 'KZS',
            'obklady' => 'Obklady',
            'stropy' => 'Stropy',
            'vyzdivky' => 'Vyzdívky'
        ]
    ],
    'uk' => [
        'title' => 'Прайс-лист - VISTAV s.r.o.',
        'nav_home' => 'Головна',
        'nav_about' => 'Про нас',
        'nav_services' => 'Послуги',
        'nav_portfolio' => 'Портфоліо',
        'nav_price' => 'Прайс',
        'nav_contact' => 'Контакти',
        'back_to_main' => 'Назад на головну',
        'price_title' => 'Прайс-лист послуг',
        'price_subtitle' => 'Прозорі ціни на всі наші послуги',
        'filter_all' => 'ВСЕ',
        'info_section_title' => 'Важлива інформація про ціни',
        'info_title1' => 'Орієнтовні ціни',
        'info_text1' => 'Зазначені ціни є орієнтовними і можуть відрізнятися залежно від конкретних умов проекту.',
        'info_title2' => 'Безкоштовна калькуляція',
        'info_text2' => 'Для точної калькуляції зверніться до наших фахівців, які підготують детальну пропозицію.',
        'info_title3' => 'Індивідуальний підхід',
        'info_text3' => 'Кожен проект унікальний і заслуговує на індивідуальний підхід та рішення на замовлення.',
        'show_more' => 'Показати більше',
        'show_less' => 'Показати менше',
        'footer_description' => 'Професійні будівельні послуги з акцентом на якість та задоволення клієнтів.',
        'footer_contact_title' => 'Контакти',
        'footer_address' => 'Hudcova 246/43, Брно, Чеська Республіка',
        'footer_services_title' => 'Послуги',
        'footer_service1' => 'Комерційне будівництво',
        'footer_service2' => 'Некомерційне будівництво',
        'footer_service3' => 'Реконструкція',
        'footer_service4' => 'Ремонт',
        'footer_links_title' => 'Посилання',
        'footer_link1' => 'Головна',
        'footer_link2' => 'Про нас',
        'footer_link3' => 'Портфоліо',
        'footer_link4' => 'Контакти',
        'footer_copyright' => '© 2024 VISTAV s.r.o. Всі права захищені.',
        'footer_navigation_title' => 'Навігація',
        'footer_rights' => 'Всі права захищені.',
        'cta_call' => 'Зателефонувати',
        'cta_whatsapp' => 'WhatsApp',
        'categories' => [
            'komunikace' => 'Комунікації',
            'kzs' => 'КЗС',
            'obklady' => 'Облицювання',
            'stropy' => 'Стелі',
            'vyzdivky' => 'Кладка'
        ]
    ],
    'en' => [
        'title' => 'Price List - VISTAV s.r.o.',
        'nav_home' => 'Home',
        'nav_about' => 'About',
        'nav_services' => 'Services',
        'nav_portfolio' => 'Portfolio',
        'nav_price' => 'Pricing',
        'nav_contact' => 'Contact',
        'back_to_main' => 'Back to main',
        'price_title' => 'Service Price List',
        'price_subtitle' => 'Transparent prices for all our services',
        'filter_all' => 'ALL',
        'info_section_title' => 'Important Price Information',
        'info_title1' => 'Indicative prices',
        'info_text1' => 'The prices listed are indicative and may vary depending on specific project conditions.',
        'info_title2' => 'Free calculation',
        'info_text2' => 'For accurate calculation, contact our specialists who will prepare a detailed offer.',
        'info_title3' => 'Individual approach',
        'info_text3' => 'Each project is unique and deserves an individual approach and custom solutions.',
        'show_more' => 'Show more',
        'show_less' => 'Show less',
        'footer_description' => 'Professional construction services with emphasis on quality and customer satisfaction.',
        'footer_contact_title' => 'Contact',
        'footer_address' => 'Hudcova 246/43, Brno, Czech Republic',
        'footer_services_title' => 'Services',
        'footer_service1' => 'Commercial construction',
        'footer_service2' => 'Residential construction',
        'footer_service3' => 'Reconstruction',
        'footer_service4' => 'Renovation',
        'footer_links_title' => 'Links',
        'footer_link1' => 'Home',
        'footer_link2' => 'About us',
        'footer_link3' => 'Portfolio',
        'footer_link4' => 'Contact',
        'footer_copyright' => '© 2024 VISTAV s.r.o. All rights reserved.',
        'footer_navigation_title' => 'Navigation',
        'footer_rights' => 'All rights reserved.',
        'cta_call' => 'Call',
        'cta_whatsapp' => 'WhatsApp',
        'categories' => [
            'komunikace' => 'Communications',
            'kzs' => 'Fire Safety',
            'obklady' => 'Tiling',
            'stropy' => 'Ceilings',
            'vyzdivky' => 'Masonry'
        ]
    ]
];

$currentLang = $langSettings[$lang];
// Apply security headers (CSP, X-Frame-Options, etc.)
require_once __DIR__ . '/php/security.php';
$security = new AdminSecurity();
$security->sendSecurityHeaders();
?>
<!DOCTYPE html>
<html lang="<?php echo $lang; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $currentLang['title']; ?></title>
    <?php
        $baseDomain = 'https://www.vistav.cz';
        $priceBase = $baseDomain . '/price_dynamic.php';
        $canonicalUrl = $priceBase . ($lang !== 'cs' ? ('?lang=' . $lang) : '');
    ?>
    <link rel="canonical" href="<?php echo $canonicalUrl; ?>">
    <link rel="alternate" hreflang="cs" href="<?php echo $priceBase; ?>">
    <link rel="alternate" hreflang="uk" href="<?php echo $priceBase; ?>?lang=uk">
    <link rel="alternate" hreflang="en" href="<?php echo $priceBase; ?>?lang=en">
    <link rel="alternate" hreflang="x-default" href="<?php echo $priceBase; ?>">
    <link rel="stylesheet" href="css/style.css?v=<?php echo time(); ?>">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    <style>
        /* Використовуємо ті ж стилі, що й на основному сайті */
        :root {
            --color-white: #ffffff;
            --color-gray-600: #6b7280;
            --z-floating: 1000;
        }
        
        .language-switcher {
            position: fixed;
            top: 80px;
            right: 20px;
            display: flex;
            gap: 8px;
            z-index: var(--z-floating);
            background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%);
            padding: 8px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255,255,255,0.3);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .lang-btn {
            padding: 10px 16px;
            font-size: 0.875rem;
            font-weight: 600;
            border-radius: 8px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            color: var(--color-gray-600);
            position: relative;
            overflow: hidden;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-decoration: none;
            border: none;
            background: transparent;
            cursor: pointer;
        }
        
        .lang-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s ease;
        }
        
        .lang-btn:hover::before {
            left: 100%;
        }
        
        .lang-btn:hover,
        .lang-btn.active {
            background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
            color: var(--color-white);
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 8px 20px rgba(255, 107, 53, 0.3);
        }
        
        .price-hero__back {
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              color: white;
              text-decoration: none;
              font-weight: 600;
              margin-top: 2rem;
              padding: 1.2rem 2.5rem;
              background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
              border: none;
              border-radius: 15px;
              transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), 
                          transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                          box-shadow 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
              box-shadow: 0 10px 30px rgba(255, 107, 53, 0.4);
              font-size: 1.1rem;
              font-weight: 700;
              position: relative;
              overflow: hidden;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              will-change: transform;
              cursor: pointer;
          }
          
          .price-hero__back::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
              transition: left 0.6s ease;
          }
          
          .price-hero__back::after {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              width: 0;
              height: 0;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 50%;
              transform: translate(-50%, -50%);
              transition: width 0.6s ease, height 0.6s ease;
              z-index: -1;
          }
          
          .price-hero__back:hover {
              background: linear-gradient(135deg, #e55a2b 0%, #e8851a 100%);
              color: white;
              transform: translateY(-4px) scale(1.03);
              box-shadow: 0 20px 50px rgba(255, 107, 53, 0.6), 0 8px 25px rgba(255, 111, 0, 0.3);
          }
          
          .price-hero__back:hover::after {
              width: 300px;
              height: 300px;
          }
          
          .price-hero__back:hover::before {
              left: 100%;
          }
          
          .price-hero__back:active {
              transform: translateY(-1px) scale(0.98);
          }
          
          .price-hero__back i {
              font-size: 0.9rem;
              z-index: 1;
          }

          /* Ripple effect animation */
          @keyframes ripple {
              0% {
                  transform: scale(0);
                  opacity: 1;
              }
              100% {
                  transform: scale(2);
                  opacity: 0;
              }
          }
    </style>
</head>
<body>
    <!-- Language Switcher -->
    <div id="language-switcher" class="language-switcher">
        <button class="lang-btn <?php echo $lang === 'cs' ? 'active' : ''; ?>" data-lang="cs" onclick="changeLanguage('cs')">CS</button>
        <button class="lang-btn <?php echo $lang === 'uk' ? 'active' : ''; ?>" data-lang="uk" onclick="changeLanguage('uk')">UK</button>
        <button class="lang-btn <?php echo $lang === 'en' ? 'active' : ''; ?>" data-lang="en" onclick="changeLanguage('en')">EN</button>
    </div>

    <!-- Header -->
    <header class="header" id="header">
        <nav class="nav container">
            <div class="nav__brand">
                <a href="index.html">
                    <img src="images/logo.png" alt="VISTAV Logo" class="nav__logo">
                </a>
            </div>

            <div class="nav__menu" id="nav-menu">
                <ul class="nav__list">
                    <li class="nav__item">
                        <a href="index.html" class="nav__link"><?php echo $currentLang['nav_home']; ?></a>
                    </li>
                    <li class="nav__item">
                        <a href="index.html#about" class="nav__link"><?php echo $currentLang['nav_about']; ?></a>
                    </li>
                    <li class="nav__item">
                        <a href="index.html#services" class="nav__link"><?php echo $currentLang['nav_services']; ?></a>
                    </li>
                    <li class="nav__item">
                        <a href="index.html#portfolio" class="nav__link"><?php echo $currentLang['nav_portfolio']; ?></a>
                    </li>
                    <li class="nav__item">
                        <a href="#" class="nav__link nav__link--active"><?php echo $currentLang['nav_price']; ?></a>
                    </li>
                    <li class="nav__item">
                        <a href="index.html#contact" class="nav__link"><?php echo $currentLang['nav_contact']; ?></a>
                    </li>
                </ul>

                <div class="nav__close" id="nav-close">
                    <i class="fas fa-times"></i>
                </div>
            </div>

            <div class="nav__actions">
                <a href="tel:+420774453058" class="nav__phone">
                    <i class="fas fa-phone"></i>
                    <span>+420 774 453 058</span>
                </a>

                <div class="nav__toggle" id="nav-toggle">
                    <i class="fas fa-bars"></i>
                </div>
            </div>
        </nav>
    </header>

    <!-- Main Content -->
    <main class="main">
        <!-- Price Hero -->
        <section class="price-hero section">
            <div class="container">
                <div class="price-hero__content" data-aos="fade-up">
                    <h1 class="price-hero__title"><?php echo $currentLang['price_title']; ?></h1>
                    <p class="price-hero__subtitle"><?php echo $currentLang['price_subtitle']; ?></p>
                    <a href="index.html" class="price-hero__back">
                        <i class="fas fa-arrow-left"></i>
                        <?php echo $currentLang['back_to_main']; ?>
                    </a>
                </div>
            </div>
        </section>

        <!-- Price List -->
        <section class="price-list section">
            <div class="container">
                <!-- Filter Buttons -->
                <div class="price-filters" data-aos="fade-up">
                    <button class="filter-btn active" data-filter="all">
                        <i class="fas fa-th"></i>
                        <?php echo $currentLang['filter_all']; ?>
                    </button>
                    <?php foreach ($prices as $categoryKey => $category): ?>
                    <button class="filter-btn" data-filter="<?php echo $categoryKey; ?>">
                        <i class="<?php echo $category['icon']; ?>"></i>
                        <?php echo $currentLang['categories'][$categoryKey] ?? strtoupper(str_replace('-', ' ', $categoryKey)); ?>
                    </button>
                    <?php endforeach; ?>


                </div>

                <!-- Price Categories -->
                <?php foreach ($prices as $categoryKey => $category): ?>
                <div class="price-category" data-category="<?php echo $categoryKey; ?>">
                    <div class="price-category__header">
                        <div class="price-category__icon">
                            <i class="<?php echo $category['icon']; ?>"></i>
                        </div>
                        <h3 class="price-category__title"><?php echo $category['title']; ?></h3>
                    </div>
                    <div class="price-category__content">
                        <div class="price-table">
                            <?php 
                            $itemCount = 0;
                            foreach ($category['items'] as $item): 
                                $itemCount++;
                                $isHidden = $itemCount > 5 ? 'style="display: none;"' : '';
                            ?>
                            <div class="price-row <?php echo $itemCount > 5 ? 'hidden-item' : ''; ?>" <?php echo $isHidden; ?>>
                                <span class="price-service"><?php echo htmlspecialchars($item['service']); ?></span>
                                <span class="price-value"><?php echo htmlspecialchars($item['price']); ?></span>
                            </div>
                            <?php endforeach; ?>
                        </div>
                        <?php if (count($category['items']) > 5): ?>
                        <div class="show-more-container">
                            <button class="show-more-btn" onclick="toggleItems('<?php echo $categoryKey; ?>')">
                                <span class="show-text"><?php echo $currentLang['show_more'] ?? 'Показати більше'; ?></span>
                                <span class="hide-text" style="display: none;"><?php echo $currentLang['show_less'] ?? 'Показати менше'; ?></span>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </section>

        <!-- Price Info -->
        <section class="price-info section">
            <div class="container">
                <h2 class="price-info__title"><?php echo $currentLang['info_section_title'] ?? 'Важлива інформація про ціни'; ?></h2>
                <div class="price-info__grid" data-aos="fade-up">
                    <div class="price-info__item">
                        <div class="price-info__icon">
                            <i class="fas fa-info-circle"></i>
                        </div>
                        <div class="price-info__text">
                            <h3><?php echo $currentLang['info_title1']; ?></h3>
                            <p><?php echo $currentLang['info_text1']; ?></p>
                        </div>
                    </div>
                    <div class="price-info__item">
                        <div class="price-info__icon">
                            <i class="fas fa-calculator"></i>
                        </div>
                        <div class="price-info__text">
                            <h3><?php echo $currentLang['info_title2']; ?></h3>
                            <p><?php echo $currentLang['info_text2']; ?></p>
                        </div>
                    </div>
                    <div class="price-info__item">
                        <div class="price-info__icon">
                            <i class="fas fa-handshake"></i>
                        </div>
                        <div class="price-info__text">
                            <h3><?php echo $currentLang['info_title3']; ?></h3>
                            <p><?php echo $currentLang['info_text3']; ?></p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer__content">
                <div class="footer__section">
                    <div class="footer__brand">
                        <img src="images/logo.png" alt="Vistav s.r.o." class="footer__logo">
                        <p><?php echo $currentLang['footer_description']; ?></p>
                    </div>
                </div>
                
                <div class="footer__section">
                    <h4><?php echo $currentLang['footer_navigation_title']; ?></h4>
                    <ul class="footer__links">
                        <li><a href="index.html"><?php echo $currentLang['nav_home']; ?></a></li>
                        <li><a href="index.html#about"><?php echo $currentLang['nav_about']; ?></a></li>
                        <li><a href="index.html#services"><?php echo $currentLang['nav_services']; ?></a></li>
                        <li><a href="index.html#portfolio"><?php echo $currentLang['nav_portfolio']; ?></a></li>
                        <li><a href="price_dynamic.php"><?php echo $currentLang['nav_price']; ?></a></li>
                        <li><a href="index.html#contact"><?php echo $currentLang['nav_contact']; ?></a></li>
                    </ul>
                </div>
                
                <div class="footer__section">
                    <h4><?php echo $currentLang['footer_services_title']; ?></h4>
                    <ul class="footer__links">
                        <li><a href="index.html#services"><?php echo $currentLang['footer_service1']; ?></a></li>
                        <li><a href="index.html#services"><?php echo $currentLang['footer_service2']; ?></a></li>
                        <li><a href="index.html#services"><?php echo $currentLang['footer_service3']; ?></a></li>
                        <li><a href="index.html#services"><?php echo $currentLang['footer_service4']; ?></a></li>
                    </ul>
                </div>
                
                <div class="footer__section">
                    <h4><?php echo $currentLang['footer_contact_title']; ?></h4>
                    <address class="footer__contact">
                        <p><i class="fas fa-phone"></i> <a href="tel:+420774453058">+420 774 453 058</a></p>
                        <p><i class="fas fa-envelope"></i> <a href="mailto:vistavsro@seznam.cz">vistavsro@seznam.cz</a></p>
                        <p><i class="fas fa-id-card"></i> IC 28278151</p>
                        <p><i class="fas fa-id-badge"></i> DIC: cZ28278151</p>
                        <p><i class="fas fa-map-marker-alt"></i> <span><?php echo $currentLang['footer_address']; ?></span></p>
                    </address>
                </div>
            </div>
            
            <div class="footer__bottom">
                <div class="footer__copyright">
                    <p>&copy; 2024 Vistav s.r.o. <span><?php echo $currentLang['footer_rights']; ?></span></p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Floating Buttons -->
    <div class="floating-buttons">
        <a href="tel:+420774453058" class="floating-btn floating-btn--phone" aria-label="Zavolat">
            <i class="fas fa-phone"></i>
        </a>
        <a href="https://wa.me/420774453058" class="floating-btn floating-btn--whatsapp" aria-label="WhatsApp">
            <i class="fab fa-whatsapp"></i>
        </a>
    </div>

    <!-- Back to Top -->
    <button class="back-to-top" id="back-to-top" aria-label="Zpět nahoru">
        <i class="fas fa-chevron-up"></i>
    </button>

    <!-- Scripts -->
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script src="js/script.js"></script>
    <script>
        // Language switcher functionality
        let lastScrollY = 0;
        const languageSwitcherElement = document.getElementById('language-switcher');
        
        function changeLanguage(lang) {
            window.location.href = '?lang=' + lang;
        }
        
        // Scroll effects for language switcher (avoid name clash with global)
        function initializeLanguageScrollEffects() {
            let currentScrollY = window.pageYOffset;
            
            // Language switcher scroll effect
            if (languageSwitcherElement) {
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    // Scrolling down - hide language switcher
                    languageSwitcherElement.classList.add('hidden');
                } else if (currentScrollY < lastScrollY || currentScrollY <= 100) {
                    // Scrolling up or at top - show language switcher
                    languageSwitcherElement.classList.remove('hidden');
                }
            }
            
            lastScrollY = currentScrollY;
        }
        
        // Throttle scroll events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(initializeScrollEffects, 10);
        });
        
        // Toggle items visibility
        function toggleItems(categoryKey) {
            const category = document.querySelector(`[data-category="${categoryKey}"]`);
            const hiddenItems = category.querySelectorAll('.hidden-item');
            const showMoreBtn = category.querySelector('.show-more-btn');
            const showText = showMoreBtn.querySelector('.show-text');
            const hideText = showMoreBtn.querySelector('.hide-text');
            const chevron = showMoreBtn.querySelector('.fas');
            
            const isExpanded = hiddenItems[0].style.display !== 'none';
            
            hiddenItems.forEach((item, index) => {
                if (isExpanded) {
                    // Hide items with animation
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(-10px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                } else {
                    // Show items with animation
                    item.style.display = 'flex';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, index * 50);
                }
            });
            
            // Toggle button text and icon
            if (isExpanded) {
                showText.style.display = 'inline';
                hideText.style.display = 'none';
                chevron.style.transform = 'rotate(0deg)';
            } else {
                showText.style.display = 'none';
                hideText.style.display = 'inline';
                chevron.style.transform = 'rotate(180deg)';
            }
        }
        
        console.log('JavaScript file loaded successfully!');
        
        // Price filter functionality


            function filterPrices(category) {
            try {
                console.log('🔍 filterPrices called with:', category);
                const categories = document.querySelectorAll('.price-category');
                const activeButton = document.querySelector(`[data-filter="${category}"]`);
                
                console.log('Found categories:', categories.length);
                
                // Remove active class from all buttons
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Add active class to clicked button
                if (activeButton) {
                    activeButton.classList.add('active');
                    console.log('✅ Activated button for:', category);
                }
                
                // Show/hide categories
                categories.forEach(cat => {
                    const categoryData = cat.getAttribute('data-category');
                    
                    if (category === 'all' || categoryData === category) {
                        cat.classList.remove('hidden');
                        cat.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important;';
                        console.log('👁️ SHOWING:', categoryData);
                    } else {
                        cat.classList.add('hidden');
                        cat.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important;';
                        console.log('🙈 HIDING:', categoryData);
                    }
                });
                
                // Ensure price-info section is always visible during filtering
                ensurePriceInfoVisible();
                
                // Check final state
                setTimeout(() => {
                    console.log('=== FINAL CHECK ===');
                    categories.forEach(cat => {
                        const categoryData = cat.getAttribute('data-category');
                        const computedStyle = window.getComputedStyle(cat);
                        const hasHidden = cat.classList.contains('hidden');
                        console.log(`${categoryData}: hidden=${hasHidden}, display=${computedStyle.display}`);
                    });
                }, 50);
                
            } catch (error) {
                console.error('Error in filterPrices:', error);
            }
        }
        
        // Initialize filter buttons
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 DOM Content Loaded - Starting initialization');
            
            // First, let's check what elements exist on the page
            console.log('🔍 All sections on page:', document.querySelectorAll('section'));
            console.log('🔍 All elements with price-info class:', document.querySelectorAll('.price-info'));
            console.log('🔍 All elements with section class:', document.querySelectorAll('.section'));
            
            try {
                const filterButtons = document.querySelectorAll('.filter-btn');
                const categories = document.querySelectorAll('.price-category');
                
                console.log('Found filter buttons:', filterButtons.length);
                console.log('Found categories:', categories.length);
                
                if (filterButtons.length === 0) {
                    console.error('No filter buttons found!');
                    return;
                }
                
                if (categories.length === 0) {
                    console.error('No categories found!');
                    return;
                }
                
                // Add click events to filter buttons
                filterButtons.forEach((button, index) => {
                    console.log(`Setting up button ${index}:`, button.dataset.filter);
                    
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        console.log('Button clicked:', this.dataset.filter);
                        filterPrices(this.dataset.filter);
                    });
                });
                
                // Show all categories initially
                categories.forEach((category, index) => {
                    console.log(`Initializing category ${index}:`, category.dataset.category);
                    category.classList.remove('hidden');
                    category.style.display = 'block';
                });
                
                // CRITICAL: Ensure price-info section is visible on page load
                function ensurePriceInfoVisible() {
                    const priceInfoSections = document.querySelectorAll('section.price-info, .price-info');
                    
                    if (priceInfoSections.length > 0) {
                        console.log('🔍 Ensuring price-info visibility for', priceInfoSections.length, 'sections');
                        
                        priceInfoSections.forEach(section => {
                            // Remove any problematic classes
                            section.classList.remove('hidden', 'section--hidden');
                            section.classList.add('visible');
                            
                            // Force styles to override any animation issues
                            section.style.cssText = `
                                display: block !important;
                                visibility: visible !important;
                                opacity: 1 !important;
                                transform: translateY(0) !important;
                                transition: none !important;
                                position: relative !important;
                                height: auto !important;
                                margin: 4rem 0 !important;
                                padding: 4rem 0 !important;
                                z-index: 1 !important;
                                width: 100% !important;
                            `;
                            
                            // Ensure grid and items are visible
                            const grid = section.querySelector('.price-info__grid');
                            if (grid) {
                                grid.style.cssText = `
                                    display: grid !important;
                                    visibility: visible !important;
                                    opacity: 1 !important;
                                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
                                    gap: 2rem !important;
                                `;
                            }
                            
                            const items = section.querySelectorAll('.price-info__item');
                            items.forEach(item => {
                                item.style.cssText = `
                                    display: block !important;
                                    visibility: visible !important;
                                    opacity: 1 !important;
                                    padding: 2rem !important;
                                `;
                            });
                            
                            // Force a reflow
                            section.offsetHeight;
                        });
                        
                        console.log('✅ Price info sections forced visible');
                        return true;
                    } else {
                        console.error('❌ Price info sections NOT FOUND!');
                        return false;
                    }
                }
                
                // Call immediately
                ensurePriceInfoVisible();
                
                // Call again after a short delay to handle timing issues
                setTimeout(ensurePriceInfoVisible, 100);
                setTimeout(ensurePriceInfoVisible, 500);
                setTimeout(ensurePriceInfoVisible, 1000);
                setTimeout(ensurePriceInfoVisible, 2000);
                
                // Simple price-info visibility enforcement
                  function ensurePriceInfoVisible() {
                      const priceInfoSection = document.querySelector('section.price-info');
                      if (priceInfoSection) {
                          priceInfoSection.style.setProperty('display', 'block', 'important');
                          priceInfoSection.style.setProperty('visibility', 'visible', 'important');
                          priceInfoSection.style.setProperty('opacity', '1', 'important');
                          
                          // Ensure grid is visible
                          const grid = priceInfoSection.querySelector('.price-info__grid');
                          if (grid) {
                              grid.style.setProperty('display', 'grid', 'important');
                              grid.style.setProperty('visibility', 'visible', 'important');
                              grid.style.setProperty('opacity', '1', 'important');
                          }
                          
                          // Ensure items are visible
                          const items = priceInfoSection.querySelectorAll('.price-info__item');
                          items.forEach(item => {
                              item.style.setProperty('display', 'block', 'important');
                              item.style.setProperty('visibility', 'visible', 'important');
                              item.style.setProperty('opacity', '1', 'important');
                          });
                          
                          // Ensure icons are properly styled
                          const icons = priceInfoSection.querySelectorAll('.price-info__icon');
                          icons.forEach(icon => {
                              icon.style.setProperty('display', 'flex', 'important');
                              icon.style.setProperty('align-items', 'center', 'important');
                              icon.style.setProperty('justify-content', 'center', 'important');
                          });
                      }
                  }
                  
                  // Run once on load and then periodically
                  ensurePriceInfoVisible();
                  setInterval(ensurePriceInfoVisible, 1000);
                
                console.log('✅ Initialization complete');
                
            } catch (error) {
                console.error('Error during initialization:', error);
            }
        });
        
        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize language switcher scroll effects (one-time check)
            initializeLanguageScrollEffects();
            initializeBackButtonAnimations();
        });

        // Initialize back button animations
        function initializeBackButtonAnimations() {
            const backButton = document.querySelector('.price-hero__back');
            if (backButton) {
                // Add ripple effect on click
                backButton.addEventListener('click', function(e) {
                    createRippleEffect(e, this);
                });

                // Add hover animations
                backButton.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-4px) scale(1.03)';
                });

                backButton.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            }
        }

        // Create ripple effect
        function createRippleEffect(event, element) {
            const ripple = document.createElement('span');
            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                pointer-events: none;
                animation: ripple 0.6s ease-out;
                z-index: 1000;
            `;

            element.appendChild(ripple);

            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        }
    </script>
</body>
</html>