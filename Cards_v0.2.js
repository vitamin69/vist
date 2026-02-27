(function () {
  'use strict';

  var ENDED_TEXT = 'Завершено';

  function addStyleOnce() {
    if (window.__seinfo_style) return;
    window.__seinfo_style = true;

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
      .card__seinfo_dot{
        position:absolute; left:.55em; top:.55em; z-index:999;
        width:.55em; height:.55em; border-radius:50%;
        background:rgba(255, 200, 0, .95);
        box-shadow:0 0 0 .12em rgba(0,0,0,.35);
      }
      .card__seinfo_ended{ background:rgba(56,165,100,.78) !important; }
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

  function ensureContainer(html) {
    // пробуємо знайти “картинку” або основний блок
    var box =
      html.querySelector('.card__view') ||
      html.querySelector('.card__img') ||
      html.querySelector('.card__body') ||
      html;

    if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
    return box;
  }

  function setDot(html) {
    var box = ensureContainer(html);
    if (box.querySelector('.card__seinfo_dot')) return;
    var d = document.createElement('div');
    d.className = 'card__seinfo_dot';
    box.appendChild(d);
  }

  function setBadge(html, text, ended) {
    var box = ensureContainer(html);

    var old = box.querySelector('.card__seinfo_badge');
    if (old) old.remove();

    var b = document.createElement('div');
    b.className = 'card__seinfo_badge' + (ended ? ' card__seinfo_ended' : '');
    b.textContent = text;
    box.appendChild(b);
  }

  function fetchTmdbFull(card, ok) {
    // 3 варіанти (бо в різних збірках Lampa API різний)
    try {
      if (Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb && Lampa.Api.sources.tmdb.full) {
        return Lampa.Api.sources.tmdb.full(
          { card: card, id: card.id, method: 'tv' },
          function (json) { ok(json); },
          function () { ok(null); }
        );
      }
    } catch (e) {}

    try {
      if (Lampa.TMDB && Lampa.TMDB.tv) {
        return Lampa.TMDB.tv(card.id, function (json) { ok(json); }, function () { ok(null); });
      }
    } catch (e) {}

    ok(null);
  }

  function buildText(details) {
    if (!details) return null;

    var status = String(details.status || '').toLowerCase();
    if (status === 'ended') return { text: ENDED_TEXT, ended: true };

    var s = details.number_of_seasons;
    var e = details.number_of_episodes;

    var parts = [];
    if (s != null) parts.push(Number(s) + ' ' + uaPlural(s, 'сезон', 'сезони', 'сезонів'));
    if (e != null) parts.push(Number(e) + ' ' + uaPlural(e, 'серія', 'серії', 'серій'));

    if (!parts.length) return null;
    return { text: parts.join(' • '), ended: false };
  }

  function hookCards() {
    addStyleOnce();

    // Найбільш “живучий” спосіб — слухати події (у багатьох збірках є 'card')
    if (Lampa.Listener && Lampa.Listener.follow) {
      Lampa.Listener.follow('card', function (e) {
        if (!e || !e.card || !e.html) return;
        if (!isTv(e.card)) return;

        // індикатор життя
        setDot(e.html);

        // якщо вже є дані прямо в card — покажемо одразу
        if (e.card.number_of_seasons || e.card.number_of_episodes) {
          var quick = buildText(e.card);
          if (quick) setBadge(e.html, quick.text, quick.ended);
        }

        // підтягнути повні дані
        fetchTmdbFull(e.card, function (full) {
          var built = buildText(full);
          if (built) setBadge(e.html, built.text, built.ended);
        });
      });
      return true;
    }

    // fallback: якщо подій нема, пробуємо Maker (як у багатьох плагінах)
    try {
      var CardMaker = Lampa.Maker && Lampa.Maker.map && Lampa.Maker.map('Card');
      if (CardMaker && CardMaker.Card && CardMaker.Card.onVisible) {
        var orig = CardMaker.Card.onVisible;
        CardMaker.Card.onVisible = function () {
          orig.apply(this, arguments);
          var card = this.data || this.card || this;
          if (!isTv(card)) return;
          if (!this.html) return;

          setDot(this.html);

          fetchTmdbFull(card, function (full) {
            var built = buildText(full);
            if (built) setBadge(this.html, built.text, built.ended);
          }.bind(this));
        };
        return true;
      }
    } catch (e) {}

    return false;
  }

  function start() {
    if (window.__seinfo_started) return;
    window.__seinfo_started = true;

    var ok = hookCards();
    // якщо не підчепилось — хоча б один раз у консоль
    try { console.log('[seinfo] started, hook=' + ok); } catch (e) {}
  }

  if (window.appready) start();
  else if (window.Lampa && Lampa.Listener && Lampa.Listener.follow) {
    Lampa.Listener.follow('app', function (e) {
      if (e && e.type === 'ready') start();
    });
  } else {
    // останній шанс
    setTimeout(start, 1500);
  }
})();
