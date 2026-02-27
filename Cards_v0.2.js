(function () {
  'use strict';

  var ENDED_TEXT = 'Завершено';

  function banner() {
    if (window.__seinfo_banner) return;
    window.__seinfo_banner = true;

    var b = document.createElement('div');
    b.textContent = 'SEINFO LOADED';
    b.style.cssText =
      'position:fixed;left:12px;top:12px;z-index:999999;' +
      'background:rgba(255,210,0,.95);color:#000;' +
      'padding:6px 10px;border-radius:12px;font-weight:800;' +
      'font-size:14px;box-shadow:0 6px 18px rgba(0,0,0,.25);';
    document.body.appendChild(b);

    setTimeout(function () {
      if (b && b.parentNode) b.parentNode.removeChild(b);
    }, 2500);
  }

  function addStyleOnce() {
    if (window.__seinfo_style3) return;
    window.__seinfo_style3 = true;
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
      .card__seinfo_ended{ background:rgba(56,165,100,.78) !important; }
    `;
    document.head.appendChild(s);
  }

  function uaPlural(n, one, few, many) {
    n = Math.abs(Number(n)) || 0;
    var n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return one;
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few;
    return many;
  }

  function isTv(card) {
    if (!card) return false;
    return card.type === 'tv' || card.media_type === 'tv' || !!card.name;
  }

  function ensureBox(html) {
    var box =
      html.querySelector('.card__view') ||
      html.querySelector('.card__img') ||
      html.querySelector('.card__body') ||
      html;

    if (box && getComputedStyle(box).position === 'static') box.style.position = 'relative';
    return box;
  }

  function setBadge(html, text, ended) {
    if (!html) return;
    var box = ensureBox(html);
    if (!box) return;

    var old = box.querySelector('.card__seinfo_badge');
    if (old) old.remove();

    var b = document.createElement('div');
    b.className = 'card__seinfo_badge' + (ended ? ' card__seinfo_ended' : '');
    b.textContent = text;
    box.appendChild(b);
  }

  function buildFromCard(card) {
    var status = String(card.status || '').toLowerCase();
    if (status === 'ended') return { text: ENDED_TEXT, ended: true };

    var s = card.number_of_seasons;
    var e = card.number_of_episodes;

    var parts = [];
    if (s != null) parts.push(Number(s) + ' ' + uaPlural(s, 'сезон', 'сезони', 'сезонів'));
    if (e != null) parts.push(Number(e) + ' ' + uaPlural(e, 'серія', 'серії', 'серій'));

    if (parts.length) return { text: parts.join(' • '), ended: false };

    // якщо даних немає — хоча б покажемо “TV”, щоб бачити що хук працює
    return { text: 'TV', ended: false };
  }

  function apply(card, html) {
    if (!isTv(card)) return;
    var info = buildFromCard(card);
    if (info) setBadge(html, info.text, info.ended);
  }

  function hook() {
    addStyleOnce();

    // 1) якщо у твоїй збірці є події карток
    if (window.Lampa && Lampa.Listener && Lampa.Listener.follow) {
      Lampa.Listener.follow('card', function (e) {
        if (!e || !e.card || !e.html) return;
        apply(e.card, e.html);
      });
    }

    // 2) fallback через Maker (у багатьох збірках працює)
    try {
      var CardMaker = Lampa && Lampa.Maker && Lampa.Maker.map && Lampa.Maker.map('Card');
      if (CardMaker && CardMaker.Card && CardMaker.Card.onVisible) {
        var orig = CardMaker.Card.onVisible;
        CardMaker.Card.onVisible = function () {
          orig.apply(this, arguments);
          var card = this.data || this.card || this;
          if (this.html) apply(card, this.html);
        };
      }
    } catch (e) {}

    // 3) ще один fallback: періодично “підчіплюємось”, якщо Lampa пізно ініціалізується
    if (!window.__seinfo_tick) {
      window.__seinfo_tick = setInterval(function () {
        try {
          if (window.Lampa && Lampa.Maker && Lampa.Maker.map) {
            // просто щоб не спамити — якщо вже запрацювало, зупинимо
            clearInterval(window.__seinfo_tick);
          }
        } catch (e) {}
      }, 1000);
    }
  }

  function start() {
    if (window.__seinfo_started3) return;
    window.__seinfo_started3 = true;

    if (document.body) banner();
    else document.addEventListener('DOMContentLoaded', banner);

    // запускаємо одразу і ще раз після готовності
    hook();

    if (window.Lampa && Lampa.Listener && Lampa.Listener.follow) {
      Lampa.Listener.follow('app', function (e) {
        if (e && e.type === 'ready') hook();
      });
    }
  }

  // старт якнайраніше
  start();
})();
