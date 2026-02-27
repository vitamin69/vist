(function () {
  'use strict';

  // Не стартуємо двічі
  if (window.serial_status_plugin_fixed) return;
  window.serial_status_plugin_fixed = true;

  // ---------- CSS ----------
  try {
    var style = document.createElement('style');
    style.textContent = [
      '.card__type, .card__status {',
      '  position: absolute;',
      '  left: -0.8em;',
      '  top: 3.8em;',
      '  padding: 0.4em 0.4em;',
      '  font-size: 0.85em;',
      '  border-radius: 0.3em;',
      '  color: #000;',
      '  background: #16c7ff;',
      '}',
      '.card__status { top: 5.9em; color: #fff; }',
      '.card__status[data-status="end"] { background: #ffa416; }',
      '.card__status[data-status="wait"] { background: #16c7ff; color:#000; }',
      '.card__status[data-status="on_the_air"] { background: #22ff16; color:#000; }',
      '.card__status[data-status="planned"] { background: #16c7ff; color:#000; }',
    ].join('\n');
    document.head.appendChild(style);
  } catch (e) {}

  // ---------- Utils ----------
  var processed = new WeakSet();
  var cache = Object.create(null); // tmdb_id -> data

  function safeNoty(text) {
    try { Lampa && Lampa.Noty && Lampa.Noty.show(String(text)); } catch (e) {}
  }

  function isEnabled() {
    try {
      // якщо SettingsApi недоступний — вважаємо увімкненим
      if (!Lampa || !Lampa.Storage) return true;
      // назва налаштування така ж як у твоєму скрипті
      return Lampa.Storage.get('season_and_seria', true) !== false;
    } catch (e) {
      return true;
    }
  }

  function addSettingsToggle() {
    try {
      if (!Lampa || !Lampa.SettingsApi) return;
      Lampa.SettingsApi.addParam({
        component: 'interface',
        param: { name: 'season_and_seria', type: 'toggle', default: true },
        field: { name: 'Отображение состояния сериала (сезон/серия)' },
        onRender: function () {
          // щоб пункт красиво став після cover (як у твоєму)
          setTimeout(function () {
            try {
              var el = document.querySelector('div[data-name="season_and_seria"]');
              var after = document.querySelector('div[data-name="card_interfice_cover"]');
              if (el && after && after.parentNode) after.parentNode.insertBefore(el, after.nextSibling);
            } catch (e) {}
          }, 0);
        }
      });
    } catch (e) {}
  }

  function isTvCard(card_data, card_el) {
    if (!card_data) card_data = {};
    if (card_data.type === 'tv') return true;
    if (card_data.number_of_seasons) return true;
    if (card_data.tv) return true;
    try {
      if (card_el && card_el.classList && card_el.classList.contains('card--tv')) return true;
    } catch (e) {}
    return false;
  }

  function clearOldBadges(viewEl) {
    try {
      var olds = viewEl.querySelectorAll('.card__type, .card__status');
      for (var i = 0; i < olds.length; i++) olds[i].parentNode.removeChild(olds[i]);
    } catch (e) {}
  }

  function addBadge(viewEl, cls, text, status) {
    var d = document.createElement('div');
    d.className = cls;
    d.textContent = text;
    if (status) d.setAttribute('data-status', status);
    viewEl.appendChild(d);
  }

  function normalizeStatus(s) {
    return (s || '').toString().toLowerCase();
  }

  function buildStatusText(status, meta) {
    // meta: { lastSeason, lastEpisode, totalEpisodes, nextAirDate, nextEpisodeNumber }
    status = normalizeStatus(status);

    if (!status) return null;

    // базові мапи
    if (status === 'released') return { text: 'Выпущенный', tag: 'planned' };
    if (status === 'ended' || status === 'canceled' || status === 'cancelled') return { text: 'Отменён', tag: 'end' };
    if (status === 'in_production') return { text: 'В производстве', tag: 'on_the_air' };
    if (status === 'post_production') return { text: 'Скоро', tag: 'planned' };
    if (status === 'planned') return { text: 'Запланирован', tag: 'planned' };
    if (status === 'rumored' || status === 'rumour') return { text: 'По слухам', tag: 'planned' };
    if (status === 'on_the_air') return { text: 'В эфире', tag: 'on_the_air' };

    // “returning series” — найцікавіше: S/E або завершено
    if (status === 'returning series' || status === 'returning_series' || status === 'returning') {
      if (meta && meta.lastSeason && meta.lastEpisode) {
        // якщо знаємо totalEpisodes і дійшли до кінця сезону — “Завершён”
        if (meta.totalEpisodes && meta.lastEpisode === meta.totalEpisodes) {
          return { text: 'Завершён', tag: 'end' };
        }
        if (meta.totalEpisodes) {
          return { text: 'S ' + meta.lastSeason + ' / E ' + meta.lastEpisode + ' из ' + meta.totalEpisodes, tag: 'on_the_air' };
        }
        return { text: 'S ' + meta.lastSeason + ' / E ' + meta.lastEpisode, tag: 'on_the_air' };
      }
      if (meta && meta.lastSeason) return { text: 'Сезон ' + meta.lastSeason, tag: 'on_the_air' };
      return { text: 'В эфире', tag: 'on_the_air' };
    }

    // якщо TMDB дає щось нове — просто показуємо як є
    return { text: status, tag: 'planned' };
  }

  function tmdbGetTv(id, cb) {
    if (!id) return cb(null);
    if (cache[id]) return cb(cache[id]);

    try {
      var lang = 'ru';
      try { if (Lampa && Lampa.Storage) lang = Lampa.Storage.get('language', 'ru'); } catch (e) {}

      var url = 'tv/' + id + '?api_key=' + Lampa.TMDB.key() + '&language=' + lang;
      var req = new Lampa.Reguest();
      req.timeout(10000);

      req.silent(Lampa.TMDB.api(url), function (data) {
        try {
          var out = {
            status: normalizeStatus(data && data.status),
            lastSeason: null,
            lastEpisode: null,
            totalEpisodes: null
          };

          // Визначаємо останній сезон/епізод
          if (data && data.last_episode_to_air && data.last_episode_to_air.season_number) {
            out.lastSeason = data.last_episode_to_air.season_number;

            // якщо next_episode_to_air вже "в минулому" — беремо його номер, інакше last_episode_to_air
            var next = data.next_episode_to_air;
            var lastEp = data.last_episode_to_air.episode_number;

            if (next && next.air_date) {
              var nextDate = new Date(next.air_date);
              if (!isNaN(nextDate.getTime()) && nextDate <= new Date()) {
                out.lastEpisode = next.episode_number;
              } else {
                out.lastEpisode = lastEp;
              }
            } else {
              out.lastEpisode = lastEp;
            }

            // total episodes у сезоні — беремо з seasons[]
            if (data.seasons && data.seasons.length) {
              for (var i = 0; i < data.seasons.length; i++) {
                if (data.seasons[i].season_number === out.lastSeason) {
                  out.totalEpisodes = data.seasons[i].episode_count || null;
                  break;
                }
              }
            }
          } else if (data && data.number_of_seasons) {
            // fallback: знаємо тільки кількість сезонів
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

  function applyToCard(card) {
    try {
      if (!isEnabled()) return;

      var cardEl = card && (card.card || card.element || card.render || card);
      var data = card && (card.data || card.card_data || cardEl && cardEl.card_data) || {};

      if (!cardEl || !cardEl.querySelector) return;
      if (processed.has(cardEl)) return;

      var viewEl = cardEl.querySelector('.card__view');
      if (!viewEl) return;

      if (!isTvCard(data, cardEl)) return;

      processed.add(cardEl);

      clearOldBadges(viewEl);
      addBadge(viewEl, 'card__type', 'TV');

      var status = normalizeStatus(data.status || (data.movie && data.movie.status));
      if (status) {
        var st = buildStatusText(status, data);
        if (st) addBadge(viewEl, 'card__status', st.text, st.tag);
        return;
      }

      // Якщо немає status у даних — тягнемо з TMDB по id
      if (data.id) {
        tmdbGetTv(data.id, function (meta) {
          try {
            clearOldBadges(viewEl);
            addBadge(viewEl, 'card__type', 'TV');
            if (!meta) return;

            var st2 = buildStatusText(meta.status, meta);
            if (st2) addBadge(viewEl, 'card__status', st2.text, st2.tag);
          } catch (e) {}
        });
      }
    } catch (e) {}
  }

  function applyToFull() {
    try {
      if (!isEnabled()) return;
      if (!Lampa || !Lampa.Activity || !Lampa.Activity.active) return;

      var active = Lampa.Activity.active();
      if (!active || active.activity !== 'full') return;

      var data = active.data;
      if (!data) return;

      // тільки серіали
      if (!(data.source === 'tmdb' && (data.type === 'tv' || data.number_of_seasons || data.seasons))) return;

      // будуємо текст для тега
      tmdbGetTv(data.id, function (meta) {
        try {
          if (!meta) return;
          if (meta.status !== 'returning series' && meta.status !== 'returning_series' && meta.status !== 'returning') return;

          var txt = null;
          if (meta.lastSeason && meta.lastEpisode && meta.totalEpisodes) {
            if (meta.lastEpisode === meta.totalEpisodes) txt = 'Завершён';
            else txt = 'Сезон: ' + meta.lastSeason + ' / Серия: ' + meta.lastEpisode + ' / ' + meta.totalEpisodes;
          } else if (meta.lastSeason && meta.lastEpisode) {
            txt = 'Сезон: ' + meta.lastSeason + ' / Серия: ' + meta.lastEpisode;
          } else if (meta.lastSeason) {
            txt = 'Сезон ' + meta.lastSeason;
          }

          if (!txt) return;

          // не дублюємо
          var root = active.activity && active.activity.render && active.activity.render();
          if (!root || !root.querySelector) return;
          if (root.querySelector('.card--new_seria')) return;

          var tagHtml = '<div class="full-start__tag card--new_seria"><img src="./img/icons/menu/movie.svg" /> <div>' +
            (Lampa.Lang ? Lampa.Lang.translate(txt) : txt) +
            '</div></div>';

          var tags = root.querySelector('.full-start__tags');
          if (tags) tags.insertAdjacentHTML('beforeend', tagHtml);
          else {
            var details = root.querySelector('.full-start-new__details');
            if (details) details.insertAdjacentHTML('beforeend',
              '<span class="full-start-new__split">●</span><div class="card--new_seria"><div> ' +
              (Lampa.Lang ? Lampa.Lang.translate(txt) : txt) +
              '</div></div>'
            );
          }
        } catch (e) {}
      });
    } catch (e) {}
  }

  // ---------- Hook into Lampa ----------
  function hookCardOnVisible() {
    try {
      var ext = Lampa.Extensions && Lampa.Extensions.get && Lampa.Extensions.get('card');
      if (ext && ext.Card && ext.Card.onVisible) {
        var old = ext.Card.onVisible;
        ext.Card.onVisible = function () {
          try { old.apply(this, arguments); } catch (e) {}
          try { applyToCard({ data: this.data, card: this.card }); } catch (e) {}
        };
      } else {
        // fallback: слухаємо події "card"
        if (Lampa.Listener && Lampa.Listener.follow) {
          Lampa.Listener.follow('card', function (e) {
            try {
              if (e && e.object && (e.type === 'build' || e.type === 'card')) {
                applyToCard(e.object);
              }
            } catch (err) {}
          });
        }
      }
    } catch (e) {}
  }

  function hookFull() {
    try {
      if (!Lampa.Listener || !Lampa.Listener.follow) return;
      Lampa.Listener.follow('full', function (e) {
        // коли відкрили сторінку повного опису
        if (e && e.type === 'open') setTimeout(applyToFull, 50);
        if (e && e.type === 'ready') setTimeout(applyToFull, 50);
      });
    } catch (e) {}
  }

  function init() {
    try {
      addSettingsToggle();
      hookCardOnVisible();
      hookFull();

      // додатковий “страхувальний” прогін по вже видимих картках (інколи корисно у вебі)
      setTimeout(function () {
        try {
          var cards = document.querySelectorAll('.card');
          for (var i = 0; i < cards.length; i++) applyToCard({ card: cards[i], data: cards[i].card_data || {} });
        } catch (e) {}
      }, 2000);

    } catch (e) {
      safeNoty('serial_status_plugin: init error');
    }
  }

  // Запуск максимально надійно (бо в web-версіях події інколи плавають)
  function startOnce() {
    if (window.serial_status_plugin_fixed_started) return;
    window.serial_status_plugin_fixed_started = true;
    init();
  }

  // 1) спроба через події
  try {
    if (window.appready) startOnce();
    if (Lampa && Lampa.Listener && Lampa.Listener.follow) {
      Lampa.Listener.follow('appready', function (e) { if (e && e.type === 'ready') startOnce(); });
      Lampa.Listener.follow('ready', function () { startOnce(); });
    }
  } catch (e) {}

  // 2) і страховка таймером
  setTimeout(startOnce, 1500);
})();
