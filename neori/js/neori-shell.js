(function(){
  'use strict';

  var shell;
  var current = 'home';
  var focusables = [];
  var focusIndex = 0;
  var panel;

  function ready(){ return !!(window.Lampa && window.appready); }
  function el(tag, cls, text){
    var node = document.createElement(tag);
    if(cls) node.className = cls;
    if(text !== undefined) node.textContent = text;
    return node;
  }
  function clear(node){ while(node && node.firstChild) node.removeChild(node.firstChild); }
  function app(){ return document.getElementById('app'); }

  function showShell(){
    current = 'home';
    if(panel) panel.remove();
    panel = null;
    if(shell) shell.style.display = '';
    if(app()) app().classList.add('neori-hidden');
    document.body.classList.add('neori-mode');
    renderHome();
  }

  function showLampa(){
    if(!ready()) return;
    if(shell) shell.style.display = 'none';
    if(app()) app().classList.remove('neori-hidden');
    document.body.classList.remove('neori-mode');
  }

  function lampaCategory(type){
    if(!ready()) return;
    showLampa();
    Lampa.Router.call('category', {
      url:type,
      title:type === 'movie' ? 'Фильмы' : 'Сериалы',
      source: type === 'anime' ? 'cub' : Lampa.Storage.field('source')
    });
  }
  function lampaFavorite(type, title){
    if(!ready()) return;
    showLampa();
    Lampa.Activity.push({url:'',title:title,component:'favorite',type:type,page:1});
  }
  function lampaSearch(){
    if(!ready()) return;
    showLampa();
    Lampa.Controller.toggle('search');
  }
  function lampaSettings(){
    if(!ready()) return;
    showLampa();
    Lampa.Controller.toggle('settings');
  }
  function nativePlugins(){
    if(!ready() || !Lampa.Extensions) return;
    showLampa();
    Lampa.Extensions.show();
  }

  function route(action){
    if(action === 'home') showShell();
    else if(action === 'movies') lampaCategory('movie');
    else if(action === 'series') lampaCategory('tv');
    else if(action === 'collection') lampaFavorite('like','Избранное');
    else if(action === 'continue') lampaFavorite('continued','Продолжить просмотр');
    else if(action === 'history') lampaFavorite('history','История');
    else if(action === 'favorites') lampaFavorite('like','Избранное');
    else if(action === 'search') lampaSearch();
    else if(action === 'settings') lampaSettings();
    else if(action === 'native-plugins') nativePlugins();
    else if(action === 'plugins') openPlugins();
  }

  function button(label, action, cls){
    var b = el('button', 'neori-btn ' + (cls || ''), label);
    b.type = 'button';
    b.dataset.action = action;
    b.onclick = function(){ route(action); };
    return b;
  }

  function header(){
    var top = el('header','neori-top');
    var brand = el('button','neori-brand','');
    brand.type='button';
    brand.title='NEORI TV';
    brand.appendChild(el('span','neori-brand-word','NEORI'));
    brand.onclick=function(){route('home');};
    top.appendChild(brand);

    var nav=el('nav','neori-nav');
    nav.appendChild(button('Главная','home','active'));
    nav.appendChild(button('Фильмы','movies'));
    nav.appendChild(button('Сериалы','series'));
    nav.appendChild(button('Коллекция','collection'));
    nav.appendChild(button('Поиск','search'));
    top.appendChild(nav);

    var spacer=el('div','neori-top-spacer'); top.appendChild(spacer);
    top.appendChild(button('Плагины','plugins','neori-top-plugin'));
    return top;
  }

  function logo(){
    var wrap=el('div','neori-logo');
    var img=el('img');
    img.src='./neori/assets/logo.webp';
    img.alt='NEORI TV';
    img.draggable=false;
    wrap.appendChild(img);
    return wrap;
  }

  function playCard(card){
    if(!ready() || !card || !card.id) return;
    showLampa();
    Lampa.Activity.push({url:card.url || '',component:'full',id:card.id,method:card.name ? 'tv' : 'movie',card:card,source:card.source || Lampa.Storage.field('source') || 'tmdb'});
  }

  function openCard(card){
    if(!ready() || !card || !card.id) return;
    renderDetail(card);
  }

  function favoriteCards(){
    var out=[];
    try{
      var raw=Lampa.Storage.get('favorite',{});
      if(raw && typeof raw==='object'){
        ['continued','look','history'].forEach(function(key){
          var list=Array.isArray(raw[key]) ? raw[key] : [];
          list.forEach(function(item){
            var c=item && item.card ? item.card : item;
            if(c && c.id && !out.some(function(x){return String(x.id)===String(c.id);})) out.push(c);
          });
        });
      }
    }catch(e){}
    return out.slice(0,12);
  }

  function renderDetail(card){
    current='detail';
    if(panel) panel.remove();
    panel=el('section','neori-detail');
    var backdrop=el('div','neori-detail-backdrop');
    if(card.backdrop_path && Lampa.Api && Lampa.Api.img) backdrop.style.backgroundImage='url("'+Lampa.Api.img(card.backdrop_path,'w1280')+'")';
    panel.appendChild(backdrop);
    var body=el('div','neori-detail-body');
    var posterWrap=el('div','neori-detail-poster');
    var img=el('img'); img.src=poster(card); img.alt=cardTitle(card); posterWrap.appendChild(img); body.appendChild(posterWrap);
    var info=el('div','neori-detail-info');
    info.appendChild(el('div','neori-detail-kicker',card.name ? 'СЕРИАЛ' : 'ФИЛЬМ'));
    info.appendChild(el('h1','neori-detail-title',cardTitle(card)));
    var meta=[]; var y=cardYear(card); if(y) meta.push(y); if(card.vote_average) meta.push('★ '+Number(card.vote_average).toFixed(1)); if(card.runtime) meta.push(card.runtime+' мин');
    info.appendChild(el('div','neori-detail-meta',meta.join('  ·  ')));
    info.appendChild(el('p','neori-detail-overview',card.overview || 'Описание появится после загрузки полной информации.'));
    var actions=el('div','neori-detail-actions');
    actions.appendChild(button('Смотреть','detail-play','primary'));
    actions.appendChild(button('Назад','detail-back'));
    actions.querySelector('[data-action="detail-play"]').onclick=function(){playCard(card);};
    actions.querySelector('[data-action="detail-back"]').onclick=function(){showShell();};
    info.appendChild(actions); body.appendChild(info); panel.appendChild(body); shell.appendChild(panel); refreshFocus();
    if(Lampa.Api && Lampa.Api.full){
      try{ Lampa.Api.full({id:card.id,method:card.name ? 'tv' : 'movie',source:card.source || Lampa.Storage.field('source') || 'tmdb'},function(data){
        var full=data && (data.card || data);
        if(full && full.id){
          card=full;
          img.src=poster(card) || img.src;
          if(full.backdrop_path) backdrop.style.backgroundImage='url("'+Lampa.Api.img(full.backdrop_path,'w1280')+'")';
          var ov=panel.querySelector('.neori-detail-overview'); if(ov) ov.textContent=full.overview || ov.textContent;
        }
      },function(){}); }catch(e){}
    }
  }

  function poster(card){
    if(!card) return '';
    if(card.poster_path && Lampa.Api && Lampa.Api.img) return Lampa.Api.img(card.poster_path,'w500');
    return card.poster || card.poster_path || '';
  }

  function cardTitle(card){
    return card.title || card.name || card.original_title || card.original_name || 'Без названия';
  }

  function cardYear(card){
    return (card.release_date || card.first_air_date || '').slice(0,4);
  }

  function createMovieCard(card){
    var b=el('button','neori-movie-card','');
    b.type='button';
    var img=el('img');
    img.loading='lazy';
    img.alt=cardTitle(card);
    img.src=poster(card);
    img.onerror=function(){this.style.display='none';};
    b.appendChild(img);
    var shade=el('div','neori-card-shade');
    var title=el('div','neori-movie-title',cardTitle(card));
    shade.appendChild(title);
    var meta=[];
    var y=cardYear(card); if(y) meta.push(y);
    if(card.vote_average) meta.push(Number(card.vote_average).toFixed(1));
    shade.appendChild(el('div','neori-movie-meta',meta.join(' · ')));
    b.appendChild(shade);
    b.onclick=function(){openCard(card);};
    return b;
  }

  function createRow(data){
    if(!data || !data.results || !data.results.length) return null;
    var section=el('section','neori-content-row');
    var head=el('div','neori-row-head');
    head.appendChild(el('h2','neori-row-title',data.title || 'Каталог'));
    section.appendChild(head);
    var viewport=el('div','neori-row-viewport');
    var row=el('div','neori-card-row');
    data.results.slice(0,12).forEach(function(card){row.appendChild(createMovieCard(card));});
    viewport.appendChild(row);
    section.appendChild(viewport);
    return section;
  }

  function loadHomeRows(main){
    if(!ready() || !Lampa.Api || !Lampa.Api.main){
      main.appendChild(el('div','neori-loading','Каталог пока недоступен'));
      return;
    }
    var rows=0;
    var source=Lampa.Storage.field('source') || 'tmdb';
    Lampa.Api.main({source:source},function(data){
      if(!data || !data.results || !data.results.length) return;
      var row=createRow(data);
      if(row){var loader=main.querySelector('.neori-loading');if(loader)loader.remove();main.appendChild(row);rows++;refreshFocus();}
    },function(){
      if(!rows) main.appendChild(el('div','neori-empty','Не удалось загрузить каталог. Проверь источник Lampa и соединение.'));
    });
  }

  function renderHome(){
    if(!shell) return;
    clear(shell);
    shell.appendChild(header());
    var main=el('main','neori-main');
    var hero=el('section','neori-hero');
    hero.appendChild(logo());
    hero.appendChild(el('div','neori-kicker','NEORI TV'));
    hero.appendChild(el('h1','neori-title','Кино. Сериалы. Всё в одном TV-интерфейсе.'));
    hero.appendChild(el('p','neori-desc','Современный интерфейс для пульта. Каталог загружается напрямую через Lampa API, а Lampa остаётся совместимым ядром для плагинов и плеера.'));
    var actions=el('div','neori-actions');
    actions.appendChild(button('Фильмы','movies','primary'));
    actions.appendChild(button('Сериалы','series'));
    actions.appendChild(button('Продолжить','continue'));
    actions.appendChild(button('Поиск','search'));
    hero.appendChild(actions);
    main.appendChild(hero);

    var continueCards=favoriteCards();
    if(continueCards.length){
      var cont=el('section','neori-content-row');
      var ch=el('div','neori-row-head'); ch.appendChild(el('h2','neori-row-title','Продолжить просмотр')); cont.appendChild(ch);
      var cv=el('div','neori-row-viewport'), cr=el('div','neori-card-row');
      continueCards.forEach(function(c){cr.appendChild(createMovieCard(c));}); cv.appendChild(cr); cont.appendChild(cv); main.appendChild(cont);
    }

    var catalog=el('section','neori-catalog');
    catalog.appendChild(el('div','neori-section-title','Каталог'));
    catalog.appendChild(el('div','neori-loading','Загрузка подборок…'));
    main.appendChild(catalog);

    var foot=el('div','neori-footer');
    foot.appendChild(el('span','','← → навигация'));
    foot.appendChild(el('span','','Enter — открыть'));
    foot.appendChild(el('span','','Back — назад'));
    main.appendChild(foot);
    shell.appendChild(main);

    loadHomeRows(catalog);
    refreshFocus();
  }

  function openPanel(title){
    showShell();
    current='panel';
    panel=el('section','neori-panel');
    var head=el('div','neori-panel-head');
    head.appendChild(el('div','neori-panel-kicker','NEORI'));
    head.appendChild(el('h2','neori-panel-title',title));
    var back=button('Назад','home','neori-back');
    head.appendChild(back); panel.appendChild(head);
    shell.appendChild(panel);
    return panel;
  }

  function openPlugins(){
    if(!ready()) return;
    var p=openPanel('Плагины Lampa');
    var bar=el('div','neori-plugin-toolbar');
    var add=button('Добавить плагин','plugin-add','primary');
    add.onclick=function(){
      Lampa.Input.edit({title:'URL плагина Lampa',value:'',free:true,nosave:true},function(url){
        url=(url||'').trim();
        if(!/^https/.test(url) && !/^http/.test(url)) return Lampa.Noty.show('Некорректный адрес плагина');
        Lampa.Plugins.add({url:url,status:1,name:url});
        renderPluginList(p);
      });
    };
    bar.appendChild(add);
    var native=button('Открыть менеджер Lampa','native-plugins'); bar.appendChild(native);
    p.appendChild(bar);
    p.appendChild(el('div','neori-plugin-note','Установка сохраняется в Lampa. После добавления плагин загружается через штатный механизм Lampa.'));
    var list=el('div','neori-plugin-list'); list.id='neori-plugin-list'; p.appendChild(list);
    renderPluginList(p);
    refreshFocus();
  }

  function renderPluginList(p){
    var list=p.querySelector('#neori-plugin-list');
    if(!list) return;
    clear(list);
    var items=Lampa.Plugins.get ? Lampa.Plugins.get() : [];
    if(!items.length){
      list.appendChild(el('div','neori-empty','Установленных пользовательских плагинов пока нет.'));
      return;
    }
    items.forEach(function(item){
      var row=el('div','neori-plugin-item');
      var info=el('div','neori-plugin-info');
      info.appendChild(el('div','neori-plugin-name',item.name || 'Плагин Lampa'));
      info.appendChild(el('div','neori-plugin-url',item.url || ''));
      row.appendChild(info);
      var status=el('span','neori-plugin-status',item.status ? 'Включён':'Выключен'); row.appendChild(status);
      var toggle=button(item.status ? 'Выключить':'Включить','plugin-toggle','neori-small');
      toggle.onclick=function(){
        item.status=item.status ? 0 : 1;
        Lampa.Plugins.save(item);
        if(item.status) Lampa.Plugins.push(item);
        renderPluginList(p); refreshFocus();
      };
      row.appendChild(toggle);
      var remove=button('Удалить','plugin-remove','neori-small danger');
      remove.onclick=function(){ Lampa.Plugins.remove(item); renderPluginList(p); refreshFocus(); };
      row.appendChild(remove);
      list.appendChild(row);
    });
  }

  function refreshFocus(){
    if(!shell) return;
    focusables=Array.prototype.slice.call(shell.querySelectorAll('button')).filter(function(x){return x.offsetParent !== null;});
    if(!focusables.length) return;
    focusIndex=Math.max(0,Math.min(focusIndex,focusables.length-1));
    focusables.forEach(function(x){x.classList.remove('focused');});
    focusables[focusIndex].classList.add('focused');
    try{focusables[focusIndex].focus({preventScroll:true});}catch(e){focusables[focusIndex].focus();}
  }

  function move(dir){
    if(!focusables.length) return;
    if(dir==='right') focusIndex=(focusIndex+1)%focusables.length;
    if(dir==='left') focusIndex=(focusIndex-1+focusables.length)%focusables.length;
    refreshFocus();
  }

  function goBack(){
    if(current==='panel' || current==='detail'){showShell();return true;}
    if(current==='home' && ready()){
      var active=Lampa.Activity && Lampa.Activity.active ? Lampa.Activity.active() : null;
      if(active && active.component==='main') { Lampa.Activity.out(); showShell(); return true; }
    }
    return false;
  }

  function build(){
    if(document.getElementById('neori-shell')) return;
    shell=el('div',''); shell.id='neori-shell';
    document.body.appendChild(shell);
    showShell();
    document.addEventListener('keydown',function(e){
      if(!shell || shell.style.display==='none'){
        if((e.key==='Escape'||e.key==='Backspace') && ready()){
          var active=Lampa.Activity && Lampa.Activity.active ? Lampa.Activity.active() : null;
          if(active && active.component==='main') { Lampa.Activity.out(); showShell(); e.preventDefault(); }
        }
        return;
      }
      if(e.key==='ArrowRight'){move('right');e.preventDefault();}
      else if(e.key==='ArrowLeft'){move('left');e.preventDefault();}
      else if(e.key==='ArrowDown'){move('right');e.preventDefault();}
      else if(e.key==='ArrowUp'){move('left');e.preventDefault();}
      else if(e.key==='Enter'){var a=focusables[focusIndex];if(a)a.click();e.preventDefault();}
      else if(e.key==='Escape'||e.key==='Backspace'){if(goBack())e.preventDefault();}
    },true);
  }

  function boot(){
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build); else build();
    var timer=setInterval(function(){
      if(ready()){
        clearInterval(timer);
        if(current==='home') renderHome();
      }
    },250);
    setTimeout(function(){clearInterval(timer);},30000);
  }
  boot();
})();