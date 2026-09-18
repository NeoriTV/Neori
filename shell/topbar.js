(function () {
  'use strict';

  if (window.NeoriTopbar) return;

  var state = {
    element: null,
    open: false,
    items: []
  };

  function createTopbar() {
    var root = document.createElement('div');
    root.className = 'neori-topbar';
    root.setAttribute('aria-hidden', 'true');

    var inner = document.createElement('div');
    inner.className = 'neori-topbar__inner';

    var brand = document.createElement('div');
    brand.className = 'neori-topbar__brand';
    brand.innerHTML = '<img src="./shell/neori-tv.jpg.jpeg" alt="NEORi TV" /><span>NEORi TV</span>';

    var nav = document.createElement('div');
    nav.className = 'neori-topbar__nav';

    var actions = [
      ['home', 'Главная'],
      ['feed', 'Лента'],
      ['movie', 'Фильмы'],
      ['cartoon', 'Мультфильмы'],
      ['tv', 'Сериалы'],
      ['myperson', 'Персоны'],
      ['catalog', 'Каталог'],
      ['filter', 'Фильтр'],
      ['relise', 'Релизы'],
      ['anime', 'Аниме'],
      ['favorite', 'Избранное'],
      ['history', 'История']
    ];

    actions.forEach(function (item) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'neori-topbar__item';
      button.setAttribute('data-neori-action', item[0]);
      button.textContent = item[1];
      nav.appendChild(button);
    });

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'neori-topbar__close';
    close.textContent = '×';
    close.setAttribute('aria-label', 'Закрыть');

    inner.appendChild(brand);
    inner.appendChild(nav);
    inner.appendChild(close);
    root.appendChild(inner);

    document.body.appendChild(root);

    root.addEventListener('click', function (e) {
      var button = e.target.closest('[data-neori-action]');
      if (!button) {
        if (e.target === close) hide();
        return;
      }

      var action = button.getAttribute('data-neori-action');
      var menu = document.querySelector('.menu__item[data-action="' + action + '"]');

      if (menu) {
        menu.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        hide();
      }
    });

    state.element = root;
    return root;
  }

  function show() {
    if (!state.element) createTopbar();
    state.open = true;
    state.element.classList.add('is-visible');
    state.element.setAttribute('aria-hidden', 'false');
  }

  function hide() {
    if (!state.element) return;
    state.open = false;
    state.element.classList.remove('is-visible');
    state.element.setAttribute('aria-hidden', 'true');
  }

  function toggle() {
    if (state.open) hide();
    else show();
  }

  function bind() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Home') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape') hide();
    });

    document.addEventListener('click', function (e) {
      var menuIcon = e.target.closest('.head__menu-icon');
      if (menuIcon) toggle();
    });
  }

  function init() {
    if (!document.body) {
      setTimeout(init, 50);
      return;
    }

    createTopbar();
    bind();
  }

  window.NeoriTopbar = {
    show: show,
    hide: hide,
    toggle: toggle
  };

  init();
})();
