(function () {
  'use strict';

  var ENDED_TEXT = 'Завершено';

  function addStyleOnce() {
    if (window.__seinfo_style_local) return;
    window.__seinfo_style_local = true;
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

  function isTv(card) {
    if (!card) return false;
    return card.type === 'tv' || card.media_type === 'tv' || !!card.name;
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

  function setBadge(html, text, ended) {
    var box = ensureBox(html);
    var old = box.querySelector('.card__seinfo_badge');
    if (old) old.remove();

    var b = document.createElement('div');
    b.className = 'card__seinfo_badge' + (ended ? ' card__seinfo_ended' : '');
    b.textContent = text;
    box.appendChild(b);
  }

  function getInfoFromCard(card) {
    // 1) статус
    var status = String(card.status || '').toLowerCase();
    var ended = status === 'ended' || status === 'canceled' || status === 'cancelled';

    // 2) сезони/серії (якщо вже є)
    var s = card.number_of_seasons;
    var e = card.number_of_episodes;

    // 3) інколи у TV є last_episode_to_air і немає next_episode_to_air — це часто означає, що серіал закінчено,
    // але це не 100%, тому використовуємо як “м’яку” ознаку тільки якщо статус пустий.
    if (!card.status && card.last_episode_to_air && !card.next_episode_to_air) {
      // якщо ще й є last_air_date і він давній — краще, але лишимо просто як натяк
      ended = false; // НЕ будемо вгадувати “Ended” без status, щоб не брехати
    }

    if (ended) return { text: ENDED_TEXT, ended: true };

    var parts = [];
    if (s != null) parts.push(Number(s) + ' ' + uaPlural(s, 'сезон', 'сезони', 'сезонів'));
    if (e != null) parts.push(Number(e) + ' ' + uaPlural(e, 'серія', 'серії', 'серій'));

    if (!parts.length) return null;
    return { text: parts.join(' • '), ended: false };
  }

  function start() {
    if (window.__seinfo_local_started) return;
    window.__seinfo_local_started = true;

    addStyleOnce();

    if (Lampa.Listener && Lampa.Listener.follow) {
      Lampa.Listener.follow('card', function (ev) {
        if (!ev || !ev.card || !ev.html) return;
        if (!isTv(ev.card)) return;

        var info = getInfoFromCard(ev.card);
        if (info) setBadge(ev.html, info.text, info.ended);
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
