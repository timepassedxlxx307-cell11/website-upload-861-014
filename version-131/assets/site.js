(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showHero(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showHero(dotIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showHero(current + 1);
      }, 5600);
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');

  if (filterInput) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    filterInput.addEventListener('input', function () {
      var keyword = filterInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
        card.style.display = text.indexOf(keyword) === -1 ? 'none' : '';
      });
    });
  }

  function movieCard(item) {
    return [
      '<a class="movie-card compact-card" href="./' + item.file + '">',
      '  <div class="poster-wrap">',
      '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="poster-badge">' + escapeHtml(item.year) + '</span>',
      '  </div>',
      '  <div class="movie-info">',
      '    <h3>' + escapeHtml(item.title) + '</h3>',
      '    <p>' + escapeHtml(item.description) + '</p>',
      '    <div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
      '  </div>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var searchResults = document.getElementById('search-results');

  if (searchResults && Array.isArray(window.MOVIE_INDEX)) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var searchBox = document.querySelector('[data-search-box]');
    var searchTitle = document.querySelector('[data-search-title]');
    var searchNote = document.querySelector('[data-search-note]');

    if (searchBox) {
      searchBox.value = query;
    }

    if (query) {
      var lower = query.toLowerCase();
      var matches = window.MOVIE_INDEX.filter(function (item) {
        return item.search.indexOf(lower) !== -1;
      });
      searchResults.innerHTML = matches.slice(0, 160).map(movieCard).join('') || '<div class="no-results">没有找到匹配内容，请尝试更换关键词。</div>';

      if (searchTitle) {
        searchTitle.textContent = '搜索结果';
      }

      if (searchNote) {
        searchNote.textContent = '关键词：' + query;
      }
    }
  }

  function preparePlayer(player) {
    if (player.getAttribute('data-ready') === '1') {
      return;
    }

    var video = player.querySelector('video');
    var address = video ? video.getAttribute('data-video') : '';

    if (!video || !address) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = address;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(address);
      hls.attachMedia(video);
      player.hls = hls;
    } else {
      video.src = address;
    }

    player.setAttribute('data-ready', '1');
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-overlay');

    function start() {
      preparePlayer(player);

      if (button) {
        button.classList.add('is-hidden');
      }

      if (video) {
        var attempt = video.play();

        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            if (button) {
              button.classList.remove('is-hidden');
            }
          });
        }
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('play', function () {
        preparePlayer(player);

        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }
  });
}());
