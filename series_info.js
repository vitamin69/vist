/**
 * ============================================================
 *  SERIES INFO PLUGIN FOR LAMPA  v2.0
 *  Показує кількість сезонів та серій на картках серіалів/аніме
 * ============================================================
 */
(function () {
    'use strict';

    if (window.series_info_plugin_loaded) return;
    window.series_info_plugin_loaded = true;

    // ── Стилі ───────────────────────────────────────────────
    var CSS = [
        '.si-badge{',
        '  position:absolute;bottom:0;left:0;right:0;',
        '  display:flex;flex-wrap:wrap;gap:3px;padding:5px;',
        '  background:linear-gradient(transparent,rgba(0,0,0,.85));',
        '  pointer-events:none;z-index:5;',
        '}',
        '.si-pill{',
        '  font-size:.65em;font-weight:700;color:#fff;',
        '  background:rgba(0,0,0,.55);border-radius:3px;',
        '  padding:2px 6px;line-height:1.4;white-space:nowrap;',
        '}',
        '.si-pill--ended{background:rgba(34,160,80,.85);}',
        '.si-pill--seasons{background:rgba(20,110,210,.75);}',
        '.si-pill--eps{background:rgba(0,0,0,.55);}'
    ].join('');

    function injectCSS() {
        if (document.getElementById('si-css')) return;
        var s = document.createElement('style');
        s.id = 'si-css';
        s.textContent = CSS;
        document.head.appendChild(s);
    }

    // ── Кеш ─────────────────────────────────────────────────
    var memCache = {};
    var CACHE_DAYS = 3;
    var TMDB_KEY = '4ef0d7355d9ffb5151e987764708ce96';

    function cacheGet(id) {
        if (memCache[id]) return memCache[id];
        try {
            var raw = Lampa.Storage.get('si_' + id, '');
            if (raw) {
                var obj = JSON.parse(raw);
                if ((Date.now() / 1000 - obj.t) < CACHE_DAYS * 86400) {
                    memCache[id] = obj.d;
                    return obj.d;
                }
            }
        } catch(e) {}
        return null;
    }

    function cacheSet(id, data) {
        memCache[id] = data;
        try {
            Lampa.Storage.set('si_' + id, JSON.stringify({t: Date.now() / 1000, d: data}));
        } catch(e) {}
    }

    // ── TMDB запит через Lampa.Reguest ──────────────────────
    function fetchInfo(tmdbId, cb) {
        var cached = cacheGet(tmdbId);
        if (cached) { cb(cached); return; }

        var url = 'https://api.themoviedb.org/3/tv/' + tmdbId +
                  '?api_key=' + TMDB_KEY + '&language=uk-UA';

        Lampa.Reguest.silent(url, function(json) {
            if (!json || !json.id) return;
            var seasons = 0;
            if (json.seasons) {
                json.seasons.forEach(function(s) {
                    if (s.season_number > 0) seasons++;
                });
            }
            var info = {
                status:   json.status || '',
                seasons:  seasons,
                episodes: json.number_of_episodes || 0
            };
            cacheSet(tmdbId, info);
            cb(info);
        }, function() {});
    }

    // ── Числівники ──────────────────────────────────────────
    function ps(n) {
        var m = n % 10, h = n % 100;
        if (m===1 && h!==11) return n+' сезон';
        if (m>=2 && m<=4 && (h<10||h>=20)) return n+' сезони';
        return n+' сезонів';
    }
    function pe(n) {
        var m = n % 10, h = n % 100;
        if (m===1 && h!==11) return n+' серія';
        if (m>=2 && m<=4 && (h<10||h>=20)) return n+' серії';
        return n+' серій';
    }

    // ── Додати значок до картки ──────────────────────────────
    function addBadge(cardEl, info) {
        if (cardEl.querySelector('.si-badge')) return;

        var ended = info.status === 'Ended' || info.status === 'Canceled';
        var html = '';
        if (ended)         html += '<span class="si-pill si-pill--ended">✓ Завершено</span>';
        if (info.seasons)  html += '<span class="si-pill si-pill--seasons">' + ps(info.seasons) + '</span>';
        if (info.episodes) html += '<span class="si-pill si-pill--eps">' + pe(info.episodes) + '</span>';
        if (!html) return;

        var view = cardEl.querySelector('.card__view');
        if (!view) return;

        view.style.position = 'relative';
        view.style.overflow = 'hidden';
        var badge = document.createElement('div');
        badge.className = 'si-badge';
        badge.innerHTML = html;
        view.appendChild(badge);
    }

    // ── Обробити картку через DOM елемент ────────────────────
    function processCardEl(cardEl) {
        if (cardEl.dataset.siDone) return;
        cardEl.dataset.siDone = '1';

        var data = cardEl._data || cardEl.data;
        if (!data) return;

        var isTv = data.media_type === 'tv' || !!data.first_air_date;
        if (!isTv) return;

        var id = data.id;
        if (!id) return;

        fetchInfo(id, function(info) { addBadge(cardEl, info); });
    }

    // ── Сканувати DOM ────────────────────────────────────────
    function scanAll() {
        document.querySelectorAll('.card').forEach(function(el) {
            processCardEl(el);
        });
    }

    // ── MutationObserver ────────────────────────────────────
    function startObserver() {
        new MutationObserver(function(muts) {
            muts.forEach(function(m) {
                m.addedNodes.forEach(function(n) {
                    if (n.nodeType !== 1) return;
                    if (n.classList && n.classList.contains('card')) {
                        processCardEl(n);
                    } else if (n.querySelectorAll) {
                        n.querySelectorAll('.card').forEach(processCardEl);
                    }
                });
            });
        }).observe(document.body, {childList: true, subtree: true});
    }

    // ── Хук через Lampa.Listener 'card' ─────────────────────
    function hookCard() {
        Lampa.Listener.follow('card', function(e) {
            if (e.type !== 'complite' && e.type !== 'create') return;
            if (!e.data) return;

            var isTv = e.data.media_type === 'tv' || !!e.data.first_air_date;
            if (!isTv) return;

            var id = e.data.id;
            if (!id) return;

            // e.card.render() повертає jQuery/DOM елемент картки
            var el = null;
            try {
                var r = e.card.render();
                el = (r && r[0]) ? r[0] : r;
            } catch(err) {}
            if (!el) return;
            if (el.dataset.siDone) return;
            el.dataset.siDone = '1';

            fetchInfo(id, function(info) { addBadge(el, info); });
        });
    }

    // ── Ініціалізація ────────────────────────────────────────
    function init() {
        injectCSS();
        hookCard();
        startObserver();
        setTimeout(scanAll, 800);

        Lampa.Listener.follow('activity', function(e) {
            if (e.type === 'start' || e.type === 'back' || e.type === 'resume') {
                setTimeout(scanAll, 700);
            }
        });
    }

    // ── Старт ────────────────────────────────────────────────
    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') init();
        });
    }

})();
