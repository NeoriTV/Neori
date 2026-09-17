(function () {
    'use strict';

    // NEORI visual layer only. Lampa core/data/navigation logic is untouched.
    function findHome() {
        var direct = document.querySelector('.home');
        if (direct) return direct;

        var line = document.querySelector('.items-line');
        if (!line) return null;

        var node = line.parentElement;
        while (node && node !== document.body) {
            if (node.querySelectorAll && node.querySelectorAll('.items-line').length >= 2) return node;
            node = node.parentElement;
        }
        return null;
    }

    function textOfLine(line) {
        var title = line.querySelector('.items-line__title, .items-line__head, h2');
        return title ? (title.textContent || '').trim().toLowerCase() : '';
    }

    function markSections(home) {
        var lines = home.querySelectorAll('.items-line');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var text = textOfLine(line);
            line.classList.add('neori-prisma-line');

            if (i === 0 || /продолж|смотр|watch|истори/.test(text)) line.classList.add('neori-watch-next');
            if (i === 1 || /тренд|популяр|рейтинг|trend|popular/.test(text)) line.classList.add('neori-featured');
        }
    }

    function apply() {
        document.documentElement.classList.add('neori-ui');
        if (document.body) document.body.classList.add('neori-ui-body');

        var home = findHome();
        if (!home) return false;

        home.classList.add('neori-home', 'neori-prisma');
        markSections(home);
        return true;
    }

    function boot() {
        apply();
        var target = document.body || document.documentElement;
        if (target && window.MutationObserver) {
            new MutationObserver(function () { apply(); }).observe(target, { childList: true, subtree: true });
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
