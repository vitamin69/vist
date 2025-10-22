// ==================== IMAGE OPTIMIZATION ==================== //
class ImageOptimizer {
  constructor() {
    this.lazyImages = [];
    this.imageObserver = null;
    this.init();
  }

  init() {
    this.setupLazyLoading();
    this.optimizeExistingImages();
  }

  setupLazyLoading() {
    // Check if Intersection Observer is supported
    if ('IntersectionObserver' in window) {
      this.imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });
    }
  }

  loadImage(img) {
    const src = img.dataset.src || img.src;
    if (src && src !== img.src) {
      // Create a new image to preload
      const imageLoader = new Image();
      imageLoader.onload = () => {
        img.src = src;
        img.classList.add('loaded');
        img.removeAttribute('data-src');
      };
      imageLoader.onerror = () => {
        img.classList.add('error');
        console.warn('Failed to load image:', src);
      };
      imageLoader.src = src;
    }
  }

  optimizeExistingImages() {
    // Add loading="lazy" to all images that don't have it
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      img.setAttribute('loading', 'lazy');
    });
  }

  observeImage(img) {
    if (this.imageObserver && img) {
      this.imageObserver.observe(img);
      this.lazyImages.push(img);
    }
  }

  preloadCriticalImages() {
    // Preload hero and above-the-fold images
    const criticalImages = document.querySelectorAll('.hero img, .about img');
    criticalImages.forEach(img => {
      if (img.dataset.src) {
        this.loadImage(img);
      }
    });
  }

  // Fallback for browsers without Intersection Observer
  fallbackLazyLoad() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const loadImagesInViewport = () => {
      lazyImages.forEach(img => {
        if (this.isInViewport(img)) {
          this.loadImage(img);
        }
      });
    };

    // Load images on scroll and resize
    window.addEventListener('scroll', loadImagesInViewport);
    window.addEventListener('resize', loadImagesInViewport);
    
    // Initial load
    loadImagesInViewport();
  }

  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
}

