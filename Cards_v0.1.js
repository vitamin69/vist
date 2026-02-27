(function () {
  'use strict';

  if (window.lampa_episodes_badge) return;
  window.lampa_episodes_badge = true;

  // ---------- settings ----------
  var SETTING_KEY = 'episodes_badge_enabled';
  var DEFAULT_ENABLED = true;

  // ---------- helpers ----------
  function enabled() {
    try {
      return (Lampa.Storage.get(SETTING_KEY, DEFAULT_ENABLED) !== false);
    } catch (e) {
      return true;
    }
  }

  function noty(txt) {
    try { Lampa.Noty.show(String(txt)); } catch (e) {}
  }

  function addSetting() {
    try {
      if (!Lampa.SettingsApi) return;
      Lampa.SettingsApi.addParam({
        component: 'interface',
        param: { name: SETTING_KEY, type: 'toggle', default: DEFAULT_ENABLED },
        field: { name: 'Бейдж серій (S/E) на картках' }
      });
    } catch (e) {}
  }

  // ---------- CSS ----------
  try {
    var style = document.createElement('style');
    style.textContent = [
      '.lampa-ep-badge{',
      ' position:absolute;',
      ' right:0.4em;',
      ' bottom:0.6em;',
      ' padding:0.25em 0.45em;',
      ' font-size:0.85em;',
      ' border-radius:0.35em;',
      ' background:#16c7ff;',
      ' color:#000;',
      ' z-index:5;',
      ' line-height:1.2;',
      '}',
      '.lampa-ep-badge[data-kind="end"]{ background:#ffa416; color:#000; }',
      '.lampa-ep-badge[data-kind="air"]{ background:#22ff16; color:#000; }',
      '.lampa-ep-badge[data-kind="wait"]{ background:#16c7ff; color:#000; }',
    ].join('\n');
    document.head.appendChild(style);
  } catch (e) {}

  // ---------- TMDB fetch + cache ----------
  var cache = Object.create(null); // id -> {status,lastSeason,lastEpisode,totalEpisodes}

  function tmdbTv(id, cb) {
    if (!id) return cb(null);
    if (cache[id]) return cb(cache[id]);

    try {
      var lang = 'ru';
      try { lang = Lampa.Storage.get('language', 'ru'); } catch (e) {}

      var url = 'tv/' + id + '?api_key=' + Lampa.TMDB.key() + '&language=' + lang;
      var req = new Lampa.Reguest();
      req.timeout(10000);

      req.silent(Lampa.TMDB.api(url), function (data) {
        try {
          var out = {
            status: (data && data.status ? String(data.status).toLowerCase() : ''),
            lastSeason: null,
            lastEpisode: null,
            totalEpisodes: null
          };

          // last season/episode
          if (data && data.last_episode_to_air && data.last_episode_to_air.season_number) {
            out.lastSeason = data.last_episode_to_air.season_number;

            var next = data.next_episode_to_air;
            var lastEp = data.last_episode_to_air.episode_number;

            // якщо next_episode_to_air вже в минулому — беремо його episode_number
            if (next && next.air_date) {
              var d = new Date(next.air_date);
              out.lastEpisode = (!isNaN(d.getTime()) && d <= new Date()) ? next.episode_number : lastEp;
            } else {
              out.lastEpisode = lastEp;
            }

            // total episodes for that season
            if (data.seasons && data.seasons.length) {
              for (var i = 0; i < data.seasons.length; i++) {
                if (data.seasons[i].season_number === out.lastSeason) {
                  out.totalEpisodes = data.seasons[i].episode_count || null;
                  break;
                }
              }
            }
          } else if (data && data.number_of_seasons) {
            out.lastSeason = data.number_of_seasons;
          }

          cache[id] = out;
          cb(out);
        } catch (e) {
          cb(null);
        }
      }, function () {
        cb(null);
      });
    } catch (e) {
      cb(null);
    }
  }

  // ---------- render badge ----------
  var processed = new WeakSet();

  function ensureBadge(containerEl) {
    if (!containerEl) return null;
    var b = containerEl.querySelector('.lampa-ep-badge');
    if (!b) {
      b = document.createElement('div');
      b.className = 'lampa-ep-badge';
      containerEl.appendChild(b);
    }
    return b;
  }

  function isTv(data, cardEl) {
    if (!data) data = {};
    if (data.type === 'tv') return true;
    if (data.number_of_seasons) return true;
    if (data.seasons) return true;
    try { if (cardEl && cardEl.classList && cardEl.classList.contains('card--tv')) return true; } catch (e) {}
    return false;
  }

  function kindFromStatus(st) {
    st = (st || '').toLowerCase();
    if (st === 'ended' || st === 'canceled' || st === 'cancelled') return 'end';
    if (st === 'returning series' || st === 'on the air' || st === 'on_the_air') return 'air';
    if (st === 'planned' || st === 'rumored' || st === 'post production' || st === 'in production' || st === 'in_production') return 'wait';
    return 'wait';
  }

  function textFromMeta(meta) {
    if (!meta) return '';
    if (meta.status && (meta.status === 'ended' || meta.status === 'canceled' || meta.status === 'cancelled')) return 'END';

    if (meta.lastSeason && meta.lastEpisode) {
      if (meta.totalEpisodes && meta.lastEpisode === meta.totalEpisodes) return 'END';
      if (meta.totalEpisodes) return 'S' + meta.lastSeason + ' E' + meta.lastEpisode + '/' + meta.totalEpisodes;
      return 'S' + meta.lastSeason + ' E' + meta.lastEpisode;
    }
    if (meta.lastSeason) return 'S' + meta.lastSeason;
    return '';
  }

  function applyToCard(cardEl, data) {
    try {
      if (!enabled()) return;
      if (!cardEl || !cardEl.querySelector) return;
      if (processed.has(cardEl)) return;
      processed.add(cardEl);

      var view = cardEl.querySelector('.card__view') || cardEl;
      if (!view) return;
      if (!isTv(data, cardEl)) return;

      var id = data && data.id;
      if (!id) return;

      var badge = ensureBadge(view);
      badge.textContent = '...';
      badge.setAttribute('data-kind', 'wait');

      tmdbTv(id, function (meta) {
        if (!meta) { badge.textContent = ''; return; }

        var txt = textFromMeta(meta);
        badge.textContent = txt;
        badge.setAttribute('data-kind', kindFromStatus(meta.status));

        // якщо нема що показувати — прибираємо
        if (!txt) badge.parentNode && badge.parentNode.removeChild(badge);
      });
    } catch (e) {}
  }

  // ---------- hooks ----------
  function hookCards() {
    // 1) найнадійніше — слухати подію card (у веб-версіях часто працює)
    try {
      Lampa.Listener.follow('card', function (e) {
        try {
          if (!e || !e.object) return;
          var obj = e.object;

          var el = obj.card || obj.element || obj;
          var data = obj.data || obj.card_data || (el && el.card_data) || {};

          if (el && el.querySelector) applyToCard(el, data);
        } catch (err) {}
      });
    } catch (e) {}

    // 2) додатково — пробіжка по вже видимим карткам
    setTimeout(function () {
      try {
        var cards = document.querySelectorAll('.card');
        for (var i = 0; i < cards.length; i++) {
          var el = cards[i];
          var data = el.card_data || {};
          applyToCard(el, data);
        }
      } catch (e) {}
    }, 2000);
  }

  function hookFull() {
    try {
      Lampa.Listener.follow('full', function (e) {
        if (!enabled()) return;
        if (!e || (e.type !== 'open' && e.type !== 'ready')) return;

        setTimeout(function () {
          try {
            var active = Lampa.Activity && Lampa.Activity.active && Lampa.Activity.active();
            if (!active || active.activity !== 'full') return;

            var data = active.data || {};
            if (!isTv(data)) return;
            if (!data.id) return;

            tmdbTv(data.id, function (meta) {
              try {
                var txt = textFromMeta(meta);
                if (!txt) return;

                var root = active.activity && active.activity.render && active.activity.render();
                if (!root || !root.querySelector) return;

                if (root.querySelector('.lampa-ep-badge-full')) return;

                var tags = root.querySelector('.full-start__tags');
                if (!tags) return;

                var d = document.createElement('div');
                d.className = 'full-start__tag lampa-ep-badge-full';
                d.innerHTML = '<img src="./img/icons/menu/movie.svg" /> <div>' + (Lampa.Lang ? Lampa.Lang.translate(txt) : txt) + '</div>';
                tags.appendChild(d);
              } catch (err) {}
            });
          } catch (err2) {}
        }, 100);
      });
    } catch (e) {}
  }

  function init() {
    addSetting();
    hookCards();
    hookFull();
    // noty('Episodes badge plugin: ON'); // можна увімкнути для тесту
  }

  // запуск з “страховкою”
  function startOnce() {
    if (window.lampa_episodes_badge_started) return;
    window.lampa_episodes_badge_started = true;
    init();
  }

  try {
    if (window.appready) startOnce();
    if (Lampa && Lampa.Listener && Lampa.Listener.follow) {
      Lampa.Listener.follow('appready', function (e) { if (e && e.type === 'ready') startOnce(); });
      Lampa.Listener.follow('ready', function () { startOnce(); });
    }
  } catch (e) {}

  setTimeout(startOnce, 1500);
})();
