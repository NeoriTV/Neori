(function () {
    'use strict';

    if (window.PrismPlayerUI) return;
    window.PrismPlayerUI = true;

    var ROOT_ID = 'prism-player-ui';
    var STYLE_ID = 'prism-player-ui-style';
    var timer = null;
    var video = null;

    function css() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent =
            '#' + ROOT_ID + '{position:fixed;inset:0;z-index:999999;pointer-events:none;color:#fff;font-family:Arial,sans-serif;opacity:0;transition:opacity .2s ease}' +
            '#' + ROOT_ID + '.show{opacity:1}' +
            '#' + ROOT_ID + ' .pp-top{position:absolute;top:4%;left:5%;right:5%;display:flex;justify-content:center;align-items:flex-start}' +
            '#' + ROOT_ID + ' .pp-title{text-align:center;font-size:22px;font-weight:700;text-shadow:0 2px 8px #000}' +
            '#' + ROOT_ID + ' .pp-subtitle{font-size:14px;font-weight:500;margin-top:5px}' +
            '#' + ROOT_ID + ' .pp-info{position:absolute;right:5%;top:3%;background:rgba(10,15,25,.78);border-radius:14px;padding:12px 16px;font-size:13px;line-height:1.8;min-width:180px}' +
            '#' + ROOT_ID + ' .pp-info b{float:right;margin-left:18px}' +
            '#' + ROOT_ID + ' .pp-next{position:absolute;right:5%;bottom:24%;display:flex;align-items:center;gap:12px;background:rgba(12,17,28,.88);border-radius:16px;padding:8px 12px;min-width:310px}' +
            '#' + ROOT_ID + ' .pp-next img{width:90px;height:52px;object-fit:cover;border-radius:9px;background:#222}' +
            '#' + ROOT_ID + ' .pp-next small{display:block;color:#72e7d9;font-weight:700;font-size:11px;margin-bottom:4px}' +
            '#' + ROOT_ID + ' .pp-next strong{font-size:15px}' +
            '#' + ROOT_ID + ' .pp-next button{margin-left:auto}' +
            '#' + ROOT_ID + ' .pp-bottom{position:absolute;left:5%;right:5%;bottom:4%;background:rgba(8,14,25,.84);border-radius:17px;padding:15px 22px 17px;box-sizing:border-box}' +
            '#' + ROOT_ID + ' .pp-times{display:flex;justify-content:space-between;font-size:14px;font-weight:600;margin-bottom:7px}' +
            '#' + ROOT_ID + ' .pp-progress{height:5px;background:rgba(255,255,255,.55);border-radius:5px;cursor:pointer}' +
            '#' + ROOT_ID + ' .pp-fill{height:100%;width:0;background:#70eee1;border-radius:5px}' +
            '#' + ROOT_ID + ' .pp-controls{display:flex;align-items:center;justify-content:center;gap:18px;margin-top:9px}' +
            '#' + ROOT_ID + ' button{border:0;color:#fff;background:rgba(255,255,255,.12);border-radius:50%;width:44px;height:44px;font-size:17px;cursor:pointer}' +
            '#' + ROOT_ID + ' .pp-play{width:62px;height:62px;background:#fff;color:#101827;font-size:25px}' +
            '#' + ROOT_ID + ' .pp-left{position:absolute;left:0;bottom:0}' +
            '#' + ROOT_ID + ' .pp-right{position:absolute;right:0;bottom:0;display:flex;gap:9px}' +
            '#' + ROOT_ID + ' .pp-pill{width:auto;padding:0 17px;border-radius:24px;font-weight:700}' +
            '@media(max-width:700px){' +
            '#' + ROOT_ID + ' .pp-info{display:none}' +
            '#' + ROOT_ID + ' .pp-next{right:4%;bottom:24%;min-width:230px}' +
            '#' + ROOT_ID + ' .pp-next img{width:65px;height:40px}' +
            '#' + ROOT_ID + ' .pp-bottom{left:3%;right:3%;bottom:3%;padding:12px}' +
            '#' + ROOT_ID + ' .pp-title{font-size:17px}' +
            '#' + ROOT_ID + ' .pp-right .pp-pill{display:none}' +
            '}';

        document.head.appendChild(style);
    }

    function time(v) {
        v = Math.max(0, Math.floor(v || 0));
        var h = Math.floor(v / 3600);
        var m = Math.floor((v % 3600) / 60);
        var s = v % 60;
        return (h ? h + ':' : '') +
            String(m).padStart(2, '0') + ':' +
            String(s).padStart(2, '0');
    }

    function show() {
        var root = document.getElementById(ROOT_ID);
        if (!root) return;
        root.classList.add('show');
        clearTimeout(timer);
        timer = setTimeout(function () {
            root.classList.remove('show');
        }, 4000);
    }

    function remove() {
        var root = document.getElementById(ROOT_ID);
        if (root) root.remove();
        clearTimeout(timer);
        timer = null;
        video = null;
    }

    function create(v) {
        remove();
        video = v;
        css();

        var root = document.createElement('div');
        root.id = ROOT_ID;
        root.innerHTML =
            '<div class="pp-top">' +
                '<div class="pp-title">Воспроизведение<div class="pp-subtitle">Сезон • Серия</div></div>' +
            '</div>' +
            '<div class="pp-info">' +
                '<div>Конец <b class="pp-end">--:--</b></div>' +
                '<div>Разрешение <b class="pp-resolution">AUTO</b></div>' +
                '<div>Играет <b class="pp-track">Авто</b></div>' +
            '</div>' +
            '<div class="pp-next">' +
                '<img alt="Следующая серия">' +
                '<div><small>СЛЕДУЮЩАЯ СЕРИЯ</small><strong>Следующая серия</strong></div>' +
                '<button class="pp-next-btn" title="Следующая серия">▶</button>' +
            '</div>' +
            '<div class="pp-bottom">' +
                '<div class="pp-times"><span class="pp-current">00:00</span><span class="pp-left-time">00:00 - Осталось 00 м.</span></div>' +
                '<div class="pp-progress"><div class="pp-fill"></div></div>' +
                '<div class="pp-controls">' +
                    '<button class="pp-prev" title="Назад">⏮</button>' +
                    '<button class="pp-play" title="Пауза">❚❚</button>' +
                    '<button class="pp-forward" title="Вперёд">⏭</button>' +
                '</div>' +
                '<div class="pp-left"><button class="pp-menu" title="Меню">☷</button></div>' +
                '<div class="pp-right">' +
                    '<button class="pp-pill pp-auto">AUTO</button>' +
                    '<button class="pp-audio" title="Аудио">◉</button>' +
                    '<button class="pp-settings" title="Настройки">⚙</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(root);

        var play = root.querySelector('.pp-play');
        var fill = root.querySelector('.pp-fill');
        var current = root.querySelector('.pp-current');
        var left = root.querySelector('.pp-left-time');
        var end = root.querySelector('.pp-end');
        var progress = root.querySelector('.pp-progress');

        function update() {
            if (!video) return;
            var duration = video.duration || 0;
            var now = video.currentTime || 0;
            var remain = Math.max(0, duration - now);
            var percent = duration ? now / duration * 100 : 0;

            fill.style.width = percent + '%';
            current.textContent = time(now);
            left.textContent = time(now) + ' - Осталось ' + Math.ceil(remain / 60) + ' м.';
            play.textContent = video.paused ? '▶' : '❚❚';

            var d = new Date(Date.now() + remain * 1000);
            end.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');

            if (video.videoWidth && video.videoHeight) {
                root.querySelector('.pp-resolution').textContent = video.videoWidth + 'x' + video.videoHeight;
            }
        }

        play.onclick = function () {
            if (video.paused) video.play();
            else video.pause();
            show();
        };

        root.querySelector('.pp-prev').onclick = function () {
            video.currentTime = Math.max(0, video.currentTime - 10);
            show();
        };

        root.querySelector('.pp-forward').onclick = function () {
            video.currentTime = Math.min(video.duration || Infinity, video.currentTime + 10);
            show();
        };

        progress.onclick = function (e) {
            var r = progress.getBoundingClientRect();
            var p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
            if (video.duration) video.currentTime = video.duration * p;
            show();
        };

        root.querySelector('.pp-settings').onclick = function () {
            if (window.Lampa && Lampa.Noty) Lampa.Noty.show('Настройки плеера: подключение к меню Lampa будет добавлено после теста.');
            show();
        };

        root.querySelector('.pp-audio').onclick = function () {
            if (window.Lampa && Lampa.Noty) Lampa.Noty.show('Выбор озвучки: подключение к источнику зависит от используемого плагина.');
            show();
        };

        root.querySelector('.pp-auto').onclick = function () {
            if (window.Lampa && Lampa.Noty) Lampa.Noty.show('AUTO');
            show();
        };

        root.querySelector('.pp-menu').onclick = function () {
            show();
        };

        video.addEventListener('timeupdate', update);
        video.addEventListener('loadedmetadata', update);
        video.addEventListener('play', update);
        video.addEventListener('pause', update);
        video.addEventListener('mousemove', show);
        video.addEventListener('touchstart', show);

        document.addEventListener('keydown', function (e) {
            if (!video) return;
            if (e.key === 'ArrowLeft') {
                video.currentTime = Math.max(0, video.currentTime - 10);
                show();
            } else if (e.key === 'ArrowRight') {
                video.currentTime = Math.min(video.duration || Infinity, video.currentTime + 10);
                show();
            } else if (e.key === 'Enter' || e.key === ' ') {
                if (video.paused) video.play();
                else video.pause();
                show();
            }
        });

        update();
        show();
    }

    function scan() {
        var videos = document.querySelectorAll('video');
        var current = videos.length ? videos[videos.length - 1] : null;

        if (current && current !== video) create(current);
        if (!current && video) remove();
    }

    css();
    setInterval(scan, 700);
    scan();

    console.log('[Prisma Player UI] loaded');
})();