// ==================== TRANSLATIONS ==================== //
const translations = {
  cs: {
    // Navigation
    nav_home: "Domů",
    nav_about: "O nás", 
    nav_services: "Služby",
    nav_portfolio: "Portfolio",
    nav_price: "Ceník",
    nav_contact: "Kontakt",
    
    // Hero Section
    hero_title: "STAVEBNÍ FIRMA<br>VISTAV s.r.o.",
    hero_subtitle: "Více než 15 let zkušeností v komerční a nekomerční výstavbě po celé České republice",
    hero_cta: "Získat konzultaci zdarma",
    hero_portfolio: "Zobrazit portfolio",
    scroll_down: "Přejít dolů",
    
    // Stats
    stat_years: "let zkušeností",
    stat_projects: "dokončených projektů", 
    stat_satisfaction: "% spokojenost",
    
    // About Section
    about_title: "Stavební firma VISTAV s.r.o.",
    about_subtitle: "Stavební řešení pro podnikání i bydlení po celé České republice",
    about_text1: "Společnost VISTAV s.r.o. působí na trhu od roku 2008 a zajišťuje široké spektrum stavebních prací. Realizujeme projekty s důrazem na kvalitu a dlouhou životnost – od průmyslových a školních objektů až po bytové komplexy a rodinné domy.",
    about_text2: "Nabízíme stavby na klíč, rekonstrukce i hrubé stavby. Naší hlavní oblastí působení je Brno, zakázky však úspěšně realizujeme po celé České republice.",
    
    // Features
    feature_quality_title: "Garantovaná kvalita",
    feature_quality_desc: "Používáme pouze kvalitní materiály a moderní technologie",
    feature_time_title: "Dodržení termínů",
    feature_time_desc: "Plánujeme pečlivě a dodržujeme dohodnuté termíny",
    feature_equipment_title: "Vlastní technika",
    feature_equipment_desc: "Moderní stroje a vybavení pro efektivní práci",
    
    // Services
    services_title: "Naše služby",
    services_subtitle: "Komplexní stavební služby pro komerční i nekomerční sektor",
    
    // Service Cards
    service_commercial_title: "Komerční výstavba",
    service_commercial_desc: "Výstavba kancelářských budov, obchodních center, skladů a průmyslových objektů",
    service_commercial_feat1: "Projektování a výstavba",
    service_commercial_feat2: "Technické konzultace",
    service_commercial_feat3: "Komplexní realizace",
    
    service_residential_title: "Nekomerční výstavba",
    service_residential_desc: "Výstavba rodinných domů, bytových komplexů a nekomerčních objektů",
    service_residential_feat1: "Rodinné domy na klíč",
    service_residential_feat2: "Bytové komplexy",
    service_residential_feat3: "Nástavby a přístavby",
    
    service_renovation_title: "Rekonstrukce a renovace",
    service_renovation_desc: "Kompletní rekonstrukce objektů, modernizace a stavební úpravy",
    service_renovation_feat1: "Kompletní rekonstrukce",
    service_renovation_feat2: "Částečné renovace",
    service_renovation_feat3: "Energetické úspory",
    
    // Process section
    process_title: "Jak pracujeme",
    process_subtitle: "Náš ověřený postup pro úspěšnou realizaci projektů",
    
    process_step1_title: "Konzultace a analýza",
    process_step1_desc: "Provedeme detailní analýzu vašich přání a navrhneme optimální řešení",
    
    process_step2_title: "Projektování a plánování",
    process_step2_desc: "Vytvoříme detailní projekt a časový harmonogram prací",
    
    process_step3_title: "Realizace projektu",
    process_step3_desc: "Zahájíme stavební práce s důrazem na kvalitu a dodržení termínů",
    
    process_step4_title: "Předání a garance",
    process_step4_desc: "Předáme dokončený projekt s kompletní dokumentací a garancemi",
    
    // Portfolio
    portfolio_title: "Portfolio projektů",
    portfolio_subtitle: "Ukázky našich realizovaných projektů",
    portfolio_view_all: "Zobrazit všechny projekty",
    
    // Portfolio Items
    portfolio_item1_title: "Kancelářský komplex Praha",
    portfolio_item1_desc: "Moderní kancelářské prostory",
    portfolio_item2_title: "Rodinný dům Brno",
    portfolio_item2_desc: "Luxusní rodinné bydlení",
    portfolio_item3_title: "Rekonstrukce továrny",
    portfolio_item3_desc: "Přestavba na moderní výrobní halu",
    portfolio_item4_title: "Bytový komplex Ostrava",
    portfolio_item4_desc: "Moderní bydlení pro rodiny",
    
    // Gallery
    gallery_title: "Galerie projektů",
    gallery_subtitle: "Kompletní přehled našich realizovaných projektů",
    gallery_back: "Zpět na portfolio",
    gallery_view_all: "Zobrazit všechny projekty",
    gallery_filter_all: "Všechny",
    gallery_filter_dlazby: "Dlažby",
    gallery_filter_kzs: "KZS",
    gallery_filter_krovy: "Krovy",
    gallery_filter_monolity: "Monolity",
    gallery_filter_omitky: "Omítky",
    gallery_filter_voda_topeni: "Voda a Topení",
    gallery_filter_zdivo: "Zdivo",
    gallery_prev: "Předchozí",
    gallery_next: "Další",
    gallery_close: "Zavřít",
    gallery_description: "Popis projektu",
    gallery_details: "Technické detaily",
    gallery_features: "Klíčové vlastnosti",
    gallery_show_more: "Zobrazit více",
    gallery_collapse: "Sbalit galerii",
    
    // Gallery Modal
    gallery_modal_description: "Popis projektu",
    gallery_modal_details: "Technické údaje",
    gallery_modal_area: "Plocha:",
    gallery_modal_duration: "Doba realizace:",
    gallery_modal_type: "Typ stavby:",
    gallery_modal_features: "Klíčové vlastnosti",
    gallery_modal_feature1: "Moderní architektura",
    gallery_modal_feature2: "Energeticky úsporné řešení",
    gallery_modal_feature3: "Kvalitní materiály",
    gallery_modal_prev: "Předchozí",
    gallery_modal_next: "Další",

    // Portfolio Modal labels
    portfolio_modal_category_label: "Kategorie:",
    portfolio_modal_year_label: "Rok:",
    portfolio_modal_location_label: "Lokalita:",
    
    // Gallery Items
    gallery_item1_title: "Kancelářský komplex Praha",
    gallery_item1_desc: "Moderní kancelářské prostory - 5000 m²",
    gallery_item2_title: "Obchodní centrum Brno",
    gallery_item2_desc: "Velký nákupní komplex - 8000 m²",
    gallery_item3_title: "Rodinný dům Brno",
    gallery_item3_desc: "Luxusní rodinné bydlení - 250 m²",
    gallery_item4_title: "Bytový komplex Ostrava",
    gallery_item4_desc: "Moderní bydlení pro rodiny - 3200 m²",
    gallery_item5_title: "Průmyslová hala Plzeň",
    gallery_item5_desc: "Výrobní prostory - 6000 m²",
    gallery_item6_title: "Rekonstrukce školy",
    gallery_item6_desc: "Modernizace vzdělávacího zařízení - 2800 m²",
    gallery_item7_title: "Wellness centrum",
    gallery_item7_desc: "Relaxační a sportovní zařízení - 1500 m²",
    gallery_item8_title: "Logistické centrum",
    gallery_item8_desc: "Skladové a distribuční prostory - 12000 m²",
    
    // Testimonials
    testimonials_title: "Reference klientů",
    testimonials_subtitle: "Co říkají naši spokojení zákazníci",
    testimonial1_text: "Výborná práce, profesionální přístup a dodržení termínů. Doporučujeme!",
    testimonial1_position: "Ředitel společnosti ABC s.r.o.",
    testimonial2_text: "Kvalitní provedení rekonstrukce našeho domu. Jsme velmi spokojeni.",
    testimonial2_position: "Majitel rodinného domu",
    testimonial3_text: "Spolehlivá firma s dlouholetými zkušenostmi. Skvělá komunikace.",
    testimonial3_position: "Projektový manažer XYZ a.s.",
    
    // Contact Details
    contact_address: "Hudcova 246/43, Brno, Česká republika",
    contact_hours: "Po-Pá: 8:00-17:00, So: 9:00-13:00",
    
    // Footer
    footer_contact: "Kontakt",
    footer_description: "Profesionální stavební služby po celé České republice",
    footer_navigation_title: "Navigace",
    footer_services_title: "Služby",
    footer_service1: "Komerční výstavba",
    footer_service2: "Nekomerční výstavba",
    footer_service3: "Rekonstrukce",
    footer_service4: "Renovace",
    footer_company_title: "Společnost",
    footer_about: "O nás",
    footer_portfolio: "Portfolio",
    footer_references: "Reference",
    footer_contact_title: "Kontakt",
    footer_address: "Hudcova 246/43, Brno, Česká republika",
    footer_rights: "Všechna práva vyhrazena.",
    
    // Contact
    contact_title: "Získejte konzultaci zdarma",
    contact_subtitle: "Napište nám nebo zavolejte. Rádi probereme váš projekt a připravíme cenovou nabídku",
    contact_phone_title: "Telefon",
    contact_email_title: "Email",
    contact_address_title: "Adresa",
    contact_hours_title: "Pracovní doba",
    
    // Form
    form_name_label: "Jméno *",
    form_phone_label: "Telefon *",
    form_email_label: "Email *",
    form_client_type_label: "Typ klienta *",
    form_client_type_individual: "Fyzická osoba",
    form_client_type_company: "Společnost",
    form_company_label: "Společnost",
    form_service_label: "Typ služby *",
    form_service_default: "Vyberte službu",
    form_service_commercial: "Komerční výstavba",
    form_service_residential: "Nekomerční výstavba",
    form_service_renovation: "Rekonstrukce a renovace",
    form_message_label: "Zpráva",
    form_privacy_label: "Souhlasím se zpracováním osobních údajů *",
    form_submit: '<i class="fas fa-paper-plane"></i> Získat konzultaci zdarma',
    
    // Modal
    modal_success_title: "Děkujeme!",
    modal_success_text: "Vaše zpráva byla úspěšně odeslána. Náš tým se vám ozve do 24 hodin.",
    modal_close: "Zavřít",
    
    // Price Page
    price_title: "Ceník stavebních prací",
    price_subtitle: "Orientační ceny našich služeb",
    price_filter_all: "Všechny kategorie",
    price_filter_construction: "Stavební práce",
    price_filter_facades: "Fasády",
    price_filter_tiles: "Obklady",
    price_filter_concrete: "Betonové potěry",
    price_filter_drywall: "Sádrokartony",
    
    // Meta tags
    meta_title: "Vistav s.r.o. - Stavební společnost | Komerční a rezidenční výstavba",
    meta_description: "Profesionální stavební služby v České republice. Specializujeme se na komerční výstavbu, rezidenční projekty a rekonstrukce. Více než 15 let zkušeností.",
    meta_keywords: "stavební společnost, výstavba, rekonstrukce, komerční stavby, rezidenční stavby, Česká republika",
    meta_og_title: "Vistav s.r.o. - Profesionální stavební služby",
    meta_og_description: "Více než 15 let zkušeností v komerční a rezidenční výstavbě po celé České republice. Kvalitní stavební práce včas a v rozpočtu.",
    meta_twitter_title: "Vistav s.r.o. - Profesionální stavební služby",
    meta_twitter_description: "Více než 15 let zkušeností v komerční a rezidenční výstavbě po celé České republice.",
    meta_geo_placename: "Česká republika",
    
    // Page titles
    page_title_index: "Vistav s.r.o. - Stavební společnost | Komerční a rezidenční výstavba",
    page_title_price: "Ceník - VISTAV s.r.o.",
    page_title_admin: "Administrace ceníku - VISTAV s.r.o.",
    page_title_login: "Přihlášení - VISTAV Admin",
    
    // Price page specific
    price_hero_title: "Ceník stavebních prací",
    price_hero_subtitle: "Orientační ceny našich služeb",
    price_hero_back: "Zpět na hlavní stránku",
    price_section_title: "Ceník služeb",
    price_section_subtitle: "Přehled cen podle kategorií",
    price_filter_zpevnene: "Zpevněné plochy",
    price_filter_fasady: "Fasády",
    price_filter_obklady: "Obklady",
    price_filter_betonove: "Betonové potěry",
    price_filter_sadrokartony: "Sádrokartony",
    price_category_zpevnene: "ZPEVNĚNÉ PLOCHY A DLAŽBA",
    price_category_fasady: "FASÁDY",
    price_category_obklady: "OBKLADY",
    price_category_betonove: "BETONOVÉ POTĚRY",
    price_category_sadrokartony: "SÁDROKARTONY",
    price_info_title1: "Orientační ceny",
    price_info_desc1: "Uvedené ceny jsou orientační a mohou se lišit podle konkrétních podmínek projektu.",
    price_info_title2: "Nezávazná kalkulace",
    price_info_desc2: "Pro přesnou kalkulaci kontaktujte naše odborníky, kteří vám připraví detailní nabídku.",
    price_info_title3: "Individuální přístup",
    price_info_desc3: "Každý projekt je jedinečný a zaslouží si individuální přístup a řešení na míru.",
    price_footer_description: "Profesionální stavební služby s důrazem na kvalitu a spokojenost zákazníků.",
    price_footer_contact_title: "Kontakt",
    price_footer_address: "Hudcova 246/43, Brno, Česká republika",
    price_footer_services_title: "Služby",
    price_footer_service1: "Zpevněné plochy",
    price_footer_service2: "Fasády",
    price_footer_service3: "Obklady",
    price_footer_service4: "Betonové potěry",
    price_footer_links_title: "Odkazy",
    price_footer_link1: "Domů",
    price_footer_link2: "O nás",
    price_footer_link3: "Portfolio",
    price_footer_link4: "Kontakt",
    price_footer_copyright: "© 2024 VISTAV s.r.o. Všechna práva vyhrazena.",
    
    // Admin page
    admin_title: "Administrace ceníku",
    admin_subtitle: "Správa cen a služeb pro VISTAV s.r.o.",
    admin_logout: "Odhlásit se",
    admin_load_prices: "Načíst ceník",
    admin_save_changes: "Uložit změny",
    admin_view_prices: "Zobrazit ceník",
    admin_view_dynamic: "Zobrazit dynamický ceník",
    
    // Login
    login_admin_access: "Administrátorský přístup",
    login_username: "Uživatelské jméno:",
    login_password: "Heslo:",
    login_submit: "Přihlásit se",
    login_loading: "Přihlašování...",
    
    // Admin additional
    admin_panel: "Administrátorský panel",
    admin_load_prices: "Načíst ceny",
    admin_save_prices: "Uložit ceny",
    admin_add_service: "Přidat službu",
    admin_cancel: "Zrušit",
    admin_price_editor: "Editor cen",
    admin_add_new_service: "Přidat novou službu",
    admin_service_category: "Kategorie:",
    admin_service_description: "Popis:",
    admin_add_item: "Přidat položku",
    admin_loading: "Načítání...",
    admin_service_name: "Název služby:",
    admin_service_price: "Cena:",
    admin_service_icon: "Ikona (Font Awesome třída):",
    admin_additional_services: "Doplňkové služby",
    admin_error_loading: "Nepodařilo se načíst cenové údaje."
  },
  
  uk: {
    // Navigation
    nav_home: "Головна",
    nav_about: "Про нас",
    nav_services: "Послуги",
    nav_portfolio: "Портфоліо",
    nav_price: "Прайс",
    nav_contact: "Контакти",
    
    // Hero Section
    hero_title: "БУДІВЕЛЬНА КОМПАНІЯ<br>VISTAV s.r.o.",
    hero_subtitle: "Понад 15 років досвіду в комерційному та некомерційному будівництві по всій території Чехії",
    hero_cta: "Отримати безкоштовну консультацію",
    hero_portfolio: "Переглянути портфоліо",
    scroll_down: "Прокрутити вниз",
    
    // Stats
    stat_years: "років досвіду",
    stat_projects: "завершених проектів",
    stat_satisfaction: "% задоволеності",
    
    // About Section
    about_title: "Будівельна компанія VISTAV s.r.o.",
    about_subtitle: "Будівельні рішення для бізнесу та житла по всій Чехії",
    about_text1: "Компанія VISTAV s.r.o. працює з 2008 року та виконує широкий спектр будівельних робіт. Ми реалізуємо проекти з урахуванням високої якості та довговічності — від промислових і навчальних об'єктів до житлових комплексів та приватних будинків.",
    about_text2: "Пропонуємо будівництво «під ключ», реконструкції та зведення будівель у різних форматах. Нашою основною сферою діяльності є Брно, проте ми успішно реалізуємо замовлення по всій території Чехії.",
    
    // Features
    feature_quality_title: "Гарантована якість",
    feature_quality_desc: "Використовуємо лише якісні матеріали та сучасні технології",
    feature_time_title: "Дотримання термінів",
    feature_time_desc: "Ретельно плануємо та дотримуємося узгоджених термінів",
    feature_equipment_title: "Власна техніка",
    feature_equipment_desc: "Сучасні машини та обладнання для ефективної роботи",
    
    // Services
    services_title: "Наші послуги",
    services_subtitle: "Комплексні будівельні послуги для комерційного та некомерційного сектору",
    
    // Service Cards
    service_commercial_title: "Комерційне будівництво",
    service_commercial_desc: "Будівництво офісних будівель, торгових центрів, складів та промислових об'єктів",
    service_commercial_feat1: "Проектування та будівництво",
    service_commercial_feat2: "Технічні консультації",
    service_commercial_feat3: "Комплексна реалізація",
    
    service_residential_title: "Некомерційне будівництво",
    service_residential_desc: "Будівництво приватних будинків, житлових комплексів та некомерційних об'єктів",
    service_residential_feat1: "Приватні будинки під ключ",
    service_residential_feat2: "Житлові комплекси",
    service_residential_feat3: "Надбудови та прибудови",
    
    service_renovation_title: "Реконструкція та ремонт",
    service_renovation_desc: "Повна реконструкція об'єктів, модернізація та будівельні зміни",
    service_renovation_feat1: "Повна реконструкція",
    service_renovation_feat2: "Часткові ремонти",
    service_renovation_feat3: "Енергозбереження",
    
    // Process section
    process_title: "Як ми працюємо",
    process_subtitle: "Наш перевірений процес для успішної реалізації проектів",
    
    process_step1_title: "Консультація та аналіз",
    process_step1_desc: "Проводимо детальний аналіз ваших побажань та пропонуємо оптимальне рішення",
    
    process_step2_title: "Проектування та планування",
    process_step2_desc: "Створюємо детальний проект та часовий графік робіт",
    
    process_step3_title: "Реалізація проекту",
    process_step3_desc: "Розпочинаємо будівельні роботи з акцентом на якість та дотримання термінів",
    
    process_step4_title: "Передача та гарантії",
    process_step4_desc: "Передаємо завершений проект з повною документацією та гарантіями",
    
    // Portfolio
    portfolio_title: "Портфоліо проектів",
    portfolio_subtitle: "Приклади наших реалізованих проектів",
    portfolio_view_all: "Переглянути всі проекти",
    
    // Portfolio Items
    portfolio_item1_title: "Офісний комплекс Прага",
    portfolio_item1_desc: "Сучасні офісні приміщення",
    portfolio_item2_title: "Приватний будинок Брно",
    portfolio_item2_desc: "Розкішне приватне житло",
    portfolio_item3_title: "Реконструкція заводу",
    portfolio_item3_desc: "Перебудова в сучасний виробничий цех",
    portfolio_item4_title: "Житловий комплекс Острава",
    portfolio_item4_desc: "Сучасне житло для сімей",
    
    // Gallery
    gallery_title: "Галерея проектів",
    gallery_subtitle: "Повний огляд наших реалізованих проектів",
    gallery_back: "Назад до портфоліо",
    gallery_view_all: "Переглянути всі проекти",
    gallery_filter_all: "Всі",
    gallery_filter_dlazby: "Плитка",
    gallery_filter_kzs: "КЗС",
    gallery_filter_krovy: "Покрівлі",
    gallery_filter_monolity: "Моноліти",
    gallery_filter_omitky: "Штукатурки",
    gallery_filter_voda_topeni: "Вода та Опалення",
    gallery_filter_zdivo: "Кладка",
    gallery_prev: "Попередній",
    gallery_next: "Наступний",
    gallery_close: "Закрити",
    gallery_description: "Опис проекту",
    gallery_details: "Технічні деталі",
    gallery_features: "Ключові особливості",
    gallery_show_more: "Показати більше",
    gallery_collapse: "Згорнути галерею",
    
    // Gallery Modal
    gallery_modal_description: "Опис проекту",
    gallery_modal_details: "Технічні дані",
    gallery_modal_area: "Площа:",
    gallery_modal_duration: "Час реалізації:",
    gallery_modal_type: "Тип будівництва:",
    gallery_modal_features: "Ключові особливості",
    gallery_modal_feature1: "Сучасна архітектура",
    gallery_modal_feature2: "Енергоефективне рішення",
    gallery_modal_feature3: "Якісні матеріали",
    gallery_modal_prev: "Попередній",
    gallery_modal_next: "Наступний",

    // Portfolio Modal labels
    portfolio_modal_category_label: "Категорія:",
    portfolio_modal_year_label: "Рік:",
    portfolio_modal_location_label: "Локація:",
    
    // Gallery Items
    gallery_item1_title: "Офісний комплекс Прага",
    gallery_item1_desc: "Сучасні офісні приміщення - 5000 м²",
    gallery_item2_title: "Торговий центр Брно",
    gallery_item2_desc: "Великий торговий комплекс - 8000 м²",
    gallery_item3_title: "Приватний будинок Брно",
    gallery_item3_desc: "Розкішне приватне житло - 250 м²",
    gallery_item4_title: "Житловий комплекс Острава",
    gallery_item4_desc: "Сучасне житло для сімей - 3200 м²",
    gallery_item5_title: "Промислова зала Пльзень",
    gallery_item5_desc: "Виробничі приміщення - 6000 м²",
    gallery_item6_title: "Реконструкція школи",
    gallery_item6_desc: "Модернізація освітнього закладу - 2800 м²",
    gallery_item7_title: "Велнес центр",
    gallery_item7_desc: "Релаксаційний та спортивний заклад - 1500 м²",
    gallery_item8_title: "Логістичний центр",
    gallery_item8_desc: "Складські та дистрибуційні приміщення - 12000 м²",
    
    // Testimonials
    testimonials_title: "Відгуки клієнтів",
    testimonials_subtitle: "Що кажуть наші задоволені замовники",
    testimonial1_text: "Відмінна робота, професійний підхід та дотримання термінів. Рекомендуємо!",
    testimonial1_position: "Директор компанії ABC s.r.o.",
    testimonial2_text: "Якісне виконання реконструкції нашого будинку. Ми дуже задоволені.",
    testimonial2_position: "Власник приватного будинку",
    testimonial3_text: "Надійна фірма з багаторічним досвідом. Відмінна комунікація.",
    testimonial3_position: "Проектний менеджер XYZ a.s.",
    
    // Contact Details
    contact_address: "Hudcova 246/43, Брно, Чеська Республіка",
    contact_hours: "Пн-Пт: 8:00-17:00, Сб: 9:00-13:00",
    
    // Footer
    footer_contact: "Контакти",
    footer_description: "Професійні будівельні послуги по всій Чеській Республіці",
    footer_navigation_title: "Навігація",
    footer_services_title: "Послуги",
    footer_service1: "Комерційне будівництво",
    footer_service2: "Некомерційне будівництво",
    footer_service3: "Реконструкція",
    footer_service4: "Реновація",
    footer_company_title: "Компанія",
    footer_about: "Про нас",
    footer_portfolio: "Портфоліо",
    footer_references: "Рекомендації",
    footer_contact_title: "Контакти",
    footer_address: "Hudcova 246/43, Брно, Чеська Республіка",
    footer_rights: "Всі права захищені.",
    
    // Contact
    contact_title: "Отримайте безкоштовну консультацію",
    contact_subtitle: "Напишіть нам або зателефонуйте. Ми з радістю обговоримо ваш проект та підготуємо цінову пропозицію",
    contact_phone_title: "Телефон",
    contact_email_title: "Email",
    contact_address_title: "Адреса",
    contact_hours_title: "Робочий час",
    
    // Form
    form_name_label: "Ім'я *",
    form_phone_label: "Телефон *",
    form_email_label: "Email *",
    form_client_type_label: "Тип клієнта *",
    form_client_type_individual: "Фізична особа",
    form_client_type_company: "Компанія",
    form_company_label: "Компанія",
    form_service_label: "Тип послуги *",
    form_service_default: "Оберіть послугу",
    form_service_commercial: "Комерційне будівництво",
    form_service_residential: "Некомерційне будівництво",
    form_service_renovation: "Реконструкція та ремонт",
    form_message_label: "Повідомлення",
    form_privacy_label: "Погоджуюся з обробкою персональних даних *",
    form_submit: '<i class="fas fa-paper-plane"></i> Отримати безкоштовну консультацію',
    
    // Modal
    modal_success_title: "Дякуємо!",
    modal_success_text: "Ваше повідомлення було успішно відправлено. Наша команда зв'яжеться з вами протягом 24 годин.",
    modal_close: "Закрити",
    
    // Price Page
    price_title: "Прайс-лист будівельних робіт",
    price_subtitle: "Орієнтовні ціни наших послуг",
    price_filter_all: "Всі категорії",
    price_filter_construction: "Будівельні роботи",
    price_filter_facades: "Фасади",
    price_filter_tiles: "Облицювання",
    price_filter_concrete: "Бетонні стяжки",
    price_filter_drywall: "Гіпсокартон",
    
    // Meta tags
    meta_title: "Vistav s.r.o. - Будівельна компанія | Комерційне та житлове будівництво",
    meta_description: "Професійні будівельні послуги в Чехії. Спеціалізуємося на комерційному будівництві, житлових проектах та реконструкції. Понад 15 років досвіду.",
    meta_keywords: "будівельна компанія, будівництво, реконструкція, комерційні будівлі, житлові будинки, Чехія",
    meta_og_title: "Vistav s.r.o. - Професійні будівельні послуги",
    meta_og_description: "Понад 15 років досвіду в комерційному та житловому будівництві по всій території Чехії. Якісні будівельні роботи вчасно та в межах бюджету.",
    meta_twitter_title: "Vistav s.r.o. - Професійні будівельні послуги",
    meta_twitter_description: "Понад 15 років досвіду в комерційному та житловому будівництві по всій території Чехії.",
    meta_geo_placename: "Чехія",
    
    // Page titles
    page_title_index: "Vistav s.r.o. - Будівельна компанія | Комерційне та житлове будівництво",
    page_title_price: "Прайс-лист - VISTAV s.r.o.",
    page_title_admin: "Адміністрування прайс-листа - VISTAV s.r.o.",
    page_title_login: "Вхід - VISTAV Admin",
    
    // Price page translations
    price_hero_title: "Прайс-лист будівельних робіт",
    price_hero_subtitle: "Орієнтовні ціни наших послуг",
    price_hero_back: "Повернутися на головну",
    price_section_title: "Прайс-лист послуг",
    price_section_subtitle: "Огляд цін за категоріями",
    price_filter_zpevnene: "Зміцнені поверхні",
    price_filter_fasady: "Фасади",
    price_filter_obklady: "Облицювання",
    price_filter_betonove: "Бетонні стяжки",
    price_filter_sadrokartony: "Гіпсокартон",
    price_category_zpevnene: "ЗМІЦНЕНІ ПОВЕРХНІ ТА ПЛИТКА",
    price_category_fasady: "ФАСАДИ",
    price_category_obklady: "ОБЛИЦЮВАННЯ",
    price_category_betonove: "БЕТОННІ СТЯЖКИ",
    price_category_sadrokartony: "ГІПСОКАРТОН",
    price_info_title1: "Професійний підхід",
    price_info_desc1: "Наша команда має багаторічний досвід у будівельній галузі та використовує сучасні технології.",
    price_info_title2: "Якісні матеріали",
    price_info_desc2: "Працюємо тільки з перевіреними постачальниками та використовуємо матеріали найвищої якості.",
    price_info_title3: "Гарантія якості",
    price_info_desc3: "Надаємо гарантію на всі виконані роботи та забезпечуємо післягарантійне обслуговування.",
    price_footer_description: "Професійні будівельні послуги з акцентом на якість та задоволення клієнтів.",
    price_footer_contact_title: "Контакти",
    price_footer_address: "Hudcova 246/43, Брно, Чеська Республіка",
    price_footer_services_title: "Послуги",
    price_footer_service1: "Зміцнені поверхні",
    price_footer_service2: "Фасади",
    price_footer_service3: "Облицювання",
    price_footer_service4: "Бетонні стяжки",
    price_footer_links_title: "Посилання",
    price_footer_link1: "Головна",
    price_footer_link2: "Про нас",
    price_footer_link3: "Портфоліо",
    price_footer_link4: "Контакти",
    price_footer_copyright: "© 2024 VISTAV s.r.o. Всі права захищені.",
    
    // Admin page translations
    admin_title: "Адміністрування прайс-листа",
    admin_subtitle: "Управління цінами та послугами для VISTAV s.r.o.",
    admin_logout: "Вийти",
    admin_load_prices: "Завантажити прайс-лист",
    admin_save_changes: "Зберегти зміни",
    admin_view_prices: "Переглянути прайс-лист",
    admin_view_dynamic: "Переглянути динамічний прайс-лист",
    
    // Login
    login_admin_access: "Адміністраторський доступ",
    login_username: "Ім'я користувача:",
    login_password: "Пароль:",
    login_submit: "Увійти",
    login_loading: "Вхід...",
    
    // Admin additional
    admin_panel: "Адміністраторська панель",
    admin_load_prices: "Завантажити ціни",
    admin_save_prices: "Зберегти ціни",
    admin_add_service: "Додати послугу",
    admin_cancel: "Скасувати",
    admin_price_editor: "Редактор цін",
    admin_add_new_service: "Додати нову послугу",
    admin_service_category: "Категорія:",
    admin_service_description: "Опис:",
    admin_add_item: "Додати елемент",
    admin_loading: "Завантаження...",
    admin_service_name: "Назва послуги:",
    admin_service_price: "Ціна:",
    admin_service_icon: "Іконка (клас Font Awesome):",
    admin_additional_services: "Додаткові послуги",
    admin_error_loading: "Не вдалося завантажити цінові дані."
  },
  
  en: {
    // Navigation
    nav_home: "Home",
    nav_about: "About",
    nav_services: "Services",
    nav_portfolio: "Portfolio",
    nav_price: "Pricing",
    nav_contact: "Contact",
    
    // Hero Section
    hero_title: "CONSTRUCTION COMPANY<br>VISTAV s.r.o.",
    hero_subtitle: "Over 15 years of experience in commercial and non-commercial construction throughout the Czech Republic",
    hero_cta: "Get Free Consultation",
    hero_portfolio: "View Portfolio",
    scroll_down: "Scroll Down",
    
    // Stats
    stat_years: "years of experience",
    stat_projects: "completed projects",
    stat_satisfaction: "% satisfaction",
    
    // About Section
    about_title: "Construction Company VISTAV s.r.o.",
    about_subtitle: "Construction solutions for business and housing across the Czech Republic",
    about_text1: "Since 2008, VISTAV s.r.o. has been providing a wide range of construction services. We deliver projects with a focus on quality and durability – from industrial halls and schools to residential complexes and family houses.",
    about_text2: "Our services include turnkey construction, renovations, and structural works. While our main area of operation is Brno, we successfully complete projects throughout the entire Czech Republic.",
    
    // Features
    feature_quality_title: "Guaranteed Quality",
    feature_quality_desc: "We use only quality materials and modern technologies",
    feature_time_title: "Meeting Deadlines",
    feature_time_desc: "We carefully plan and adhere to agreed deadlines",
    feature_equipment_title: "Own Equipment",
    feature_equipment_desc: "Modern machines and equipment for efficient work",
    
    // Services
    services_title: "Our Services",
    services_subtitle: "Comprehensive construction services for commercial and non-commercial sectors",
    
    // Service Cards
    service_commercial_title: "Commercial Construction",
    service_commercial_desc: "Construction of office buildings, shopping centers, warehouses and industrial facilities",
    service_commercial_feat1: "Design and construction",
    service_commercial_feat2: "Technical consultations",
    service_commercial_feat3: "Complete implementation",
    
    service_residential_title: "Non-commercial Construction",
    service_residential_desc: "Construction of private houses, residential complexes and non-commercial facilities",
    service_residential_feat1: "Turnkey private houses",
    service_residential_feat2: "Residential complexes",
    service_residential_feat3: "Extensions and additions",
    
    service_renovation_title: "Reconstruction and Renovation",
    service_renovation_desc: "Complete reconstruction of facilities, modernization and construction changes",
    service_renovation_feat1: "Complete reconstruction",
    service_renovation_feat2: "Partial renovations",
    service_renovation_feat3: "Energy savings",
    
    // Process section
    process_title: "How we work",
    process_subtitle: "Our proven process for successful project implementation",
    
    process_step1_title: "Consultation and analysis",
    process_step1_desc: "We conduct a detailed analysis of your preferences and propose optimal solutions",
    
    process_step2_title: "Design and planning",
    process_step2_desc: "We create a detailed project and work schedule",
    
    process_step3_title: "Project implementation",
    process_step3_desc: "We begin construction work with emphasis on quality and meeting deadlines",
    
    process_step4_title: "Handover and warranties",
    process_step4_desc: "We deliver the completed project with complete documentation and warranties",
    
    // Portfolio
    portfolio_title: "Project Portfolio",
    portfolio_subtitle: "Examples of our completed projects",
    portfolio_view_all: "View All Projects",
    
    // Portfolio Items
    portfolio_item1_title: "Office Complex Prague",
    portfolio_item1_desc: "Modern office premises",
    portfolio_item2_title: "Private House Brno",
    portfolio_item2_desc: "Luxury private residence",
    portfolio_item3_title: "Factory Reconstruction",
    portfolio_item3_desc: "Conversion to modern production hall",
    portfolio_item4_title: "Residential Complex Ostrava",
    portfolio_item4_desc: "Modern housing for families",
    
    // Gallery
    gallery_title: "Project Gallery",
    gallery_subtitle: "Complete overview of our completed projects",
    gallery_back: "Back to Portfolio",
    gallery_view_all: "View All Projects",
    gallery_filter_all: "All",
    gallery_filter_dlazby: "Tiles",
    gallery_filter_kzs: "KZS",
    gallery_filter_krovy: "Roofing",
    gallery_filter_monolity: "Monoliths",
    gallery_filter_omitky: "Plasters",
    gallery_filter_voda_topeni: "Water & Heating",
    gallery_filter_zdivo: "Masonry",
    gallery_prev: "Previous",
    gallery_next: "Next",
    gallery_close: "Close",
    gallery_show_more: "Show more",
    gallery_collapse: "Collapse gallery",
    gallery_description: "Project Description",
    gallery_details: "Technical Details",
    gallery_features: "Key Features",
    
    // Gallery Modal
    gallery_modal_description: "Project Description",
    gallery_modal_details: "Technical Data",
    gallery_modal_area: "Area:",
    gallery_modal_duration: "Duration:",
    gallery_modal_type: "Construction Type:",
    gallery_modal_features: "Key Features",
    gallery_modal_feature1: "Modern Architecture",
    gallery_modal_feature2: "Energy Efficient Solution",
    gallery_modal_feature3: "Quality Materials",
    gallery_modal_prev: "Previous",
    gallery_modal_next: "Next",

    // Portfolio Modal labels
    portfolio_modal_category_label: "Category:",
    portfolio_modal_year_label: "Year:",
    portfolio_modal_location_label: "Location:",
    
    // Gallery Items
    gallery_item1_title: "Office Complex Prague",
    gallery_item1_desc: "Modern office premises - 5000 m²",
    gallery_item2_title: "Shopping Center Brno",
    gallery_item2_desc: "Large shopping complex - 8000 m²",
    gallery_item3_title: "Private House Brno",
    gallery_item3_desc: "Luxury private residence - 250 m²",
    gallery_item4_title: "Residential Complex Ostrava",
    gallery_item4_desc: "Modern housing for families - 3200 m²",
    gallery_item5_title: "Industrial Hall Plzen",
    gallery_item5_desc: "Production facilities - 6000 m²",
    gallery_item6_title: "School Reconstruction",
    gallery_item6_desc: "Educational facility modernization - 2800 m²",
    gallery_item7_title: "Wellness Center",
    gallery_item7_desc: "Relaxation and sports facility - 1500 m²",
    gallery_item8_title: "Logistics Center",
    gallery_item8_desc: "Warehouse and distribution facilities - 12000 m²",
    
    // Testimonials
    testimonials_title: "Client References",
    testimonials_subtitle: "What our satisfied customers say",
    testimonial1_text: "Excellent work, professional approach and meeting deadlines. We recommend!",
    testimonial1_position: "Director of ABC s.r.o.",
    testimonial2_text: "Quality execution of our house reconstruction. We are very satisfied.",
    testimonial2_position: "Private house owner",
    testimonial3_text: "Reliable company with years of experience. Excellent communication.",
    testimonial3_position: "Project manager XYZ a.s.",
    
    // Contact Details
    contact_address: "Hudcova 246/43, Brno, Czech Republic",
    contact_hours: "Mon-Fri: 8:00-17:00, Sat: 9:00-13:00",
    
    // Footer
    footer_contact: "Contact",
    footer_description: "Professional construction services throughout the Czech Republic",
    footer_navigation_title: "Navigation",
    footer_services_title: "Services",
    footer_service1: "Commercial construction",
    footer_service2: "Residential construction",
    footer_service3: "Reconstruction",
    footer_service4: "Renovation",
    footer_company_title: "Company",
    footer_about: "About us",
    footer_portfolio: "Portfolio",
    footer_references: "References",
    footer_contact_title: "Contact",
    footer_address: "Hudcova 246/43, Brno, Czech Republic",
    footer_rights: "All rights reserved.",
    
    // FormContact
    contact_title: "Get Free Consultation",
    contact_subtitle: "Write to us or call. We will gladly discuss your project and prepare a price quote",
    contact_phone_title: "Phone",
    contact_email_title: "Email",
    contact_address_title: "Address",
    contact_hours_title: "Working Hours",
    
    // Form
    form_name_label: "Name *",
    form_phone_label: "Phone *",
    form_email_label: "Email *",
    form_client_type_label: "Client Type *",
    form_client_type_individual: "Individual",
    form_client_type_company: "Company",
    form_company_label: "Company",
    form_service_label: "Service Type *",
    form_service_default: "Select service",
    form_service_commercial: "Commercial construction",
    form_service_residential: "Non-commercial construction",
    form_service_renovation: "Reconstruction and renovation",
    form_message_label: "Message",
    form_privacy_label: "I agree to personal data processing *",
    form_submit: '<i class="fas fa-paper-plane"></i> Get Free Consultation',
    
    // Modal
    modal_success_title: "Thank you!",
    modal_success_text: "Your message has been successfully sent. Our team will contact you within 24 hours.",
    modal_close: "Close",
    
    // Price Page
    price_title: "Construction Work Price List",
    price_subtitle: "Indicative prices for our services",
    price_filter_all: "All categories",
    price_filter_construction: "Construction work",
    price_filter_facades: "Facades",
    price_filter_tiles: "Tiling",
    price_filter_concrete: "Concrete screeds",
    price_filter_drywall: "Drywall",
    
    // Meta tags
    meta_title: "Vistav s.r.o. - Construction Company | Commercial and Residential Construction",
    meta_description: "Professional construction services in Czech Republic. We specialize in commercial construction, residential projects and reconstruction. Over 15 years of experience.",
    meta_keywords: "construction company, construction, reconstruction, commercial buildings, residential houses, Czech Republic",
    meta_og_title: "Vistav s.r.o. - Professional Construction Services",
    meta_og_description: "Over 15 years of experience in commercial and residential construction throughout Czech Republic. Quality construction work on time and within budget.",
    meta_twitter_title: "Vistav s.r.o. - Professional Construction Services",
    meta_twitter_description: "Over 15 years of experience in commercial and residential construction throughout Czech Republic.",
    meta_geo_placename: "Czech Republic",
    
    // Page titles
    page_title_index: "Vistav s.r.o. - Construction Company | Commercial and Residential Construction",
    page_title_price: "Price List - VISTAV s.r.o.",
    page_title_admin: "Price List Administration - VISTAV s.r.o.",
    page_title_login: "Login - VISTAV Admin",
    
    // Price page translations
    price_hero_title: "Construction Work Price List",
    price_hero_subtitle: "Indicative prices for our services",
    price_hero_back: "Back to main page",
    price_section_title: "Service Price List",
    price_section_subtitle: "Price overview by categories",
    price_filter_zpevnene: "Reinforced surfaces",
    price_filter_fasady: "Facades",
    price_filter_obklady: "Cladding",
    price_filter_betonove: "Concrete screeds",
    price_filter_sadrokartony: "Drywall",
    price_category_zpevnene: "REINFORCED SURFACES AND PAVING",
    price_category_fasady: "FACADES",
    price_category_obklady: "CLADDING",
    price_category_betonove: "CONCRETE SCREEDS",
    price_category_sadrokartony: "DRYWALL",
    price_info_title1: "Professional approach",
    price_info_desc1: "Our team has many years of experience in the construction industry and uses modern technologies.",
    price_info_title2: "Quality materials",
    price_info_desc2: "We work only with verified suppliers and use the highest quality materials.",
    price_info_title3: "Quality guarantee",
    price_info_desc3: "We provide a guarantee on all work performed and ensure post-warranty service.",
    price_footer_description: "Professional construction services with emphasis on quality and customer satisfaction.",
    price_footer_contact_title: "Contact",
    price_footer_address: "Hudcova 246/43, Brno, Czech Republic",
    price_footer_services_title: "Services",
    price_footer_service1: "Reinforced surfaces",
    price_footer_service2: "Facades",
    price_footer_service3: "Cladding",
    price_footer_service4: "Concrete screeds",
    price_footer_links_title: "Links",
    price_footer_link1: "Home",
    price_footer_link2: "About us",
    price_footer_link3: "Portfolio",
    price_footer_link4: "Contact",
    price_footer_copyright: "© 2024 VISTAV s.r.o. All rights reserved.",
    
    // Admin page translations
    admin_title: "Price List Administration",
    admin_subtitle: "Price and service management for VISTAV s.r.o.",
    admin_logout: "Logout",
    admin_load_prices: "Load price list",
    admin_save_changes: "Save changes",
    admin_view_prices: "View price list",
    admin_view_dynamic: "View dynamic price list",
    
    // Login
    login_admin_access: "Administrator Access",
    login_username: "Username:",
    login_password: "Password:",
    login_submit: "Login",
    login_loading: "Logging in...",
    
    // Admin additional
    admin_panel: "Administrator Panel",
    admin_load_prices: "Load Prices",
    admin_save_prices: "Save Prices",
    admin_add_service: "Add Service",
    admin_cancel: "Cancel",
    admin_price_editor: "Price Editor",
    admin_add_new_service: "Add New Service",
    admin_service_category: "Category:",
    admin_service_description: "Description:",
    admin_add_item: "Add Item",
    admin_loading: "Loading...",
    admin_service_name: "Service name:",
    admin_service_price: "Price:",
    admin_service_icon: "Icon (Font Awesome class):",
    admin_additional_services: "Additional services",
    admin_error_loading: "Failed to load pricing data."
  }
};

