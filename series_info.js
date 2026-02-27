/**
 * SERIES INFO PLUGIN FOR LAMPA  v3.0
 * Показує сезони / серії / "Завершено" на картках серіалів та аніме
 * Метод: патч Lampa.Card.prototype (як роблять реальні bylampa плагіни)
 */
(function () {
    'use strict';

    if (window.__series_info_loaded) return;
    window.__series_info_loaded = true;

    var TMDB_KEY  = '4ef0d7355d9ffb5151e987764708ce96';
    var CACHE_TTL = 60 * 60 * 24 * 3; // 3 дні
    var mem       = {};

    // ── CSS ────────────────────────────────────────────────
    var CSS = '\
.si-box{\
  position:absolute;bottom:0;left:0;right:0;\
  background:linear-gradient(transparent,rgba(0,0,0,.82));\
  padding:4px 5px 5px;\
  display:flex;flex-wrap:wrap;gap:3px;\
  pointer-events:none;\
}\
.si-tag{\
  font-size:.6em;font-weight:700;letter-spacing:.03em;\
  color:#fff;border-radius:3px;padding:1px 5px;\
  line-height:1.5;white-space:nowrap;\
}\
.si-ended{background:rgba(39,174,96,.9);}\
.si-seas  {background:rgba(22,105,195,.85);}\
.si-eps   {background:rgba(0,0,0,.6);}';

    function injectCSS() {
        if (document.getElementById('__si_css')) return;
        var el = document.createElement('style');
        el.id  = '__si_css';
        el.textContent = CSS;
        document.head.appendChild(el);
    }

    // ── Кеш ───────────────────────────────────────────────
    function cGet(id) {
        if (mem[id]) return mem[id];
        try {
            var s = Lampa.Storage.get('__si_' + id, '');
            if (s) {
                var o = JSON.parse(s);
                if (Date.now() / 1000 - o.t < CACHE_TTL) { mem[id] = o.d; return o.d; }
            }
        } catch(e){}
        return null;
    }
    function cSet(id, d) {
        mem[id] = d;
        try { Lampa.Storage.set('__si_' + id, JSON.stringify({t: Date.now()/1000, d: d})); } catch(e){}
    }

    // ── TMDB ───────────────────────────────────────────────
    function loadInfo(id, cb) {
        var cached = cGet(id);
        if (cached) { cb(cached); return; }
        Lampa.Reguest.silent(
            'https://api.themoviedb.org/3/tv/' + id + '?api_key=' + TMDB_KEY,
            function(json) {
                if (!json || !json.id) return;
                var seas = 0;
                if (json.seasons) json.seasons.forEach(function(s){ if(s.season_number>0) seas++; });
                var d = { status: json.status||'', seasons: seas, episodes: json.number_of_episodes||0 };
                cSet(id, d);
                cb(d);
            },
            function(){}
        );
    }

    // ── Відмінювання ───────────────────────────────────────
    function plS(n){var m=n%10,h=n%100;return m===1&&h!==11?n+' сезон':m>=2&&m<=4&&(h<10||h>=20)?n+' сезони':n+' сезонів';}
    function plE(n){var m=n%10,h=n%100;return m===1&&h!==11?n+' серія':m>=2&&m<=4&&(h<10||h>=20)?n+' серії':n+' серій';}

    // ── Додати бейдж до .card__view ────────────────────────
    function applyBadge(view, info) {
        if (view.querySelector('.si-box')) return;
        var ended = info.status==='Ended'||info.status==='Canceled';
        var h = '';
        if (ended)          h += '<span class="si-tag si-ended">✓ Завершено</span>';
        if (info.seasons)   h += '<span class="si-tag si-seas">'  + plS(info.seasons)  + '</span>';
        if (info.episodes)  h += '<span class="si-tag si-eps">'   + plE(info.episodes) + '</span>';
        if (!h) return;
        view.style.position = 'relative';
        view.style.overflow = 'hidden';
        var box = document.createElement('div');
        box.className = 'si-box';
        box.innerHTML = h;
        view.appendChild(box);
    }

    // ── Основний патч: чекаємо Lampa.Card ─────────────────
    function patchCard() {
        if (!Lampa.Card) return false;

        var orig = Lampa.Card.prototype.create;
        if (!orig || Lampa.Card.prototype.__si_patched) return true;
        Lampa.Card.prototype.__si_patched = true;

        Lampa.Card.prototype.create = function() {
            orig.apply(this, arguments);
            var self  = this;
            var data  = this.data || this.movie;
            if (!data) return;

            // тільки серіали (media_type===tv або є first_air_date)
            if (data.media_type !== 'tv' && !data.first_air_date) return;
            if (!data.id) return;

            // отримати DOM елемент картки
            var el = null;
            try { el = this.render ? (this.render()[0] || this.render()) : null; } catch(e){}
            if (!el) return;

            var view = el.querySelector('.card__view');
            if (!view) return;

            loadInfo(data.id, function(info) {
                applyBadge(view, info);
            });
        };

        return true;
    }

    // ── Також скануємо DOM для вже відрендерених карток ───
    function scanDOM() {
        document.querySelectorAll('.card__view').forEach(function(view) {
            if (view.querySelector('.si-box')) return;
            // намагаємось знайти дані через jQuery .data() на батьківській картці
            var card = view.closest('.card');
            if (!card) return;
            var d = null;
            try { d = $(card).data('movie') || $(card).data('card') || $(card).data('data'); } catch(e){}
            if (!d || !d.id) return;
            if (d.media_type !== 'tv' && !d.first_air_date) return;
            loadInfo(d.id, function(info){ applyBadge(view, info); });
        });
    }

    // ── Ініціалізація ──────────────────────────────────────
    function init() {
        injectCSS();

        // Спроба #1: патч через Lampa.Card.prototype
        if (!patchCard()) {
            // Якщо Lampa.Card ще не існує — чекаємо
            var t = setInterval(function(){
                if (patchCard()) clearInterval(t);
            }, 200);
        }

        // Спроба #2: слухаємо event 'card' (деякі версії Lampa його кидають)
        try {
            Lampa.Listener.follow('card', function(e) {
                if (!e || !e.data) return;
                if (e.data.media_type !== 'tv' && !e.data.first_air_date) return;
                if (!e.data.id) return;
                var el = null;
                try {
                    var r = e.card && e.card.render ? e.card.render() : null;
                    el = r ? (r[0] || r) : null;
                } catch(err){}
                if (!el) return;
                var view = el.querySelector('.card__view');
                if (!view) return;
                loadInfo(e.data.id, function(info){ applyBadge(view, info); });
            });
        } catch(e){}

        // Спроба #3: MutationObserver + jQuery .data() для вже існуючих карток
        setTimeout(scanDOM, 1000);

        var observer = new MutationObserver(function(muts) {
            var need = false;
            muts.forEach(function(m){
                m.addedNodes.forEach(function(n){
                    if (n.nodeType===1 && (
                        (n.classList && n.classList.contains('card')) ||
                        (n.querySelector && n.querySelector('.card'))
                    )) need = true;
                });
            });
            if (need) setTimeout(scanDOM, 100);
        });
        observer.observe(document.body, {childList:true, subtree:true});

        // Оновлювати при зміні activity
        try {
            Lampa.Listener.follow('activity', function(e){
                if (e.type==='start'||e.type==='back'||e.type==='resume')
                    setTimeout(scanDOM, 500);
            });
        } catch(e){}
    }

    // ── Старт ──────────────────────────────────────────────
    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function(e){
            if (e.type === 'ready') init();
        });
    }

})();
