(function () {
  'use strict';

  var ENDED_TEXT = 'Завершено';
  var CACHE_TTL = 1000 * 60 * 60 * 6; // 6 год
  var cache = window.__seinfo_cache2 || (window.__seinfo_cache2 = {});

  function cacheGet(k){
    var v = cache[k];
    if(!v) return null;
    if(Date.now() - v.t > CACHE_TTL) return null;
    return v.v;
  }
  function cacheSet(k,v){ cache[k] = {t:Date.now(), v:v}; }

  function addStyleOnce() {
    if (window.__seinfo_style2) return;
    window.__seinfo_style2 = true;
    var s = document.createElement('style');
    s.innerHTML = `
      .card__seinfo_badge{
        position:absolute; left:.45em; bottom:.45em; z-index:999;
        padding:.18em .5em; border-radius:.75em;
        background:rgba(0,0,0,.55);
        font-size:1.05em; line-height:1.2;
        max-width:92%;
        white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
      }
      .card__seinfo_ok{ background:rgba(0,0,0,.55); }
      .card__seinfo_ended{ background:rgba(56,165,100,.78) !important; }
      .card__seinfo_err{ background:rgba(200,60,60,.78) !important; }
    `;
    document.head.appendChild(s);
  }

  function isTv(card) {
    if (!card) return false;
    if (card.type === 'tv' || card.media_type === 'tv') return true;
    if (card.name && (card.first_air_date || card.last_episode_to_air || card.number_of_seasons)) return true;
    return false;
  }

  function uaPlural(n, one, few, many) {
    n = Math.abs(Number(n)) || 0;
    var n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return one;
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few;
    return many;
  }

  function ensureBox(html) {
    var box =
      html.querySelector('.card__view') ||
      html.querySelector('.card__img') ||
      html.querySelector('.card__body') ||
      html;

    if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
    return box;
  }

  function setBadge(html, text, cls) {
    var box = ensureBox(html);
    var old = box.querySelector('.card__seinfo_badge');
    if (old) old.remove();

    var b = document.createElement('div');
    b.className = 'card__seinfo_badge ' + (cls || 'card__seinfo_ok');
    b.textContent = text;
    box.appendChild(b);
  }

  function buildText(details) {
    if (!details) return null;

    var status = String(details.status || '').toLowerCase();
    if (status === 'ended') return { text: ENDED_TEXT, cls: 'card__seinfo_ended' };

    var s = details.number_of_seasons;
    var e = details.number_of_episodes;

    var parts = [];
    if (s != null) parts.push(Number(s) + ' ' + uaPlural(s, 'сезон', 'сезони', 'сезонів'));
    if (e != null) parts.push(Number(e) + ' ' + uaPlural(e, 'серія', 'серії', 'серій'));

    if (!parts.length) return null;
    return { text: parts.join(' • '), cls: 'card__seinfo_ok' };
  }

  // намагаємось кількома способами, бо в різних збірках API різний
  function fetchFull(card, cb) {
    var id = card.id;
    if (!id) return cb(null);

    // 1) найчастіше так
    try {
      if (Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb && Lampa.Api.sources.tmdb.full) {
        return Lampa.Api.sources.tmdb.full(
          { card: card, id: id, method: 'tv' },
          function (json) { cb(json); },
          function () { cb(null); }
        );
      }
    } catch (e) {}

    // 2) інколи full хоче type замість method
    try {
      if (Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb && Lampa.Api.sources.tmdb.full) {
        return Lampa.Api.sources.tmdb.full(
          { card: card, id: id, type: 'tv' },
          function (json) { cb(json); },
          function () { cb(null); }
        );
      }
    } catch (e) {}

    // 3) запасний варіант (деякі збірки мають TMDB обгортку)
    try {
      if (Lampa.TMDB && typeof Lampa.TMDB.tv === 'function') {
        return Lampa.TMDB.tv(id, function (json) { cb(json); }, function () { cb(null); });
      }
    } catch (e) {}

    cb(null);
  }

  function onCard(card, html) {
    if (!isTv(card) || !html) return;

    var key = 'tv:' + String(card.id || '');
    var cached = cacheGet(key);
    if (cached) {
      var builtC = buildText(cached);
      if (builtC) setBadge(html, builtC.text, builtC.cls);
      return;
    }

    setBadge(html, '…', 'card__seinfo_ok');

    fetchFull(card, function (full) {
      if (!full) {
        setBadge(html, 'TMDB', 'card__seinfo_err');
        return;
      }
      cacheSet(key, full);

      var built = buildText(full);
      if (built) setBadge(html, built.text, built.cls);
      else setBadge(html, 'TMDB', 'card__seinfo_err');
    });
  }

  function start() {
    if (window.__seinfo_started2) return;
    window.__seinfo_started2 = true;

    addStyleOnce();

    // найкраще — через події карток
    if (Lampa.Listener && Lampa.Listener.follow) {
      Lampa.Listener.follow('card', function (e) {
        if (!e || !e.card || !e.html) return;
        onCard(e.card, e.html);
      });
    }
  }

  if (window.appready) start();
  else if (window.Lampa && Lampa.Listener && Lampa.Listener.follow) {
    Lampa.Listener.follow('app', function (e) {
      if (e && e.type === 'ready') start();
    });
  } else setTimeout(start, 1500);
})();