// ==================== GLOBAL VARIABLES ==================== //
let currentLanguage = 'cs';
let imageOptimizer = null;

// ==================== DOM ELEMENTS ==================== //
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navClose = document.getElementById('nav-close');
const navLinks = document.querySelectorAll('.nav__link');
const header = document.getElementById('header');
const backToTop = document.getElementById('back-to-top');
const faqItems = document.querySelectorAll('.faq__item');
const contactForm = document.getElementById('contact-form');
const successModal = document.getElementById('success-modal');
const closeModal = document.getElementById('close-modal');
const languageButtons = document.querySelectorAll('.lang-btn');
const languageSwitcher = document.getElementById('language-switcher');

// ==================== CSRF TOKEN HANDLING (Server-issued) ==================== //
async function setCSRFToken(force = false) {
  const tokenField = document.getElementById('csrf_token');
  if (!tokenField) return;

  // If a token is already present, avoid re-fetching to prevent resetting server-side time-trap
  const existingToken = tokenField.value || sessionStorage.getItem('csrf_token');
  if (existingToken && !force) {
    tokenField.value = existingToken;
    // Seed client-side start timestamp if missing (approximate to avoid UX errors)
    if (!sessionStorage.getItem('csrf_token_received_ts')) {
      sessionStorage.setItem('csrf_token_received_ts', String(Date.now()));
    }
    return;
  }

  try {
    const res = await fetch('php/handler.php?action=get_csrf_token', {
      method: 'GET',
      credentials: 'same-origin'
    });
    const data = await res.json();
    if (data && data.success && data.token) {
      tokenField.value = data.token;
      sessionStorage.setItem('csrf_token', data.token);
      sessionStorage.setItem('csrf_token_received_ts', String(Date.now()));
      if (typeof data.min_submission_delay === 'number') {
        sessionStorage.setItem('min_submission_delay', String(data.min_submission_delay));
      }
    }
  } catch (err) {
    console.error('Failed to fetch CSRF token:', err);
  }
}

