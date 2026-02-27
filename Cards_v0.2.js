(function () {
  'use strict';

  // ====== Налаштування ======
  var SHOW_EPISODES = true;     // показувати "серій" (number_of_episodes)
  var SHOW_SEASONS = true;      // показувати "сезонів" (number_of_seasons)
  var ENDED_TEXT = 'Завершено'; // текст для завершених
  var CACHE_TTL = 1000 * 60 * 60 * 12; // 12 годин кеш

  // ====== Кеш ======
  var cache = window.__seinfo_cache || (window.__seinfo_cache = {});
  function cacheGet(key) {
    var n = cache[key];
    if (!n) return null;
    if (Date.now() - n.t > CACHE_TTL) return null;
    return n.v;
  }
  function cacheSet(key, value) {
    cache[key] = { t: Date.now(), v: value };
  }

  // ====== Українські закінчення (спрощено, але нормально виглядає) ======
  function uaPlural(n, one, few, many) {
    n = Math.abs(Number(n)) || 0;
    var n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return one;              // 1
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few; // 2-4
    return many;                                           // 0,5-9,11-14
  }

  function isTvCard(card) {
    if (!card) return false;
    // у Lampa у ТВ часто є name/first_air_date, а у фільмів title/release_date
    if (card.type === 'tv') return true;
    if (card.name && (card.first_air_date || card.number_of_seasons || card.last_episode_to_air)) return true;
    // fallback: інколи буває media_type
    if (card.media_type === 'tv') return true;
    return false;
  }

  function ensureStyle() {
    if (window.__seinfo_style_added) return;
    window.__seinfo_style_added = true;

    var style = document.createElement('style');
    style.innerHTML =
      '.card__seinfo{' +
        'position:absolute;left:.45em;bottom:.45em;z-index:3;' +
        'padding:.22em .55em;border-radius:.75em;' +
        'background:rgba(0,0,0,.55);' +
        'font-size:1.05em;line-height:1.2;' +
        'max-width:92%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;' +
      '}' +
      '.card__seinfo._ended{background:rgba(56,165,100,.75);}';
    document.head.appendChild(style);
  }

  function renderBadge(cardHtml, text, ended) {
    if (!cardHtml) return;

    // прибрати старий бейдж (щоб не дублювався)
    var old = cardHtml.querySelector('.card__seinfo');
    if (old) old.remove();

    var view = cardHtml.querySelector('.card__view') || cardHtml;
    // .card__view зазвичай position:relative, але на всяк випадок:
    if (getComputedStyle(view).position === 'static') view.style.position = 'relative';

    var div = document.createElement('div');
    div.className = 'card__seinfo' + (ended ? ' _ended' : '');
    div.textContent = text;
    view.appendChild(div);
  }

  function buildText(details) {
    if (!details) return '';

    var status = (details.status || '').toLowerCase();
    var ended = status === 'ended';

    if (ended) return { text: ENDED_TEXT, ended: true };

    var parts = [];
    if (SHOW_SEASONS && details.number_of_seasons != null) {
      var s = Number(details.number_of_seasons) || 0;
      parts.push(s + ' ' + uaPlural(s, 'сезон', 'сезони', 'сезонів'));
    }
    if (SHOW_EPISODES && details.number_of_episodes != null) {
      var e = Number(details.number_of_episodes) || 0;
      parts.push(e + ' ' + uaPlural(e, 'серія', 'серії', 'серій'));
    }

    return { text: parts.join(' • '), ended: false };
  }

  function fetchTvDetails(card, onDone) {
    // важливо: Lampa зазвичай тягне full через TMDB source
    // у плагінах це роблять так: Lampa.Api.sources.tmdb.full(params, ok, err) :contentReference[oaicite:1]{index=1}
    try {
      Lampa.Api.sources.tmdb.full(
        { card: card, id: card.id, method: 'tv' },
        function (json) { onDone(null, json); },
        function (err) { onDone(err || new Error('tmdb.full error')); }
      );
    } catch (e) {
      onDone(e);
    }
  }

  function start() {
    if (window.__seinfo_plugin_started) return;
    window.__seinfo_plugin_started = true;

    ensureStyle();

    var CardMaker = Lampa.Maker.map('Card');
    var originalOnVisible = CardMaker.Card.onVisible;

    CardMaker.Card.onVisible = function () {
      originalOnVisible.apply(this, arguments);

      var card = this.data || this.card || this;
      if (!isTvCard(card)) return;

      var key = 'tv:' + (card.id || '') + ':' + (Lampa.Storage.get('tmdb_lang', 'ru') || 'ru');
      var cached = cacheGet(key);

      var self = this;

      if (cached) {
        var built = buildText(cached);
        if (built.text) renderBadge(self.html, built.text, built.ended);
        return;
      }

      // тимчасовий бейдж, поки вантажиться (не обов’язково)
      renderBadge(self.html, '…', false);

      fetchTvDetails(card, function (_err, details) {
        if (!details) return;

        cacheSet(key, details);

        var built = buildText(details);
        if (built.text) renderBadge(self.html, built.text, built.ended);
      });
    };
  }

  // стандартний автозапуск як у більшості плагінів Lampa :contentReference[oaicite:2]{index=2}
  if (window.appready) start();
  else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') start();
    });
  }
})();
