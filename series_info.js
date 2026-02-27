/**
 * ============================================================
 *  SERIES INFO PLUGIN FOR LAMPA
 *  Показує кількість сезонів та серій на картках серіалів/аніме
 *  Автор: Claude | Версія: 1.0.0
 * ============================================================
 */

(function () {
    'use strict';

    // ── Конфіг ──────────────────────────────────────────────
    var PLUGIN_NAME  = 'series_info';
    var TMDB_API     = 'https://api.themoviedb.org/3';
    var TMDB_KEY     = '4ef0d7355d9ffb5151e987764708ce96'; // публічний ключ Lampa
    var CACHE_TTL    = 60 * 60 * 24 * 3; // 3 дні в секундах
    var cache        = {};

    // ── CSS стилі значка ────────────────────────────────────
    var CSS = [
        '.series-info-badge {',
        '  position: absolute;',
        '  bottom: 6px;',
        '  left: 6px;',
        '  display: flex;',
        '  align-items: center;',
        '  gap: 4px;',
        '  pointer-events: none;',
        '  z-index: 10;',
        '}',
        '.series-info-badge__pill {',
        '  background: rgba(0,0,0,0.72);',
        '  backdrop-filter: blur(6px);',
        '  -webkit-backdrop-filter: blur(6px);',
        '  border-radius: 4px;',
        '  padding: 2px 7px;',
        '  font-size: 11px;',
        '  font-weight: 600;',
        '  color: #fff;',
        '  line-height: 1.5;',
        '  white-space: nowrap;',
        '  letter-spacing: 0.02em;',
        '}',
        '.series-info-badge__pill--ended {',
        '  background: rgba(40,180,99,0.82);',
        '  color: #fff;',
        '}',
        '.series-info-badge__pill--seasons {',
        '  background: rgba(30,120,220,0.80);',
        '}',
        '.series-info-badge__pill--episodes {',
        '  background: rgba(0,0,0,0.72);',
        '}'
    ].join('\n');

    // ── Вставити стилі ──────────────────────────────────────
    function injectStyles() {
        if (document.getElementById('series-info-styles')) return;
        var s = document.createElement('style');
        s.id  = 'series-info-styles';
        s.textContent = CSS;
        document.head.appendChild(s);
    }

    // ── Отримати дані з TMDB (з кешем) ──────────────────────
    function fetchSeriesData(tmdbId, callback) {
        var key = PLUGIN_NAME + '_tmdb_' + tmdbId;

        // Перевіряємо in-memory кеш
        if (cache[tmdbId]) {
            callback(cache[tmdbId]);
            return;
        }

        // Перевіряємо Lampa Storage
        try {
            var stored = Lampa.Storage.get(key);
            if (stored && stored.time && (Date.now() / 1000 - stored.time) < CACHE_TTL) {
                cache[tmdbId] = stored.data;
                callback(stored.data);
                return;
            }
        } catch (e) {}

        // Запит до TMDB
        var url = TMDB_API + '/tv/' + tmdbId + '?api_key=' + TMDB_KEY + '&language=uk-UA';

        fetch(url)
            .then(function (r) { return r.json(); })
            .then(function (json) {
                if (!json || json.success === false) return;

                var info = {
                    status:        json.status || '',
                    seasons:       0,
                    episodes:      json.number_of_episodes || 0,
                    in_production: json.in_production || false
                };

                // Фільтруємо сезони (прибираємо «Specials» якщо season_number === 0)
                if (json.seasons) {
                    info.seasons = json.seasons.filter(function (s) {
                        return s.season_number > 0;
                    }).length;
                }

                cache[tmdbId] = info;

                try {
                    Lampa.Storage.set(key, { time: Date.now() / 1000, data: info });
                } catch (e) {}

                callback(info);
            })
            .catch(function () {});
    }

    // ── Побудувати HTML значка ───────────────────────────────
    function buildBadgeHTML(info) {
        var isEnded = info.status === 'Ended' || info.status === 'Canceled';
        var parts   = [];

        if (isEnded) {
            parts.push('<span class="series-info-badge__pill series-info-badge__pill--ended">Завершено</span>');
        }

        if (info.seasons > 0) {
            var sLabel = info.seasons + ' ' + pluralSeason(info.seasons);
            parts.push('<span class="series-info-badge__pill series-info-badge__pill--seasons">' + sLabel + '</span>');
        }

        if (info.episodes > 0) {
            var eLabel = info.episodes + ' ' + pluralEpisode(info.episodes);
            parts.push('<span class="series-info-badge__pill series-info-badge__pill--episodes">' + eLabel + '</span>');
        }

        if (!parts.length) return '';
        return '<div class="series-info-badge">' + parts.join('') + '</div>';
    }

    // ── Відміни слів ────────────────────────────────────────
    function pluralSeason(n) {
        var mod10 = n % 10, mod100 = n % 100;
        if (mod10 === 1 && mod100 !== 11)  return 'сезон';
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'сезони';
        return 'сезонів';
    }

    function pluralEpisode(n) {
        var mod10 = n % 10, mod100 = n % 100;
        if (mod10 === 1 && mod100 !== 11)  return 'серія';
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'серії';
        return 'серій';
    }

    // ── Знайти картки та додати значок ──────────────────────
    function processCard(cardElement, cardData) {
        if (!cardElement || !cardData) return;

        // Тільки серіали та аніме
        var mediaType = cardData.media_type || '';
        var genreIds  = cardData.genre_ids  || [];
        var isAnime   = genreIds.indexOf(16) !== -1; // 16 = Animation

        if (mediaType !== 'tv' && !isAnime) {
            // Якщо тип невідомий але є number_of_seasons — теж обробляємо
            if (!cardData.number_of_seasons && !cardData.first_air_date) return;
        }

        var tmdbId = cardData.id;
        if (!tmdbId) return;

        // Не додавати двічі
        if (cardElement.querySelector('.series-info-badge')) return;

        var poster = cardElement.querySelector('.card__img, .card__poster, .card__image');
        if (!poster) return;

        // Робимо poster position:relative якщо треба
        var pos = window.getComputedStyle(poster).position;
        if (pos === 'static') poster.style.position = 'relative';

        fetchSeriesData(tmdbId, function (info) {
            // Ще раз перевірити, раптом вже додали
            if (cardElement.querySelector('.series-info-badge')) return;
            var html = buildBadgeHTML(info);
            if (html) poster.insertAdjacentHTML('beforeend', html);
        });
    }

    // ── Спостерігач за DOM (MutationObserver) ───────────────
    var observer;
    function startObserver() {
        if (observer) return;

        observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (m) {
                m.addedNodes.forEach(function (node) {
                    if (node.nodeType !== 1) return;

                    // Шукаємо картки всередині доданого вузла
                    var cards = node.querySelectorAll
                        ? node.querySelectorAll('.card')
                        : [];

                    // Якщо сам вузол є карткою
                    if (node.classList && node.classList.contains('card')) {
                        cards = [node];
                    }

                    cards.forEach(function (card) {
                        var dataRaw = card.dataset.card || card.getAttribute('data-card');
                        if (!dataRaw) return;
                        try {
                            var data = JSON.parse(dataRaw);
                            processCard(card, data);
                        } catch (e) {}
                    });
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // ── Перевірити вже існуючі картки ───────────────────────
    function processExistingCards() {
        var cards = document.querySelectorAll('.card[data-card]');
        cards.forEach(function (card) {
            try {
                var data = JSON.parse(card.getAttribute('data-card'));
                processCard(card, data);
            } catch (e) {}
        });
    }

    // ── Lampa event hooks ────────────────────────────────────
    function initPlugin() {
        injectStyles();
        startObserver();
        processExistingCards();
    }

    // ── Точка входу ─────────────────────────────────────────
    if (window.Lampa) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                initPlugin();
            }
        });

        // Якщо додаток вже готовий
        if (document.querySelector('.app__body')) {
            initPlugin();
        }

        // Слухаємо відкриття каталогів / пошуку
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite' || e.type === 'ready') {
                setTimeout(processExistingCards, 300);
            }
        });

        Lampa.Listener.follow('feed', function () {
            setTimeout(processExistingCards, 400);
        });

        // Маніфест плагіна (для магазину плагінів)
        if (Lampa.Manifest) {
            Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
            Lampa.Manifest.plugins.push({
                name:    'Series Info',
                version: '1.0.0',
                author:  'Claude',
                desc:    'Показує кількість сезонів та серій на картках серіалів і аніме'
            });
        }

    } else {
        // Якщо Lampa ще не завантажена — чекаємо
        window.addEventListener('load', function () {
            var tries = 0;
            var wait  = setInterval(function () {
                if (window.Lampa || ++tries > 20) {
                    clearInterval(wait);
                    if (window.Lampa) initPlugin();
                }
            }, 500);
        });
    }

})();