// Gate submit button until minimum delay since token retrieval
function enforceMinSubmitDelay() {
  if (!contactForm) return;
  const submitButton = contactForm.querySelector('button[type="submit"]');
  if (!submitButton) return;

  const minDelayStr = sessionStorage.getItem('min_submission_delay');
  const receivedTsStr = sessionStorage.getItem('csrf_token_received_ts');
  const minDelay = minDelayStr ? parseInt(minDelayStr, 10) : 0;
  const receivedTs = receivedTsStr ? parseInt(receivedTsStr, 10) : 0;
  if (!minDelay || !receivedTs) return;

  const waitMessages = {
    cs: '<i class="fas fa-hourglass-half"></i> Počkejte {s}s…',
    uk: '<i class="fas fa-hourglass-half"></i> Зачекайте {s}с…',
    en: '<i class="fas fa-hourglass-half"></i> Please wait {s}s…'
  };

  const originalHTML = translations[currentLanguage]?.form_submit || submitButton.innerHTML;
  const tick = () => {
    const elapsed = Math.floor((Date.now() - receivedTs) / 1000);
    const remaining = Math.max(minDelay - elapsed, 0);
    if (remaining > 0) {
      submitButton.disabled = true;
      const msgTmpl = waitMessages[currentLanguage] || waitMessages.cs;
      submitButton.innerHTML = msgTmpl.replace('{s}', String(remaining));
    } else {
      submitButton.disabled = false;
      submitButton.innerHTML = originalHTML;
      clearInterval(timerId);
    }
  };
  tick();
  const timerId = setInterval(tick, 500);
}

// ==================== INITIALIZATION ==================== //
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded fired');
  // Load language preference first
  loadLanguagePreference();
  console.log('Current language after load:', currentLanguage);
  
  // Initialize image optimizer
  imageOptimizer = new ImageOptimizer();
  imageOptimizer.init();
  
  // Preload critical images after a short delay
  setTimeout(() => {
    imageOptimizer.preloadCriticalImages();
  }, 100);
  
  initializeAOS();
  initializeNavigation();
  initializeScrollEffects();
  initializeCounters();
  initializeParallax();
  initializeFAQ();
  initializeForm();
  initializeLanguageSwitcher();
  initializePhoneMask();
  // Set CSRF token on page load (force fetch once), then enforce submit delay gate
  setCSRFToken(true).then(() => enforceMinSubmitDelay());
  
  // Initialize interactive animations
  interactiveAnimations = new InteractiveAnimations();
  interactiveAnimations.init();
  
  // Initialize loading animations
    loadingAnimations = new LoadingAnimations();
    loadingAnimations.init();

    // Initialize mobile optimization
    mobileOptimization = new MobileOptimization();
    mobileOptimization.init();
    mobileOptimization.disableAnimationsForLowEnd();



    // Add page loaded class
    document.body.classList.add('page-loaded');
  
  // Set initial language
  setLanguage(currentLanguage);
  
  // Add price link debugger
  addPriceLinkDebugger();
});

// ==================== AOS INITIALIZATION ==================== //
function initializeAOS() {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 1200,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100,
      delay: 100
    });
  }
}

// ==================== NAVIGATION ==================== //
function initializeNavigation() {
  // Mobile menu toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.add('active');
    });
  }
  
  if (navClose && navMenu) {
    navClose.addEventListener('click', () => {
      navMenu.classList.remove('active');
    });
  }
  
  // Close mobile menu when clicking on nav links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = e.target.getAttribute('href');
      
      // Only close menu for internal links
      if (!targetId.includes('.html') && targetId.startsWith('#')) {
        navMenu.classList.remove('active');
      }
    });
  });
  
  // Smooth scroll for anchor links
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      
      console.log('Navigation clicked:', targetId);
      
      // Check if it's an external link (like price_dynamic.php)
      if (targetId.includes('.html') || targetId.includes('.php') || !targetId.startsWith('#')) {
        console.log('External link detected, allowing navigation');
        // Allow normal navigation for external links
        return;
      }
      
      console.log('Internal anchor link, preventing default');
      e.preventDefault();
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        const headerHeight = header.offsetHeight;
        const targetPosition = targetSection.offsetTop - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ==================== SCROLL EFFECTS ==================== //
function initializeScrollEffects() {
  let lastScrollY = window.scrollY;
  const languageSwitcherElement = document.getElementById('language-switcher');
  
  function handleScroll() {
    const currentScrollY = window.scrollY;
    
    // Header scroll effect
    if (header) {
      if (currentScrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    
    // Back to top button
    if (backToTop) {
      if (currentScrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
    
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
    scrollTimeout = setTimeout(handleScroll, 10);
  });
  
  // Back to top functionality
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

// ==================== ABOUT SECTION SLIDE ANIMATION ==================== //


// ==================== COUNTERS ANIMATION ==================== //
function initializeCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
  };
  
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  counters.forEach(counter => {
    counterObserver.observe(counter);
  });
}

function animateCounter(element) {
  const target = parseInt(element.getAttribute('data-counter'));
  const duration = 2000; // 2 seconds
  const increment = target / (duration / 16); // 60fps
  let current = 0;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    // Форматування числа для кращого відображення
    element.textContent = Math.round(current).toLocaleString();
  }, 16);
}

// ==================== PARALLAX EFFECT ==================== //
function initializeParallax() {
  const parallaxElements = document.querySelectorAll('.parallax-bg');
  
  function updateParallax() {
    const scrollY = window.scrollY;
    
    parallaxElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const speed = element.getAttribute('data-speed') || 0.5;
      
      if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
        const yPos = -(scrollY * speed);
        element.style.transform = `translateY(${yPos}px)`;
      }
    });
  }
  
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateParallax();
        ticking = false;
      });
      ticking = true;
    }
  });
  
  updateParallax();
}

// ==================== INTERACTIVE ANIMATIONS ==================== //
class InteractiveAnimations {
  constructor() {
    this.init();
  }

  init() {
    this.initializeScrollReveal();
    this.initializeFormAnimations();
    this.initializeButtonAnimations();
    this.initializeCardAnimations();
    this.initializeTextAnimations();
  }

