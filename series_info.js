(function () {
    'use strict';

    function startPlugin() {
        // Додаємо стилі для нашої мітки
        var style = `
            <style>
                .card__type-label {
                    position: absolute;
                    top: 0.5em;
                    left: 0.5em;
                    background: rgba(0, 0, 0, 0.75);
                    color: #fff;
                    padding: 0.2em 0.5em;
                    border-radius: 0.3em;
                    font-size: 0.7em;
                    font-weight: bold;
                    z-index: 10;
                    text-transform: uppercase;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    pointer-events: none;
                }
                .label--movie { background: #2ecc71; } /* Зелений для фільмів */
                .label--tv { background: #3498db; }    /* Синій для серіалів */
                .label--anime { background: #e67e22; } /* Помаранчевий для аніме */
            </style>
        `;
        $('body').append(style);

        // Слідкуємо за створенням карток
        Lampa.Listener.follow('card', function (e) {
            if (e.type == 'create') {
                var typeText = 'Фільм';
                var typeClass = 'label--movie';

                if (e.data.method === 'tv' || e.data.type === 'tv') {
                    typeText = 'Серіал';
                    typeClass = 'label--tv';
                }

                // Перевірка на аніме/мультфільми (Жанр 16 у TMDB)
                if (e.data.genre_ids && e.data.genre_ids.includes(16)) {
                    typeText = 'Аніме/М/ф';
                    typeClass = 'label--anime';
                }

                // Створюємо елемент мітки
                var label = $('<div class="card__type-label ' + typeClass + '">' + typeText + '</div>');

                // Додаємо його в контейнер картки
                e.element.find('.card__view').append(label);
            }
        });
    }

    // Запуск, коли Lampa готова
    if (window.appready) startPlugin();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') startPlugin();
        });
    }
})();
