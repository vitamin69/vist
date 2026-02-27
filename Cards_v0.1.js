try { Lampa.Noty.show('Cards_v0.1 loaded v=1'); } catch(e) {}
(function () {
  'use strict';

  if (window.lampa_episodes_badge_v1) return;
  window.lampa_episodes_badge_v1 = true;

  // ====== SETTINGS ======
  var SETTING_KEY = 'episodes_badge_enabled';
  var DEFAULT_ENABLED = true;

  function enabled() {
    try { return Lampa.Storage.get(SETTING_KEY, DEFAULT_ENABLED) !== false; }
    catch (e) { return true; }
  }

  function addSetting() {
    try {
      if (!Lampa.SettingsApi) return;
      Lampa.SettingsApi.addParam({
        component: 'interface',
        param: { name: SETTING_KEY, type: 'toggle', default: DEFAULT_ENABLED },
        field: { name: 'Бейдж серій (TV + S/E)' }
      });
    } catch (e) {}
  }

  // ====== CSS (TV top-left, S/E bottom-left) ======
  try {
    var style = document.createElement('style');
    style.textContent = [
      '.lampa-tv-badge{',
      ' position:absolute;',
      ' left:-0.8em;',
      ' top:3.8em;',
      ' padding:0.35em 0.45em;',
      ' font-size:0.85em;',
      ' border-radius:0.3em;',
      ' background:#16c7ff;',
      ' color:#000;',
      ' z-index:6;',
      ' line-height:1.1;',
      '}',
      '.lampa-se-badge{',
      ' position:absolute;',
      ' left:-0.8em;',
      ' bottom:0.6em;',
      ' padding:0.35em 0.45em;',
      ' font-size:0.85em;',
      ' border-radius:0.3em;',
      ' background:#16c7ff;',
      ' color:#000;',
      ' z-index:6;',
      ' line-height:1.1;',
      '}',
      '.lampa-se-badge[data-kind="end"]{ background:#ffa416; color:#000; }',
      '.lampa-se-badge[data-kind="air"]{ background:#22ff16; color:#000; }',
      '.lampa-se-badge[data-kind="wait"]{ background:#16c7ff; color:#000; }'
    ].join('\n');
    document.head.appendChild(style);
  } catch (e) {}

  // ====== TMDB CACHE + INFLIGHT ======
  var cache = Object.create(null);     // id -> meta
  var inflight = Object.create(null);  // id -> [callbacks]

  function normalizeStatus(s) {
    return (s || '').toString().toLowerCase();
  }

  function tmdbTv(id, cb) {
    if (!id) return cb(null);

    if (cache[id]) return cb(cache[id]);

    if (inflight[id]) {
      inflight[id].push(cb);
      return;
    }
    inflight[id] = [cb];

    try {
      var lang = 'ru';
      try { lang = Lampa.Storage.get('language', 'ru'); } catch (e) {}

      var url = 'tv/' + id + '?api_key=' + Lampa.TMDB.key() + '&language=' + lang;
      var req = new Lampa.Reguest();
      req.timeout(10000);

      req.silent(Lampa.TMDB.api(url), function (data) {
        var meta = null;
        try {
          meta = {
            status: normalizeStatus(data && data.status),
            lastSeason: null,
            lastEpisode: null,
            totalEpisodes: null
          };

          if (data && data.last_episode_to_air && data.last_episode_to_air.season_number) {
            meta.lastSeason = data.last_episode_to_air.season_number;

            var next = data.next_episode_to_air;
            var lastEp = data.last_episode_to_air.episode_number;

            if (next && next.air_date) {
              var d = new Date(next.air_date);
              meta.lastEpisode = (!isNaN(d.getTime()) && d <= new Date()) ? next.episode_number : lastEp;
            } else {
              meta.lastEpisode = lastEp;
            }

            if (data.seasons && data.seasons.length) {
              for (var i = 0; i < data.seasons.length; i++) {
                if (data.seasons[i].season_number === meta.lastSeason) {
                  meta.totalEpisodes = data.seasons[i].episode_count || null;
                  break;
                }
              }
            }
          } else if (data && data.number_of_seasons) {
            meta.lastSeason = data.number_of_seasons;
          }
        } catch (e) {
          meta = null;
        }

        if (meta) cache[id] = meta;
        var list = inflight[id] || [];
        delete inflight[id];
        for (var k = 0; k < list.length; k++) list[k](meta);
      }, function () {
        var list2 = inflight[id] || [];
        delete inflight[id];
        for (var k2 = 0; k2 < list2.length; k2++) list2[k2](null);
      });
    } catch (e) {
      var list3 = inflight[id] || [];
      delete inflight[id];
      for (var k3 = 0; k3 < list3.length; k3++) list3[k3](null);
    }
  }

  // ====== BADGE RENDER ======
  function isTv(data, cardEl) {
    if (!data) data = {};
    if (data.type === 'tv') return true;
    if (data.number_of_seasons) return true;
    if (data.seasons) return true;
    try { if (cardEl && cardEl.classList && cardEl.classList.contains('card--tv')) return true; } catch (e) {}
    return false;
  }

  function kindFromStatus(st) {
    st = normalizeStatus(st);
    if (st === 'ended' || st === 'canceled' || st === 'cancelled') return 'end';
    if (st === 'returning series' || st === 'on_the_air' || st === 'on the air') return 'air';
    return 'wait';
  }

  function textFromMeta(meta) {
    if (!meta) return '';
    if (meta.status === 'ended' || meta.status === 'canceled' || meta.status === 'cancelled') return 'END';

    if (meta.lastSeason && meta.lastEpisode) {
      if (meta.totalEpisodes && meta.lastEpisode === meta.totalEpisodes) return 'END';
      if (meta.totalEpisodes) return 'S ' + meta.lastSeason + ' / E ' + meta.lastEpisode + ' / ' + meta.totalEpisodes;
      return 'S ' + meta.lastSeason + ' / E ' + meta.lastEpisode;
    }
    if (meta.lastSeason) return 'S ' + meta.lastSeason;
    return '';
  }

  function ensureBadge(view, cls) {
    if (!view) return null;
    var el = view.querySelector('.' + cls);
    if (!el) {
      el = document.createElement('div');
      el.className = cls;
      view.appendChild(el);
    }
    return el;
  }

  function removeIfEmpty(el) {
    try {
      if (el && (!el.textContent || !el.textContent.trim()) && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    } catch (e) {}
  }

  // ВАЖЛИВО: НЕ “processed once”. Карти можуть перевикористовуватись при скролі.
  function decorateCard(cardEl, data) {
    try {
      if (!enabled()) return;
      if (!cardEl || !cardEl.querySelector) return;

      // у Lampa бейджі треба чіпляти до .card__view (якщо є)
      var view = cardEl.querySelector('.card__view') || cardEl;
      if (!view) return;

      if (!isTv(data, cardEl)) {
        // якщо це не TV — прибираємо наші бейджі, якщо лишились
        var oldTv = view.querySelector('.lampa-tv-badge');
        var oldSe = view.querySelector('.lampa-se-badge');
        if (oldTv && oldTv.parentNode) oldTv.parentNode.removeChild(oldTv);
        if (oldSe && oldSe.parentNode) oldSe.parentNode.removeChild(oldSe);
        return;
      }

      // TV badge (top-left)
      var tv = ensureBadge(view, 'lampa-tv-badge');
      tv.textContent = 'TV';

      // S/E badge (bottom-left)
      var se = ensureBadge(view, 'lampa-se-badge');
      se.textContent = '...';
      se.setAttribute('data-kind', 'wait');

      var id = data && data.id;
      if (!id) {
        se.textContent = '';
        removeIfEmpty(se);
        return;
      }

      tmdbTv(id, function (meta) {
        try {
          // карта могла вже змінитись на інший контент — перевіримо, що id той самий
          // (віртуальний список може перевикористати DOM)
          var currentData = cardEl.card_data || data || {};
          if (currentData && currentData.id && currentData.id !== id) return;

          var txt = textFromMeta(meta);
          se.textContent = txt;
          se.setAttribute('data-kind', kindFromStatus(meta && meta.status));

          if (!txt) removeIfEmpty(se);
        } catch (e) {}
      });
    } catch (e) {}
  }

  // ====== HOOKS (щоб не пропадало при скролі) ======
  function handleCardEvent(obj) {
    try {
      if (!obj) return;
      var el = obj.card || obj.element || obj;
      var data = obj.data || obj.card_data || (el && el.card_data) || {};
      if (el && el.querySelector) decorateCard(el, data);
    } catch (e) {}
  }

  function hookCardEvents() {
    try {
      if (Lampa.Listener && Lampa.Listener.follow) {
        // у різних збірках еvent.type може відрізнятись — не фільтруємо жорстко
        Lampa.Listener.follow('card', function (e) {
          try { if (e && e.object) handleCardEvent(e.object); } catch (err) {}
        });
      }
    } catch (e) {}
  }

  // MutationObserver: коли DOM підвантажує/перемальовує картки при скролі
  function hookMutations() {
    try {
      var obs = new MutationObserver(function (mutations) {
        if (!enabled()) return;

        for (var i = 0; i < mutations.length; i++) {
          var m = mutations[i];
          if (!m.addedNodes) continue;

          for (var j = 0; j < m.addedNodes.length; j++) {
            var node = m.addedNodes[j];
            if (!node || !node.querySelectorAll) continue;

            // нові .card
            var cards = node.matches && node.matches('.card') ? [node] : node.querySelectorAll('.card');
            if (!cards || !cards.length) continue;

            for (var k = 0; k < cards.length; k++) {
              var el = cards[k];
              var data = el.card_data || {};
              decorateCard(el, data);
            }
          }
        }
      });

      obs.observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }

  // Страховка: пробігтись по вже видимим карткам
  function initialScan() {
    try {
      var cards = document.querySelectorAll('.card');
      for (var i = 0; i < cards.length; i++) {
        var el = cards[i];
        decorateCard(el, el.card_data || {});
      }
    } catch (e) {}
  }




  // ===== FIX for virtual scroll (badges disappear) =====
(function(){
  // cache tmdb results (id -> meta)
  var __tmdb_cache = Object.create(null);
  var __tmdb_inflight = Object.create(null);

  function __norm(s){ return (s||'').toString().toLowerCase(); }

  function __tmdbTv(id, cb){
    if(!id) return cb(null);
    if(__tmdb_cache[id]) return cb(__tmdb_cache[id]);

    if(__tmdb_inflight[id]) { __tmdb_inflight[id].push(cb); return; }
    __tmdb_inflight[id] = [cb];

    try{
      var lang='ru';
      try{ lang = Lampa.Storage.get('language','ru'); }catch(e){}
      var url='tv/'+id+'?api_key='+Lampa.TMDB.key()+'&language='+lang;

      var r = new Lampa.Reguest();
      r.timeout(10000);
      r.silent(Lampa.TMDB.api(url), function(data){
        var meta=null;
        try{
          meta = { status: __norm(data && data.status), lastSeason:null, lastEpisode:null, totalEpisodes:null };

          if(data && data.last_episode_to_air && data.last_episode_to_air.season_number){
            meta.lastSeason = data.last_episode_to_air.season_number;

            var next = data.next_episode_to_air;
            var lastEp = data.last_episode_to_air.episode_number;
            if(next && next.air_date){
              var d = new Date(next.air_date);
              meta.lastEpisode = (!isNaN(d.getTime()) && d <= new Date()) ? next.episode_number : lastEp;
            } else meta.lastEpisode = lastEp;

            if(data.seasons && data.seasons.length){
              for(var i=0;i<data.seasons.length;i++){
                if(data.seasons[i].season_number === meta.lastSeason){
                  meta.totalEpisodes = data.seasons[i].episode_count || null;
                  break;
                }
              }
            }
          } else if(data && data.number_of_seasons){
            meta.lastSeason = data.number_of_seasons;
          }
        }catch(e){ meta=null; }

        if(meta) __tmdb_cache[id]=meta;
        var list=__tmdb_inflight[id]||[];
        delete __tmdb_inflight[id];
        for(var k=0;k<list.length;k++) list[k](meta);
      }, function(){
        var list2=__tmdb_inflight[id]||[];
        delete __tmdb_inflight[id];
        for(var k2=0;k2<list2.length;k2++) list2[k2](null);
      });
    }catch(e){
      var list3=__tmdb_inflight[id]||[];
      delete __tmdb_inflight[id];
      for(var k3=0;k3<list3.length;k3++) list3[k3](null);
    }
  }

  function __ensure(view, cls){
    var el = view.querySelector('.'+cls);
    if(!el){
      el=document.createElement('div');
      el.className=cls;
      view.appendChild(el);
    }
    return el;
  }

  function __kind(st){
    st=__norm(st);
    if(st==='ended'||st==='canceled'||st==='cancelled') return 'end';
    if(st==='returning series'||st==='on_the_air'||st==='on the air') return 'air';
    return 'wait';
  }

  function __text(meta){
    if(!meta) return '';
    if(meta.status==='ended'||meta.status==='canceled'||meta.status==='cancelled') return 'END';
    if(meta.lastSeason && meta.lastEpisode){
      if(meta.totalEpisodes && meta.lastEpisode===meta.totalEpisodes) return 'END';
      if(meta.totalEpisodes) return 'S '+meta.lastSeason+' / E '+meta.lastEpisode+' / '+meta.totalEpisodes;
      return 'S '+meta.lastSeason+' / E '+meta.lastEpisode;
    }
    if(meta.lastSeason) return 'S '+meta.lastSeason;
    return '';
  }

  function __isTv(data, cardEl){
    if(!data) data={};
    if(data.type==='tv') return true;
    if(data.number_of_seasons) return true;
    if(data.seasons) return true;
    try{ if(cardEl && cardEl.classList && cardEl.classList.contains('card--tv')) return true; }catch(e){}
    return false;
  }

  function __decorateCard(cardEl){
    try{
      if(!cardEl || !cardEl.querySelector) return;
      var data = cardEl.card_data || {};
      var view = cardEl.querySelector('.card__view') || cardEl;

      // Якщо не TV — прибрати S/E бейдж (щоб не “прилипав” при перевикористанні)
      if(!__isTv(data, cardEl)){
        var oldSE = view.querySelector('.lampa-se-badge');
        if(oldSE && oldSE.parentNode) oldSE.parentNode.removeChild(oldSE);
        return;
      }

      // S/E badge bottom-left (або твій клас — якщо інший, заміни тут)
      var se = __ensure(view, 'lampa-se-badge');

      var id = data.id;
      // важливо: запам’ятати id прямо на бейджі (вирішує “перевикористання DOM”)
      var prev = se.getAttribute('data-id');
      if(String(prev) !== String(id)){
        se.setAttribute('data-id', id ? String(id) : '');
        se.textContent = '...';
        se.setAttribute('data-kind','wait');
      }

      if(!id){ se.textContent=''; return; }

      __tmdbTv(id, function(meta){
        // якщо ця DOM-картка вже стала іншою — не чіпаємо
        var nowData = cardEl.card_data || {};
        if(nowData && nowData.id && String(nowData.id)!==String(id)) return;

        var txt = __text(meta);
        se.textContent = txt;
        se.setAttribute('data-kind', __kind(meta && meta.status));

        // якщо нічого — прибираємо
        if(!txt && se.parentNode) se.parentNode.removeChild(se);
      });
    }catch(e){}
  }

  // === ГОЛОВНЕ: регулярний скан + скан при скролі (вирішує “зникає”) ===
  var __scanTimer = null;
  function __scan(){
    try{
      var cards = document.querySelectorAll('.card');
      for(var i=0;i<cards.length;i++) __decorateCard(cards[i]);
    }catch(e){}
  }

  function __scheduleScan(){
    if(__scanTimer) return;
    __scanTimer = setTimeout(function(){
      __scanTimer = null;
      __scan();
    }, 250);
  }

  // скан одразу + періодично
  setTimeout(__scan, 1000);
  setTimeout(__scan, 2500);
  setInterval(__scan, 1500);

  // при скролі — швидке оновлення
  window.addEventListener('scroll', __scheduleScan, { passive: true });
})();

  // ====== INIT ======
  function init() {
    addSetting();
    hookCardEvents();
    hookMutations();

    setTimeout(initialScan, 1500);
    setTimeout(initialScan, 3500);
  }

  function startOnce() {
    if (window.lampa_episodes_badge_v1_started) return;
    window.lampa_episodes_badge_v1_started = true;
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