  // Анімації появи при скролі
  initializeScrollReveal() {
    const revealElements = document.querySelectorAll('.animate-on-scroll, .service-card, .portfolio__item, .about__content');
    
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const delay = element.getAttribute('data-delay') || 0;
          
          setTimeout(() => {
            element.classList.add('animate-fadeInUp');
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
          }, delay);
          
          revealObserver.unobserve(element);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      revealObserver.observe(element);
    });
  }

  // Анімації для форм
  initializeFormAnimations() {
    const formInputs = document.querySelectorAll('.form__input, .form__textarea');
    const formButtons = document.querySelectorAll('.btn--primary');

    formInputs.forEach(input => {
      // Анімація фокусу
      input.addEventListener('focus', (e) => {
        e.target.parentElement.classList.add('form-field-focused');
        this.animateInputLabel(e.target, 'focus');
      });

      input.addEventListener('blur', (e) => {
        if (!e.target.value) {
          e.target.parentElement.classList.remove('form-field-focused');
          this.animateInputLabel(e.target, 'blur');
        }
      });

      // Анімація введення тексту
      input.addEventListener('input', (e) => {
        this.animateInputValue(e.target);
      });
    });

    // Анімація кнопок форми
    formButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.createRippleEffect(e, button);
      });
    });
  }

  // Анімації для кнопок
  initializeButtonAnimations() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
      button.addEventListener('mouseenter', (e) => {
        this.animateButtonHover(e.target, 'enter');
      });

      button.addEventListener('mouseleave', (e) => {
        this.animateButtonHover(e.target, 'leave');
      });

      button.addEventListener('click', (e) => {
        this.createRippleEffect(e, button);
      });
    });
  }

  // Анімації для карток
  initializeCardAnimations() {
    const cards = document.querySelectorAll('.service-card, .portfolio__item');
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', (e) => {
        this.animateCardHover(e.target, 'enter');
      });

      card.addEventListener('mouseleave', (e) => {
        this.animateCardHover(e.target, 'leave');
      });
    });
  }

  // Анімації тексту
  initializeTextAnimations() {
    const textElements = document.querySelectorAll('.animate-text');
    
    const textObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateTextReveal(entry.target);
          textObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    textElements.forEach(element => {
      textObserver.observe(element);
    });
  }

  // Допоміжні методи
  animateInputLabel(input, action) {
    const label = input.parentElement.querySelector('label');
    if (label) {
      if (action === 'focus') {
        label.style.transform = 'translateY(-20px) scale(0.8)';
        label.style.color = 'var(--color-primary)';
      } else {
        label.style.transform = 'translateY(0) scale(1)';
        label.style.color = 'var(--color-text-light)';
      }
    }
  }

  animateInputValue(input) {
    input.style.transform = 'scale(1.02)';
    setTimeout(() => {
      input.style.transform = 'scale(1)';
    }, 150);
  }

  animateButtonHover(button, action) {
    if (action === 'enter') {
      button.style.transform = 'translateY(-2px) scale(1.05)';
      button.style.boxShadow = '0 8px 25px rgba(255, 111, 0, 0.3)';
    } else {
      button.style.transform = 'translateY(0) scale(1)';
      button.style.boxShadow = '';
    }
  }

  animateCardHover(card, action) {
    const icon = card.querySelector('.service-card__icon');
    if (action === 'enter' && icon) {
      icon.style.transform = 'scale(1.1) rotate(5deg)';
    } else if (icon) {
      icon.style.transform = 'scale(1) rotate(0deg)';
    }
  }

  createRippleEffect(event, element) {
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
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
      z-index: 1;
    `;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  animateTextReveal(element) {
    const text = element.textContent;
    element.textContent = '';
    
    for (let i = 0; i < text.length; i++) {
      setTimeout(() => {
        element.textContent += text[i];
      }, i * 50);
    }
  }
}

// Ініціалізація інтерактивних анімацій
let interactiveAnimations = null;

// ==================== LOADING ANIMATIONS CLASS ==================== //
class LoadingAnimations {
  constructor() {
    this.pageLoader = null;
    this.isLoading = true;
  }

  init() {
    this.createPageLoader();
    this.initPageTransitions();
    this.initSectionTransitions();
    this.initLoadingStates();
  }

  createPageLoader() {
    // Create page loader if it doesn't exist
    if (!document.querySelector('.page-loader')) {
      const loader = document.createElement('div');
      loader.className = 'page-loader';
      
      // Create logo image with fallback
      const logoImg = document.createElement('img');
      logoImg.src = 'images/logo.png';
      logoImg.alt = 'Vistav Logo';
      logoImg.style.width = '100%';
      logoImg.style.height = '100%';
      logoImg.style.objectFit = 'contain';
      logoImg.style.filter = 'brightness(0) invert(1)';
      
      // Create fallback SVG
      const fallbackSVG = `
        <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="80" height="80" fill="none" stroke="white" stroke-width="3"/>
          <rect x="20" y="20" width="60" height="60" fill="none" stroke="white" stroke-width="2"/>
          <text x="50" y="45" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">VISTAV</text>
          <text x="50" y="60" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="8">s.r.o.</text>
        </svg>
      `;
      
      const spinnerDiv = document.createElement('div');
      spinnerDiv.className = 'loader-spinner';
      
      // Handle image load error
      logoImg.onerror = function() {
        spinnerDiv.innerHTML = fallbackSVG;
      };
      
      // Handle image load success
      logoImg.onload = function() {
        spinnerDiv.appendChild(logoImg);
      };
      
      // Set initial content (will be replaced when image loads or fails)
      spinnerDiv.appendChild(logoImg);
      loader.appendChild(spinnerDiv);
      
      document.body.appendChild(loader);
      this.pageLoader = loader;
    } else {
      this.pageLoader = document.querySelector('.page-loader');
    }
  }

  hidePageLoader() {
    if (this.pageLoader) {
      this.pageLoader.classList.add('hidden');
      setTimeout(() => {
        if (this.pageLoader && this.pageLoader.parentNode) {
          this.pageLoader.parentNode.removeChild(this.pageLoader);
        }
        this.isLoading = false;
      }, 500);
    }
  }

  initPageTransitions() {
    // Add page transition class to main content
    const main = document.querySelector('main');
    if (main) {
      main.classList.add('page-transition');
      
      // Trigger transition after a short delay
      setTimeout(() => {
        main.classList.add('loaded');
      }, 100);
    }

    // Hide loader when page is fully loaded
    if (document.readyState === 'complete') {
      this.hidePageLoader();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.hidePageLoader(), 300);
      });
    }
  }

  initSectionTransitions() {
    const sections = document.querySelectorAll('.section');
    
    sections.forEach(section => {
      section.classList.add('section-enter');
    });

    // Intersection Observer for section animations
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    sections.forEach(section => {
      sectionObserver.observe(section);
    });
  }

  initLoadingStates() {
    // Loading states are now handled individually by form handlers
    // This method is kept for potential future use with other buttons
  }

  showButtonLoading(button) {
    button.classList.add('btn--loading');
    button.disabled = true;
  }

  hideButtonLoading(button) {
    button.classList.remove('btn--loading');
    button.disabled = false;
  }

  showContentLoading(element) {
    element.classList.add('content-loading');
  }

  hideContentLoading(element) {
    element.classList.remove('content-loading');
  }
}

let loadingAnimations = null;

// ==================== MOBILE OPTIMIZATION ==================== //
class MobileOptimization {
  constructor() {
    this.isMobile = window.innerWidth <= 768;
    this.isTouch = 'ontouchstart' in window;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  init() {
    this.detectDevice();
    this.optimizeAnimations();
    this.optimizeScrolling();
    this.optimizeInteractions();
    this.handleOrientationChange();
  }

  detectDevice() {
    // Update mobile detection on resize
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
      this.optimizeAnimations();
    });

    // Add device classes to body
    if (this.isMobile) {
      document.body.classList.add('mobile-device');
    }
    
    if (this.isTouch) {
      document.body.classList.add('touch-device');
    }

    if (this.prefersReducedMotion) {
      document.body.classList.add('reduced-motion');
    }
  }

  optimizeAnimations() {
    if (this.isMobile || this.prefersReducedMotion) {
      // Reduce animation delays on mobile
      const elementsWithDelay = document.querySelectorAll('[data-scroll-delay]');
      elementsWithDelay.forEach(element => {
        const currentDelay = parseInt(element.getAttribute('data-scroll-delay')) || 0;
        const optimizedDelay = Math.min(currentDelay / 2, 300); // Max 300ms delay
        element.style.animationDelay = `${optimizedDelay}ms`;
        element.style.transitionDelay = `${optimizedDelay}ms`;
      });

      // Disable complex animations on very small screens
      if (window.innerWidth <= 480) {
        const complexAnimations = document.querySelectorAll('.shimmer-effect, .content-loading');
        complexAnimations.forEach(element => {
          element.style.animation = 'none';
        });
      }
    }
  }

  optimizeScrolling() {
    if (this.isMobile) {
      // Use passive scroll listeners for better performance
      let ticking = false;
      
      const optimizedScrollHandler = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            // Throttled scroll handling
            this.handleMobileScroll();
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
    }
  }

  handleMobileScroll() {
    // Simplified scroll effects for mobile
    const scrolled = window.pageYOffset;
    const header = document.getElementById('header');
    
    if (header) {
      if (scrolled > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }

  optimizeInteractions() {
    if (this.isTouch) {
      // Add touch-specific optimizations
      const interactiveElements = document.querySelectorAll('.btn, .service-card, .portfolio__item');
      
      interactiveElements.forEach(element => {
        // Add touch feedback
        element.addEventListener('touchstart', () => {
          element.classList.add('touch-active');
        }, { passive: true });
        
        element.addEventListener('touchend', () => {
          setTimeout(() => {
            element.classList.remove('touch-active');
          }, 150);
        }, { passive: true });
      });
    }
  }

  handleOrientationChange() {
    window.addEventListener('orientationchange', () => {
      // Recalculate dimensions after orientation change
      setTimeout(() => {
        this.isMobile = window.innerWidth <= 768;
        this.optimizeAnimations();
        
        // Trigger resize event for other components
        window.dispatchEvent(new Event('resize'));
      }, 100);
    });
  }

  disableAnimationsForLowEnd() {
    // Only optimize for truly low-end devices
    const isVeryLowEnd = (navigator.hardwareConcurrency && navigator.hardwareConcurrency === 1) && 
                         (navigator.deviceMemory && navigator.deviceMemory <= 0.5) ||
                         /Android.*Chrome\/[0-3]/.test(navigator.userAgent);
    
    // Only apply optimizations for extremely limited devices
    if (isVeryLowEnd) {
      document.body.classList.add('very-low-end-device');
      
      // Only disable parallax for very low-end devices, keep normal animations
      const style = document.createElement('style');
      style.setAttribute('data-optimization', 'true');
      style.textContent = `
        .very-low-end-device .parallax-bg {
          background-attachment: scroll !important;
        }
        .very-low-end-device [data-aos] {
          animation-duration: 0.8s !important;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Add a manual override option for users who want to disable optimizations
    if (localStorage.getItem('disable-animation-optimization') === 'true') {
      document.body.classList.remove('very-low-end-device', 'low-end-device');
    }
  }
}

let mobileOptimization = null;

// Global function to disable animation optimizations
window.disableAnimationOptimization = function() {
  localStorage.setItem('disable-animation-optimization', 'true');
  document.body.classList.remove('very-low-end-device', 'low-end-device');
  // Remove any optimization styles
  const optimizationStyles = document.querySelectorAll('style[data-optimization]');
  optimizationStyles.forEach(style => style.remove());
  console.log('Animation optimizations disabled. Refresh the page to see full animations.');
};

// Global function to re-enable animation optimizations
window.enableAnimationOptimization = function() {
  localStorage.removeItem('disable-animation-optimization');
  console.log('Animation optimizations re-enabled. Refresh the page to apply optimizations.');
};

// ==================== FAQ FUNCTIONALITY ==================== //
function initializeFAQ() {
  if (!faqItems || faqItems.length === 0) return;
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq__question');
    
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all FAQ items
        faqItems.forEach(faqItem => {
          faqItem.classList.remove('active');
          
          // Додаємо плавну анімацію
          const answer = faqItem.querySelector('.faq__answer');
          if (answer) {
            answer.style.maxHeight = '0';
          }
        });
        
        // Open clicked item if it wasn't active
        if (!isActive) {
          item.classList.add('active');
          
          // Додаємо плавну анімацію
          const answer = item.querySelector('.faq__answer');
          if (answer) {
            answer.style.maxHeight = answer.scrollHeight + 'px';
          }
        }
      });
    }
  });
  
  // Відкриваємо перший елемент за замовчуванням
  if (faqItems.length > 0) {
    faqItems[0].classList.add('active');
    const firstAnswer = faqItems[0].querySelector('.faq__answer');
    if (firstAnswer) {
      firstAnswer.style.maxHeight = firstAnswer.scrollHeight + 'px';
    }
  }
}

// ==================== FORM HANDLING ==================== //
function initializeForm() {
  if (!contactForm) {
    // Form doesn't exist on this page (e.g., price page), skip initialization
    return;
  }
  
  contactForm.addEventListener('submit', handleFormSubmit);
  
  // Add click listener to submit button for debugging
  const submitButton = contactForm.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.addEventListener('click', function(e) {
      // Button click handler
    });
  } else {
    console.error('❌ ERROR: Submit button not found!');
  }
  
  // Form validation
  const requiredFields = contactForm.querySelectorAll('[required]');
  requiredFields.forEach(field => {
    field.addEventListener('blur', validateField);
    field.addEventListener('input', clearFieldError);
  });
  
  // Handle client type change to show/hide company field
  const clientTypeSelect = document.getElementById('client_type');
  const companyField = document.getElementById('company')?.parentNode;
  
  if (clientTypeSelect && companyField) {
    // Initially hide company field if individual is selected by default
    if (clientTypeSelect.value === 'individual') {
      companyField.style.display = 'none';
    }
    
    // Add event listener for client type change
    clientTypeSelect.addEventListener('change', function() {
      if (this.value === 'company') {
        companyField.style.display = 'block';
      } else {
        companyField.style.display = 'none';
        document.getElementById('company').value = '';
      }
    });
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Validate form
  if (!validateForm()) {
    const errorMessages = {
      cs: 'Prosím, opravte chyby ve formuláři.',
      uk: 'Будь ласка, виправте помилки у формі.',
      en: 'Please fix the errors in the form.'
    };
    showError(errorMessages[currentLanguage] || errorMessages.cs);
    return;
  }
  
  // Ensure CSRF token is present; fetch only if missing
  const csrfTokenField = document.getElementById('csrf_token');
  if (!csrfTokenField || !csrfTokenField.value) {
    await setCSRFToken();
  }
  
  // Abort if token still missing
  if (!csrfTokenField || !csrfTokenField.value) {
    const errorMessages = {
      cs: 'Bezpečnostní token chybí. Obnovte stránku a zkuste to znovu.',
      uk: 'Відсутній токен безпеки. Оновіть сторінку і спробуйте знову.',
      en: 'Security token missing. Refresh the page and try again.'
    };
    showError(errorMessages[currentLanguage] || errorMessages.cs);
    return;
  }
  
  // Build form data after token is set in the hidden field
  const formData = new FormData(contactForm);
  

  
  // Disable submit button
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const originalText = submitButton.innerHTML;
  

  
  const loadingMessages = {
    cs: '<i class="fas fa-spinner fa-spin"></i> Odesílání...',
    uk: '<i class="fas fa-spinner fa-spin"></i> Відправлення...',
    en: '<i class="fas fa-spinner fa-spin"></i> Sending...'
  };
  
  submitButton.disabled = true;
  submitButton.innerHTML = loadingMessages[currentLanguage] || loadingMessages.cs;
  
  // Send form data
  fetch('php/handler.php', {
    method: 'POST',
    body: formData,
    credentials: 'same-origin'
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showSuccessModal();
      contactForm.reset();
      
      // Clear any validation classes
      contactForm.querySelectorAll('.form__input').forEach(input => {
        input.classList.remove('form__input--valid', 'form__input--invalid');
      });
      contactForm.querySelectorAll('.form__error').forEach(error => error.remove());
    } else {
      const defaultErrorMessages = {
        cs: 'Došlo k chybě při odesílání formuláře.',
        uk: 'Сталася помилка при відправці форми.',
        en: 'An error occurred while sending the form.'
      };
      showError(data.message || defaultErrorMessages[currentLanguage] || defaultErrorMessages.cs);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    const networkErrorMessages = {
      cs: 'Chyba připojení. Zkuste to prosím znovu.',
      uk: 'Помилка з\'єднання. Спробуйте ще раз.',
      en: 'Connection error. Please try again.'
    };
    showError(networkErrorMessages[currentLanguage] || networkErrorMessages.cs);
  })
  .finally(() => {
    // Re-enable submit button and restore original text
    submitButton.disabled = false;
    submitButton.innerHTML = translations[currentLanguage].form_submit;
  });
}

function validateForm() {
  const requiredFields = contactForm.querySelectorAll('[required]');
  let isValid = true;
  
  // Clear all previous errors
  contactForm.querySelectorAll('.form__error').forEach(error => error.remove());
  contactForm.querySelectorAll('.form__input').forEach(input => {
    input.classList.remove('form__input--invalid', 'form__input--valid');
  });
  
  requiredFields.forEach(field => {
    const fieldValid = validateField({ target: field });
    if (!fieldValid) {
      isValid = false;
      field.classList.add('form__input--invalid');
    } else {
      field.classList.add('form__input--valid');
    }
  });
  
  return isValid;
}

function validateField(e) {
  const field = e.target;
  const value = field.value.trim();
  let isValid = true;
  let errorMessage = '';
  
  // Remove existing error
  clearFieldError({ target: field });
  
  // Get error messages for current language
  const errorMessages = {
    cs: {
      required: 'Toto pole je povinné.',
      email: 'Zadejte platnou emailovou adresu.',
      phone: 'Zadejte platné telefonní číslo.',
      minLength: 'Příliš krátký text.',
      maxLength: 'Příliš dlouhý text.'
    },
    uk: {
      required: "Це поле є обов'язковим.",
      email: 'Введіть дійсну електронну адресу.',
      phone: 'Введіть дійсний номер телефону.',
      minLength: 'Занадто короткий текст.',
      maxLength: 'Занадто довгий текст.'
    },
    en: {
      required: 'This field is required.',
      email: 'Please enter a valid email address.',
      phone: 'Please enter a valid phone number.',
      minLength: 'Text is too short.',
      maxLength: 'Text is too long.'
    }
  };
  
  const messages = errorMessages[currentLanguage] || errorMessages.cs;
  
  // Check if required field is empty
  if (field.hasAttribute('required') && !value) {
    errorMessage = messages.required;
    isValid = false;
  }
  
  // Email validation
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      errorMessage = messages.email;
      isValid = false;
    }
  }
  
  // Phone validation
  if (field.type === 'tel' && value) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{9,}$/;
    if (!phoneRegex.test(value)) {
      errorMessage = messages.phone;
      isValid = false;
    }
  }
  
  // Name validation (minimum length)
  if (field.name === 'name' && value && value.length < 2) {
    errorMessage = messages.minLength;
    isValid = false;
  }
  
  // Message validation (maximum length)
  if (field.name === 'message' && value && value.length > 1000) {
    errorMessage = messages.maxLength;
    isValid = false;
  }
  
  // Show error if invalid
  if (!isValid) {
    showFieldError(field, errorMessage);
  }
  
  return isValid;
}

function showFieldError(field, message) {
  field.classList.add('error');
  
  // Remove existing error message
  const existingError = field.parentNode.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }
  
  // Add error message
  const errorElement = document.createElement('div');
  errorElement.className = 'field-error';
  errorElement.textContent = message;
  errorElement.style.color = '#FF6F00';
  errorElement.style.fontSize = '0.875rem';
  errorElement.style.marginTop = '0.25rem';
  
  field.parentNode.appendChild(errorElement);
}

function clearFieldError(e) {
  const field = e.target;
  field.classList.remove('error');
  
  const errorElement = field.parentNode.querySelector('.field-error');
  if (errorElement) {
    errorElement.remove();
  }
}

function showError(message) {
  // Simple error notification
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-notification';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #f44336;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

function showSuccessModal() {
  if (successModal) {
    successModal.classList.add('active');
  }
}

// ==================== MODAL FUNCTIONALITY ==================== //
if (closeModal && successModal) {
  closeModal.addEventListener('click', () => {
    successModal.classList.remove('active');
  });
}

if (successModal) {
  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
      successModal.classList.remove('active');
    }
  });
}

// ==================== LANGUAGE SWITCHER ==================== //
function initializeLanguageSwitcher() {
  languageButtons.forEach(button => {
    button.addEventListener('click', () => {
      const lang = button.getAttribute('data-lang');
      setLanguage(lang);
    });
  });
}

function setLanguage(lang) {
  console.log('🌐 setLanguage called with lang:', lang);
  currentLanguage = lang;
  
  // Update active language button
  languageButtons.forEach(button => {
    button.classList.remove('active');
    if (button.getAttribute('data-lang') === lang) {
      button.classList.add('active');
    }
  });
  
  // Update all translatable elements
  const translatableElements = document.querySelectorAll('[data-translate]');
  translatableElements.forEach(element => {
    const key = element.getAttribute('data-translate');
    if (translations[lang] && translations[lang][key]) {
      if (element.tagName === 'INPUT' && element.type === 'submit') {
        element.value = translations[lang][key];
      } else if ((element.tagName === 'BUTTON' && element.type === 'submit') || element.getAttribute('data-translate') === 'form_submit') {
        element.innerHTML = translations[lang][key];
      } else if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
        element.placeholder = translations[lang][key];
      } else if (element.tagName === 'OPTION') {
        element.textContent = translations[lang][key];
      } else {
        element.innerHTML = translations[lang][key];
      }
    }
  });
  
  // Update HTML lang attribute
  document.documentElement.lang = lang;
  
  // Update meta tags and title
  updateMetaTags(lang);
  
  // Update links to price_dynamic.php with language parameter
  updatePriceLinks(lang);
  
  // Update gallery button text if gallery is initialized
  if (galleryInstance && galleryInstance.updateButtonText) {
    galleryInstance.updateButtonText();
  }
  
  // Save language preference
  localStorage.setItem('vistav_language', lang);
  
  // Dispatch language change event for other pages
  window.dispatchEvent(new Event('languageChanged'));
}

function updateMetaTags(lang) {
  const t = translations[lang];
  if (!t) return;
  
  // Determine current page
  const currentPage = getCurrentPage();
  
  // Update title
  const titleKey = `page_title_${currentPage}`;
  if (t[titleKey]) {
    document.title = t[titleKey];
  }
  
  // Update meta description
  if (t.meta_description) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t.meta_description);
  }
  
  // Update meta keywords
  if (t.meta_keywords) {
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) metaKeywords.setAttribute('content', t.meta_keywords);
  }
  
  // Update Open Graph tags
  if (t.meta_og_title) {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', t.meta_og_title);
  }
  
  if (t.meta_og_description) {
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', t.meta_og_description);
  }
  
  // Update Twitter tags
  if (t.meta_twitter_title) {
    const twitterTitle = document.querySelector('meta[name="twitter:title"], meta[property="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', t.meta_twitter_title);
  }
  
  if (t.meta_twitter_description) {
    const twitterDesc = document.querySelector('meta[name="twitter:description"], meta[property="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute('content', t.meta_twitter_description);
  }
  
  // Update geo placename
  if (t.meta_geo_placename) {
    const geoPlace = document.querySelector('meta[name="geo.placename"]');
    if (geoPlace) geoPlace.setAttribute('content', t.meta_geo_placename);
  }
}

function updatePriceLinks(lang) {
  // Update all links to price_dynamic.php with language parameter
  console.log('🔗 updatePriceLinks called with lang:', lang);
  const priceLinks = document.querySelectorAll('a[href="price_dynamic.php"], a[href*="price_dynamic.php"]');
  console.log('🔍 Found price links:', priceLinks.length);
  
  if (priceLinks.length === 0) {
    console.log('⚠️ No price links found!');
    return;
  }
  
  priceLinks.forEach((link, index) => {
    const href = link.getAttribute('href');
    console.log(`📝 Processing link ${index + 1}:`, href);
    if (href === 'price_dynamic.php') {
      link.setAttribute('href', `price_dynamic.php?lang=${lang}`);
      console.log('✅ Updated simple link to:', link.getAttribute('href'));
    } else if (href.includes('price_dynamic.php') && !href.includes('lang=')) {
      const separator = href.includes('?') ? '&' : '?';
      link.setAttribute('href', `${href}${separator}lang=${lang}`);
      console.log('✅ Added lang parameter to:', link.getAttribute('href'));
    } else if (href.includes('price_dynamic.php') && href.includes('lang=')) {
      // Replace existing lang parameter
      link.setAttribute('href', href.replace(/lang=[a-z]{2}/, `lang=${lang}`));
      console.log('✅ Replaced lang parameter to:', link.getAttribute('href'));
    }
  });
  console.log('🎉 updatePriceLinks completed successfully');
}

// Test function to check current price links
window.testPriceLinks = function() {
  console.log('🧪 Testing current price links:');
  const priceLinks = document.querySelectorAll('a[href*="price_dynamic.php"]');
  console.log('Found links:', priceLinks.length);
  priceLinks.forEach((link, index) => {
    console.log(`Link ${index + 1}:`, link.getAttribute('href'));
  });
};

// Add click handler to price links for debugging
function addPriceLinkDebugger() {
  const priceLinks = document.querySelectorAll('a[href*="price_dynamic.php"]');
  priceLinks.forEach((link, index) => {
    link.addEventListener('click', function(e) {
      console.log(`🖱️ Price link ${index + 1} clicked! Current href:`, this.getAttribute('href'));
      console.log('Current language:', currentLanguage);
    });
  });
}

function getCurrentPage() {
  const path = window.location.pathname;
  if (path.includes('price_dynamic.php') || path.includes('price.html')) return 'price';
  if (path.includes('admin.html')) return 'admin';
  if (path.includes('login.html')) return 'login';
  return 'index';
}

// Load saved language preference
function loadLanguagePreference() {
  const savedLang = localStorage.getItem('vistav_language');
  if (savedLang && translations[savedLang]) {
    currentLanguage = savedLang;
  }
}

// ==================== PHONE MASK ==================== //
function initializePhoneMask() {
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  
  phoneInputs.forEach(input => {
    input.addEventListener('input', formatPhoneNumber);
    input.addEventListener('keydown', handlePhoneKeydown);
  });
}


function formatPhoneNumber(e) {
  let value = e.target.value.replace(/\D/g, '');
  
  // Czech phone number format: +420 123 456 789
  if (value.startsWith('420')) {
    value = value.substring(3);
  }
  
  if (value.length > 0) {
    if (value.length <= 3) {
      value = value;
    } else if (value.length <= 6) {
      value = value.substring(0, 3) + ' ' + value.substring(3);
    } else {
      value = value.substring(0, 3) + ' ' + value.substring(3, 6) + ' ' + value.substring(6, 9);
    }
    
    value = '+420 ' + value;
  }
  
  e.target.value = value;
}

function handlePhoneKeydown(e) {
  // Allow: backspace, delete, tab, escape, enter
  if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    (e.keyCode === 65 && e.ctrlKey === true) ||
    (e.keyCode === 67 && e.ctrlKey === true) ||
    (e.keyCode === 86 && e.ctrlKey === true) ||
    (e.keyCode === 88 && e.ctrlKey === true) ||
    // Allow: home, end, left, right
    (e.keyCode >= 35 && e.keyCode <= 39)) {
    return;
  }
  
  // Ensure that it is a number and stop the keypress
  if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
    e.preventDefault();
  }
}

// ==================== SMOOTH SCROLLING FOR ALL ANCHOR LINKS ==================== //
document.addEventListener('DOMContentLoaded', function() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        // Check if gallery is active and we're navigating to portfolio
        const gallerySection = document.getElementById('gallery');
        if (targetId === '#portfolio' && gallerySection && !gallerySection.classList.contains('section--hidden')) {
          // Gallery is active, close it first then navigate
          if (galleryInstance) {
            galleryInstance.hideGallery();
            // Wait for gallery to close before scrolling
            setTimeout(() => {
              const headerHeight = header ? header.offsetHeight : 0;
              const targetPosition = targetSection.offsetTop - headerHeight;
              
              window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
              });
            }, 300); // Wait for gallery close animation
          }
        } else {
          // Normal navigation
          const headerHeight = header ? header.offsetHeight : 0;
          const targetPosition = targetSection.offsetTop - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
        
        // Close mobile menu if open
        if (navMenu && navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
        }
      }
    });
  });
});

// ==================== ERROR HANDLING ==================== //
window.addEventListener('error', function(e) {
  console.error('JavaScript error:', e.error);
});



// ==================== SIMPLE GALLERY MODAL ==================== //
class SimpleGallery {
  constructor() {
    console.log('SimpleGallery: Конструктор викликано');
    this.currentFilter = 'all';
    this.images = [];
    this.currentImageIndex = 0;
    this.modal = null;
    this.itemsPerPage = 6;
    this.currentPage = 1;
    this.showMoreButton = null;
    this.init();
  }

  init() {
    console.log('SimpleGallery init started');
    
    // Check if gallery__show-more-container exists
    const showMoreContainer = document.querySelector('.gallery__show-more-container');
    console.log('Gallery show-more container found:', showMoreContainer);
    console.log('Container HTML:', showMoreContainer ? showMoreContainer.outerHTML : 'null');
    
    // Find gallery grid
    this.galleryGrid = document.querySelector('.gallery__grid');
    console.log('Gallery grid found:', this.galleryGrid);
    
    if (!this.galleryGrid) {
      console.error('Gallery grid not found! Cannot initialize pagination.');
      return;
    }
    
    this.modal = document.getElementById('galleryModal');
    console.log('Modal element found:', this.modal);
    
    console.log('About to load images...');
    this.loadImages();
    console.log('Images loaded, total:', this.images.length);
    
    console.log('About to bind events...');
    this.bindEvents();
    
    console.log('About to reinitialize portfolio button...');
    this.reinitializePortfolioButton();
    
    console.log('About to create show more button...');
    this.createShowMoreButton();
    
    console.log('About to update gallery display...');
    this.updateGalleryDisplay(); // Initialize pagination display
    console.log('SimpleGallery init completed');
  }

  bindEvents() {
    // Gallery back button
    const backBtn = document.getElementById('gallery-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.hideGallery();
      });
    }

    // Filter buttons
    const filterBtns = document.querySelectorAll('.gallery__filter');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const filter = btn.dataset.filter;
        this.filterImages(filter);
        this.updateActiveFilter(btn);
      });
    });

    // Gallery item clicks to open modal
    const galleryItems = document.querySelectorAll('.gallery__item');
    console.log('Found gallery items:', galleryItems.length);
    galleryItems.forEach((item, domIndex) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        // Обчислюємо індекс елемента відносно поточного відфільтрованого списку,
        // щоб модалка відкривала саме те фото, на яке натиснули.
        const filteredIndex = this.filteredImages.findIndex(img => img.element === item);
        const fallbackIndex = this.images.findIndex(img => img.element === item);
        const imageIndex = filteredIndex !== -1 ? filteredIndex : (fallbackIndex !== -1 ? fallbackIndex : domIndex);
        console.log('Gallery item clicked. domIndex:', domIndex, 'filteredIndex:', filteredIndex, 'fallbackIndex:', fallbackIndex, 'usedIndex:', imageIndex);
        this.openModal(imageIndex);
      });
    });

    // Modal close button
    const closeBtn = document.querySelector('.gallery-modal__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }

    // Modal overlay click to close
    const overlay = document.querySelector('.gallery-modal__overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeModal();
        }
      });
    }

    // Navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.previousImage();
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.nextImage();
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (this.modal && this.modal.classList.contains('active')) {
        if (e.key === 'Escape') {
          this.closeModal();
        } else if (e.key === 'ArrowLeft') {
          this.previousImage();
        } else if (e.key === 'ArrowRight') {
          this.nextImage();
        }
      }
    });
  }

  loadImages() {
    // Get all gallery items from DOM
    const galleryItems = document.querySelectorAll('.gallery__item');
    this.images = Array.from(galleryItems).map((item, index) => {
      const overlay = item.querySelector('.gallery__overlay');
      const meta = overlay?.querySelector('.gallery__meta');
      return {
        id: item.dataset.project || index.toString(),
        category: item.dataset.category || 'all',
        title: overlay?.querySelector('h4')?.textContent || '',
        description: overlay?.querySelector('p')?.textContent || '',
        year: meta?.querySelector('.gallery__year')?.textContent || '',
        location: meta?.querySelector('.gallery__location')?.textContent || '',
        image: item.querySelector('img')?.src || '',
        element: item,
        index: index
      };
    });
    this.filteredImages = [...this.images];
  }

  openModal(imageIndex) {
    console.log('Opening modal with image index:', imageIndex);
    console.log('Total filtered images:', this.filteredImages.length);
    console.log('Modal element:', this.modal);
    console.log('Modal element found:', !!this.modal);
    this.currentImageIndex = imageIndex;
    this.showImage();
    if (this.modal) {
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      document.body.classList.add('modal-open'); // Disable hover effects
    } else {
      console.error('Modal element not found!');
    }
  }

  closeModal() {
    this.modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
    document.body.classList.remove('modal-open'); // Re-enable hover effects
  }

  showImage() {
    console.log('showImage called, currentImageIndex:', this.currentImageIndex);
    const currentImage = this.filteredImages[this.currentImageIndex];
    if (!currentImage) {
      console.log('No current image found');
      return;
    }
    console.log('Current image:', currentImage);

    // Update modal image
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const currentImageNumber = document.getElementById('currentImageNumber');
    const totalImages = document.getElementById('totalImages');

    console.log('Modal elements found:', {
      modalImage: !!modalImage,
      modalTitle: !!modalTitle,
      modalDescription: !!modalDescription,
      currentImageNumber: !!currentImageNumber,
      totalImages: !!totalImages
    });

    // Prefer the current DOM <img> src (thumbnail) which may already have HEIC→JPG fallback applied
    const itemImg = currentImage.element ? currentImage.element.querySelector('img') : null;
    let src = itemImg?.src || currentImage.image;

    if (modalImage) {
      // If still HEIC, try a JPG fallback for modal as well
      if (/\.heic$/i.test(src)) {
        const jpgSrc = src.replace(/\.heic$/i, '.JPG');
        const testImg = new Image();
        testImg.onload = () => { modalImage.src = jpgSrc; };
        testImg.onerror = () => { modalImage.src = src; };
        testImg.src = jpgSrc;
      } else {
        modalImage.src = src;
      }
    }
    if (modalTitle) modalTitle.textContent = currentImage.title;
    if (modalDescription) modalDescription.textContent = currentImage.description;
    if (currentImageNumber) currentImageNumber.textContent = this.currentImageIndex + 1;
    if (totalImages) totalImages.textContent = this.filteredImages.length;

    // Update navigation buttons
    this.updateNavigationButtons();
  }

  previousImage() {
    if (this.filteredImages.length <= 1) return;
    this.currentImageIndex = this.currentImageIndex > 0 
      ? this.currentImageIndex - 1 
      : this.filteredImages.length - 1;
    this.showImage();
  }

  nextImage() {
    if (this.filteredImages.length <= 1) return;
    this.currentImageIndex = this.currentImageIndex < this.filteredImages.length - 1 
      ? this.currentImageIndex + 1 
      : 0;
    this.showImage();
  }

  updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn && nextBtn) {
      const hasMultipleImages = this.filteredImages.length > 1;
      prevBtn.style.display = hasMultipleImages ? 'flex' : 'none';
      nextBtn.style.display = hasMultipleImages ? 'flex' : 'none';
    }
  }

  filterImages(filter) {
    this.currentFilter = filter;
    this.currentPage = 1; // Reset to first page when filtering
    
    // Filter images array
    this.filteredImages = this.images.filter(image => 
      filter === 'all' || image.category === filter
    );

    // Update DOM visibility with pagination
    this.updateGalleryDisplay();

    // Reset current image index
    this.currentImageIndex = 0;
  }

  updateGalleryDisplay() {
    console.log('updateGalleryDisplay called - currentPage:', this.currentPage, 'itemsPerPage:', this.itemsPerPage, 'currentFilter:', this.currentFilter);
    
    const items = document.querySelectorAll('.gallery__item');
    let filteredCount = 0;
    let visibleCount = 0;
    const maxVisible = this.currentPage * this.itemsPerPage;

    console.log('Total items found:', items.length, 'maxVisible:', maxVisible);

    items.forEach((item, index) => {
      const category = item.dataset.category;
      const shouldShowByFilter = this.currentFilter === 'all' || category === this.currentFilter;
      
      if (shouldShowByFilter) {
        filteredCount++;
        const shouldShowByPagination = filteredCount <= maxVisible;
        
        console.log(`Item ${index}: category=${category}, filteredCount=${filteredCount}, shouldShowByPagination=${shouldShowByPagination}`);
        
        if (shouldShowByPagination) {
          visibleCount++;
          item.classList.remove('hidden', 'fade-out');
          item.classList.add('fade-in');
        } else {
          item.classList.remove('fade-in');
          item.classList.add('fade-out');
          setTimeout(() => {
            item.classList.add('hidden');
            item.classList.remove('fade-out');
          }, 300);
        }
      } else {
        item.classList.remove('fade-in');
        item.classList.add('fade-out');
        setTimeout(() => {
          item.classList.add('hidden');
          item.classList.remove('fade-out');
        }, 300);
      }
    });

    console.log('Final counts - filteredCount:', filteredCount, 'visibleCount:', visibleCount);
    
    // Update show more button
    this.updateShowMoreButton(filteredCount, visibleCount);

    // Update collapse button
    this.updateCollapseButton(filteredCount, visibleCount);
  }

  updateShowMoreButton(totalFilteredItems, currentlyVisible) {
    console.log('updateShowMoreButton called with:', { totalFilteredItems, currentlyVisible });
    console.log('showMoreButton exists:', !!this.showMoreButton);
    
    if (!this.showMoreButton) {
      console.log('Creating show more button...');
      this.createShowMoreButton();
      console.log('After creation, showMoreButton exists:', !!this.showMoreButton);
    }

    // Показуємо кнопку лише якщо є що показати
    const hasMoreToShow = totalFilteredItems > currentlyVisible;
    const shouldShow = hasMoreToShow;
    
    console.log('Should show button:', shouldShow, 'hasMoreToShow:', hasMoreToShow);
    console.log('totalFilteredItems:', totalFilteredItems, 'currentlyVisible:', currentlyVisible, 'currentPage:', this.currentPage);

    if (shouldShow) {
      if (this.showMoreButton) {
        this.showMoreButton.style.display = 'inline-flex';
        
        // Залишаємо первинний стиль для показу більше
        this.showMoreButton.classList.remove('btn--secondary');
        this.showMoreButton.classList.add('btn--primary');
        
        // Оновлюємо текст кнопки через метод updateButtonText
        this.updateButtonText();
        
        console.log('Button shown with text:', this.showMoreButton.textContent);
      } else {
        console.error('showMoreButton is null after creation!');
      }
    } else {
      if (this.showMoreButton) {
        this.showMoreButton.style.display = 'none';
        console.log('Button hidden');
      }
    }
  }

  createShowMoreButton() {
    console.log('createShowMoreButton: Метод викликано');
    
    // Check if button already exists
    this.showMoreButton = document.getElementById('gallery-show-more');
    console.log('createShowMoreButton: Існуюча кнопка знайдена:', this.showMoreButton);
    
    if (!this.showMoreButton) {
      console.log('createShowMoreButton: Створюємо нову кнопку');
      this.showMoreButton = document.createElement('button');
      this.showMoreButton.id = 'gallery-show-more';
      this.showMoreButton.className = 'gallery__show-more btn btn--primary';
      this.showMoreButton.setAttribute('data-translate', 'gallery_show_more');
      const showMoreText = translations[currentLanguage]?.gallery_show_more || 'Show more';
      this.showMoreButton.innerHTML = `<i class="fas fa-chevron-down" aria-hidden="true"></i> ${showMoreText}`;
      console.log('createShowMoreButton: Кнопка створена:', this.showMoreButton);
      
      // Find gallery show more container and add button to it
      const showMoreContainer = document.querySelector('.gallery__show-more-container');
      console.log('createShowMoreButton: Show more container знайдено:', showMoreContainer);
      
      if (showMoreContainer) {
        showMoreContainer.appendChild(this.showMoreButton);
        console.log('createShowMoreButton: Кнопка додана до контейнера');
    } else {
      console.error('createShowMoreButton: Не вдалося знайти gallery__show-more-container');
    }
  }

    // Add click event listener
    if (this.showMoreButton) {
      this.showMoreButton.addEventListener('click', () => {
        console.log('Show more button clicked');
        
        // Перевіряємо чи це кнопка згортання
        const collapseText = translations[currentLanguage]?.gallery_collapse || 'Collapse gallery';
        if (this.showMoreButton.textContent === collapseText) {
          console.log('Collapsing gallery...');
          this.collapseGallery();
        } else {
          console.log('Showing more images...');
          this.currentPage++;
          this.updateGalleryDisplay();
        }
      });
      console.log('createShowMoreButton: Event listener додано');
    } else {
      console.error('createShowMoreButton: Кнопка не існує для додавання event listener');
    }
  }

  // Кнопка "Згорнути" — створення
  createCollapseButton() {
    // Check if button already exists
    this.collapseButton = document.getElementById('gallery-collapse');
    
    if (!this.collapseButton) {
      this.collapseButton = document.createElement('button');
      this.collapseButton.id = 'gallery-collapse';
      this.collapseButton.className = 'gallery__collapse btn btn--primary';
      this.collapseButton.setAttribute('data-translate', 'gallery_collapse');
      const collapseText = translations[currentLanguage]?.gallery_collapse || 'Collapse gallery';
      this.collapseButton.innerHTML = `<i class="fas fa-chevron-up" aria-hidden="true"></i> ${collapseText}`;

      // Стилі винесено у css/style.css для .gallery__collapse

      // Append to the same container as show more
      const showMoreContainer = document.querySelector('.gallery__show-more-container');
      if (showMoreContainer) {
        showMoreContainer.appendChild(this.collapseButton);
      }

      // Bind click
      this.collapseButton.addEventListener('click', () => {
        this.collapseGallery();
      });
    }
  }

  // Оновлення видимості кнопки "Згорнути"
  updateCollapseButton(totalFilteredItems, currentlyVisible) {
    if (!this.collapseButton) {
      this.createCollapseButton();
    }

    const allShown = totalFilteredItems > 0 && currentlyVisible >= totalFilteredItems && this.currentPage > 1;
    if (this.collapseButton) {
      this.collapseButton.style.display = allShown ? 'inline-flex' : 'none';
    }
  }

  updateActiveFilter(activeBtn) {
    // Remove active class from all filter buttons
    const filterBtns = document.querySelectorAll('.gallery__filter');
    filterBtns.forEach(btn => {
      btn.classList.remove('active');
    });

    // Add active class to clicked button
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
  }

  updateButtonText() {
    // Update gallery button text when language changes
    if (this.showMoreButton) {
      const showMoreText = translations[currentLanguage]?.gallery_show_more || 'Show more';
      
      // Обчислюємо поточний стан через відфільтрований список
      const totalFilteredItems = this.filteredImages.length;
      const currentlyVisible = Math.min(this.currentPage * this.itemsPerPage, totalFilteredItems);
      const hasMoreToShow = totalFilteredItems > currentlyVisible;

      // Текст завжди “показати більше”, додаємо іконку вниз
      this.showMoreButton.innerHTML = `<i class="fas fa-chevron-down" aria-hidden="true"></i> ${showMoreText}`;

      // Додатково ховаємо кнопку якщо немає що показувати (підстраховка)
      this.showMoreButton.style.display = hasMoreToShow ? 'inline-flex' : 'none';
    }

    // Оновлюємо текст кнопки "Згорнути" з іконкою, якщо вона існує
    if (this.collapseButton) {
      const collapseText = translations[currentLanguage]?.gallery_collapse || 'Collapse gallery';
      this.collapseButton.innerHTML = `<i class="fas fa-chevron-up" aria-hidden="true"></i> ${collapseText}`;
    }
  }

  collapseGallery() {
    console.log('collapseGallery: Згортання галереї до початкового стану');
    
    // Скидаємо до першої сторінки
    this.currentPage = 1;
    console.log('collapseGallery: currentPage скинуто до 1');
    
    // Оновлюємо відображення галереї
    this.updateGalleryDisplay();
    console.log('collapseGallery: Галерея оновлена');
    
    // Прокручуємо до початку галереї
    const gallerySection = document.getElementById('gallery');
    if (gallerySection) {
      gallerySection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      console.log('collapseGallery: Прокрутка до початку галереї');
    }
  }

  showGallery() {
    console.log('showGallery called');
    const portfolioSection = document.getElementById('portfolio');
    const gallerySection = document.getElementById('gallery');
    
    console.log('Portfolio section:', portfolioSection);
    console.log('Gallery section:', gallerySection);
    
    if (portfolioSection && gallerySection) {
      portfolioSection.classList.add('section--hidden');
      gallerySection.classList.remove('section--hidden');
      
      console.log('Gallery shown, portfolio hidden');
      
      // Scroll to gallery
      gallerySection.scrollIntoView({ behavior: 'smooth' });
      
      // Reinitialize AOS for gallery items
      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.refresh();
        }
      }, 300);
    } else {
      console.log('Missing sections - portfolio:', !!portfolioSection, 'gallery:', !!gallerySection);
    }
  }

  hideGallery() {
    const portfolioSection = document.getElementById('portfolio');
    const gallerySection = document.getElementById('gallery');
    
    if (portfolioSection && gallerySection) {
      gallerySection.classList.add('section--hidden');
      portfolioSection.classList.remove('section--hidden');
      
      // Scroll to portfolio with proper header offset
      const headerHeight = header ? header.offsetHeight : 0;
      const targetPosition = portfolioSection.offsetTop - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // Re-initialize portfolio button event listener
      this.reinitializePortfolioButton();
    }
  }

  reinitializePortfolioButton() {
    console.log('Reinitializing portfolio button...');
    const portfolioBtn = document.getElementById('view-gallery-btn');
    console.log('Portfolio button found:', portfolioBtn);
    if (portfolioBtn) {
      // Remove existing event listeners by cloning the element
      const newPortfolioBtn = portfolioBtn.cloneNode(true);
      portfolioBtn.parentNode.replaceChild(newPortfolioBtn, portfolioBtn);
      
      // Add fresh event listener
      newPortfolioBtn.addEventListener('click', (e) => {
        console.log('Portfolio button clicked!');
        e.preventDefault();
        this.showGallery();
      });
      console.log('Portfolio button event listener added');
    } else {
      console.log('Portfolio button not found!');
    }
  }

  zoomImage(img) {
    // Check if overlay already exists to prevent multiple instances
    if (document.querySelector('.image-zoom-overlay')) {
      return;
    }

    // Create zoom overlay
    const overlay = document.createElement('div');
    overlay.className = 'image-zoom-overlay';
    
    // Create zoomed image
    const zoomedImg = document.createElement('img');
    zoomedImg.src = img.src;
    zoomedImg.alt = img.alt;
    zoomedImg.className = 'image-zoom-img';
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'image-zoom-close';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    
    // Add elements to overlay
    overlay.appendChild(zoomedImg);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
    
    // Single unified close function
    const closeZoom = () => {
      const existingOverlay = document.querySelector('.image-zoom-overlay');
      if (!existingOverlay) return;
      
      existingOverlay.remove();
      document.body.style.overflow = '';
    };
    
    // Safari mobile requires both click and touchend events
    const handleClose = (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeZoom();
    };
    
    closeBtn.addEventListener('click', handleClose, { once: true });
    closeBtn.addEventListener('touchend', handleClose, { once: true, passive: false });
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeZoom();
    });
    
    // Keyboard support
    const handleKeydown = (e) => {
      console.log('Keyboard event in zoom:', e.key);
      switch(e.key) {
        case 'Escape':
        case 'q':
        case 'Q':
          e.preventDefault();
          closeZoom();
          document.removeEventListener('keydown', handleKeydown);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          closeZoom();
          document.removeEventListener('keydown', handleKeydown);
          break;
      }
    };
    document.addEventListener('keydown', handleKeydown);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Animate in
    setTimeout(() => {
      overlay.classList.add('active');
    }, 10);
  }

  filterProjects(filter) {
    this.currentFilter = filter;
    const items = document.querySelectorAll('.gallery__item');
    
    items.forEach(item => {
      const category = item.dataset.category;
      const shouldShow = filter === 'all' || category === filter;
      
      if (shouldShow) {
        item.classList.remove('hidden', 'fade-out');
        item.classList.add('fade-in');
      } else {
        item.classList.add('fade-out');
        setTimeout(() => {
          item.classList.add('hidden');
          item.classList.remove('fade-out');
        }, 300);
      }
    });
    
    // Update filtered projects array
    this.filteredProjects = this.projects.filter(project => 
      filter === 'all' || project.category === filter
    );
  }

  updateActiveFilter(activeBtn) {
    const filterBtns = document.querySelectorAll('.gallery__filter');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
  }






}

// Global gallery instance
let galleryInstance = null;

// Initialize Gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  galleryInstance = new SimpleGallery();
  window.gallery = galleryInstance; // Make gallery accessible globally for debugging
});

// ==================== PRICE FILTERING ==================== //
class PriceFilter {
  constructor() {
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.priceCategories = document.querySelectorAll('.price-category');
    this.activeFilter = 'all';
    this.init();
  }

  init() {
    if (this.filterButtons.length === 0 || this.priceCategories.length === 0) {
      return;
    }
    
    this.bindEvents();
    this.setupInitialState();
  }

  bindEvents() {
    this.filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const filter = button.getAttribute('data-filter');
        this.filterCategories(filter);
        this.updateActiveButton(button);
      });
    });
  }

  setupInitialState() {
    // Show all categories initially
    this.priceCategories.forEach(category => {
      category.style.display = 'block';
      category.style.opacity = '1';
      category.style.transform = 'translateY(0)';
    });
  }

  filterCategories(filter) {
    this.activeFilter = filter;
    
    this.priceCategories.forEach((category, index) => {
      const categoryType = category.getAttribute('data-category');
      const shouldShow = filter === 'all' || categoryType === filter;
      
      if (shouldShow) {
        this.showCategory(category, index);
      } else {
        this.hideCategory(category);
      }
    });
  }

  showCategory(category, index) {
    // Add a small delay for staggered animation
    setTimeout(() => {
      category.style.display = 'block';
      category.style.opacity = '0';
      category.style.transform = 'translateY(20px)';
      
      // Trigger reflow
      category.offsetHeight;
      
      // Animate in
      category.style.transition = 'all 0.4s ease';
      category.style.opacity = '1';
      category.style.transform = 'translateY(0)';
    }, index * 100);
  }

  hideCategory(category) {
    category.style.transition = 'all 0.3s ease';
    category.style.opacity = '0';
    category.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
      category.style.display = 'none';
    }, 300);
  }

  updateActiveButton(activeButton) {
    // Remove active class from all buttons
    this.filterButtons.forEach(button => {
      button.classList.remove('active');
    });
    
    // Add active class to clicked button
    activeButton.classList.add('active');
  }

  // Method to programmatically set filter
  setFilter(filter) {
    const button = document.querySelector(`[data-filter="${filter}"]`);
    if (button) {
      this.filterCategories(filter);
      this.updateActiveButton(button);
    }
  }

  // Method to get current active filter
  getActiveFilter() {
    return this.activeFilter;
  }
}

// Initialize price filter when DOM is loaded
// DISABLED: This conflicts with the filterPrices function in price_dynamic.php
// document.addEventListener('DOMContentLoaded', function() {
//   if (document.querySelector('.price-filters')) {
//     const priceFilter = new PriceFilter();
//     
//     // Make it globally accessible for debugging
//     window.priceFilter = priceFilter;
//   }
// });

// ==================== SCROLL DOWN BUTTON ==================== 
function initializeScrollDown() {
  const scrollDownBtn = document.querySelector('.scroll-down');
  
  if (scrollDownBtn) {
    scrollDownBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Find the next section after hero
      const aboutSection = document.getElementById('about') || document.querySelector('.about');
      const servicesSection = document.getElementById('services') || document.querySelector('.services');
      const targetSection = aboutSection || servicesSection || document.querySelector('.section:not(.hero)');
      
      if (targetSection) {
        // Smooth scroll to the target section
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      } else {
        // Fallback: scroll down by viewport height
        window.scrollBy({
          top: window.innerHeight,
          behavior: 'smooth'
        });
      }
    });
    
    // Hide scroll down button when scrolling past hero section
    window.addEventListener('scroll', function() {
      const heroSection = document.querySelector('.hero');
      if (heroSection) {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        const scrollPosition = window.pageYOffset;
        
        if (scrollPosition > heroBottom - 100) {
          scrollDownBtn.style.opacity = '0';
          scrollDownBtn.style.pointerEvents = 'none';
        } else {
          scrollDownBtn.style.opacity = '1';
          scrollDownBtn.style.pointerEvents = 'auto';
        }
      }
    });
  }
}

// Initialize scroll down functionality
document.addEventListener('DOMContentLoaded', function() {
  initializeScrollDown();
});

// Portfolio Modal Class
class PortfolioModal {
  constructor() {
    this.modal = document.getElementById('portfolio-modal');
    this.closeBtn = document.getElementById('portfolio-modal-close-btn');
    this.viewGalleryBtn = document.getElementById('portfolio-modal-view-gallery');
    this.prevBtn = document.getElementById('portfolio-modal-prev');
    this.nextBtn = document.getElementById('portfolio-modal-next');
    this.titleEl = document.getElementById('portfolio-modal-title');
    this.descEl = document.getElementById('portfolio-modal-desc');
    this.imageEl = document.getElementById('portfolio-modal-image');
    this.categoryEl = document.getElementById('portfolio-modal-category');
    this.yearEl = document.getElementById('portfolio-modal-year');
    this.locationEl = document.getElementById('portfolio-modal-location');
    // New fields for technical data and features
    this.areaEl = document.getElementById('portfolio-modal-area');
    this.durationEl = document.getElementById('portfolio-modal-duration');
    this.typeEl = document.getElementById('portfolio-modal-type');
    this.imageCaptionEl = document.getElementById('portfolio-modal-image-caption');
    this.previouslyFocusedElement = null;
    this.focusableSelectors = 'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    this.items = [];
    this.currentIndex = -1;
  }

  init() {
    this.bindEvents();
    this.bindPortfolioItems();
  }

  bindEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.close();
      });
    }

    if (this.viewGalleryBtn) {
      this.viewGalleryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.viewGallery();
      });
    }

    if (this.modal) {
      // Закривати при кліку на фон
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });
    }

    // Prev/Next кнопки
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.prevProject();
      });
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.nextProject();
      });
    }

    // Закриття на ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
      // Фокус-трап для TAB
      if (e.key === 'Tab' && this.isOpen()) {
        this.handleTabKey(e);
      }
      // Перемикання стрілками
      if (this.isOpen() && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        if (e.key === 'ArrowLeft') this.prevProject();
        else this.nextProject();
      }
    });
  }

  bindPortfolioItems() {
    const items = document.querySelectorAll('.clickable-portfolio-item');
    this.items = Array.from(items);
    this.items.forEach((item, idx) => {
      const triggers = [
        item,
        item.querySelector('.clickable-image'),
        item.querySelector('.portfolio__overlay'),
        item.querySelector('.image-overlay')
      ].filter(Boolean);

      triggers.forEach((node) => {
        node.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.currentIndex = idx;
          this.openFromItem(item);
        });
      });
    });
  }

  isOpen() {
    return this.modal && this.modal.classList.contains('active');
  }

  getFocusableElements() {
    if (!this.modal) return [];
    const container = this.modal.querySelector('.modal__content') || this.modal;
    return Array.from(container.querySelectorAll(this.focusableSelectors)).filter(el => el.offsetParent !== null);
  }

  handleTabKey(e) {
    const focusable = this.getFocusableElements();
    if (!focusable.length) return;
    const firstEl = focusable[0];
    const lastEl = focusable[focusable.length - 1];
    const activeEl = document.activeElement;

    if (e.shiftKey) {
      // Shift+Tab: якщо на першому — перейти на останній
      if (activeEl === firstEl || !this.modal.contains(activeEl)) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      // Tab: якщо на останньому — перейти на перший
      if (activeEl === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  }

  openFromItem(item) {
    if (!item) return;
    const title = item.getAttribute('data-modal-title') || '';
    const desc = item.getAttribute('data-modal-desc') || '';
    const category = item.getAttribute('data-modal-category') || '';
    const year = item.getAttribute('data-modal-year') || '';
    const location = item.getAttribute('data-modal-location') || '';
    const area = item.getAttribute('data-modal-area') || '';
    const duration = item.getAttribute('data-modal-duration') || '';
    const type = item.getAttribute('data-modal-type') || '';
    const imageCaption = item.getAttribute('data-modal-image-caption') || '';
    const imgEl = item.querySelector('img');
    const image = imgEl ? imgEl.getAttribute('src') : '';

    this.open({ title, desc, category, year, location, area, duration, type, imageCaption, image });
  }

  open(data) {
    if (!this.modal) return;

    if (this.titleEl) this.titleEl.textContent = data.title || '';
    if (this.descEl) this.descEl.textContent = data.desc || '';
    if (this.categoryEl) this.categoryEl.textContent = data.category || '';
    if (this.yearEl) this.yearEl.textContent = data.year || '';
    if (this.locationEl) this.locationEl.textContent = data.location || '';
    // Technical data
    if (this.areaEl) this.areaEl.textContent = data.area || '—';
    if (this.durationEl) this.durationEl.textContent = data.duration || '—';
    if (this.typeEl) this.typeEl.textContent = data.type || '—';


    // Image caption bar
    if (this.imageCaptionEl) {
      const cap = data.imageCaption || '';
      if (cap) {
        this.imageCaptionEl.textContent = cap;
        this.imageCaptionEl.hidden = false;
      } else {
        this.imageCaptionEl.textContent = '';
        this.imageCaptionEl.hidden = true;
      }
    }

    if (this.imageEl) {
      if (data.image) {
        let src = data.image;
        if (/\.HEIC$/i.test(src)) {
          const jpgSrc = src.replace(/\.HEIC$/i, '.JPG');
          this.imageEl.onerror = function() {
            this.src = src;
          };
          this.imageEl.src = jpgSrc;
        } else {
          this.imageEl.src = src;
        }
        // Оновити alt текст під заголовок для доступності
        this.imageEl.alt = data.title || '';
      } else {
        this.imageEl.removeAttribute('src');
        this.imageEl.alt = '';
      }
    }

    // Зберігаємо попередній фокус та відкриваємо модалку
    this.previouslyFocusedElement = document.activeElement;
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');

    // Сфокусуватися на кнопці закриття (або заголовку)
    if (this.closeBtn) {
      this.closeBtn.focus();
    } else if (this.titleEl) {
      this.titleEl.setAttribute('tabindex', '-1');
      this.titleEl.focus();
    }

    // Клік по зображенню відкриває галерею
    if (this.imageEl) {
      this.imageEl.style.cursor = 'zoom-in';
      this.imageEl.addEventListener('click', () => this.viewGallery(), { once: true });
    }

    // Оновити стан навігації
    this.updateNavButtons();
  }

  close() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');

    // Повернути фокус назад
    if (this.previouslyFocusedElement && typeof this.previouslyFocusedElement.focus === 'function') {
      this.previouslyFocusedElement.focus();
    }
  }

  viewGallery() {
    if (window.gallery && typeof window.gallery.showGallery === 'function') {
      window.gallery.showGallery();
    }
    this.close();
  }

  goToIndex(index) {
    if (!this.items || !this.items.length) return;
    // wrap-around
    const total = this.items.length;
    const nextIndex = ((index % total) + total) % total;
    const nextItem = this.items[nextIndex];
    if (nextItem) {
      this.currentIndex = nextIndex;
      this.openFromItem(nextItem);
    }
  }

  prevProject() {
    if (this.currentIndex === -1) return;
    this.goToIndex(this.currentIndex - 1);
  }

  nextProject() {
    if (this.currentIndex === -1) return;
    this.goToIndex(this.currentIndex + 1);
  }

  updateNavButtons() {
    const hasMany = this.items && this.items.length > 1;
    if (this.prevBtn) {
      this.prevBtn.disabled = !hasMany;
    }
    if (this.nextBtn) {
      this.nextBtn.disabled = !hasMany;
    }
  }
}

// Ініціалізація модального вікна портфоліо
document.addEventListener('DOMContentLoaded', function() {
  const portfolioModal = new PortfolioModal();
  portfolioModal.init();
  window.portfolioModal = portfolioModal;
});

// Apply HEIC -> JPG fallback on DOM ready (Chrome-compatible)
document.addEventListener('DOMContentLoaded', function() {
  const imgs = document.querySelectorAll('img');
  imgs.forEach(function(img) {
    const src = img.getAttribute('src');
    if (!src) return;
    // If image uses HEIC, try to load corresponding JPG
    if (/\.HEIC$/i.test(src)) {
      const jpgSrc = src.replace(/\.HEIC$/i, '.JPG');
      const tester = new Image();
      tester.onload = function() {
        img.src = jpgSrc;
      };
      tester.onerror = function() {
        // keep original HEIC (Safari supports it)
      };
      tester.src = jpgSrc;
    }
  });
});