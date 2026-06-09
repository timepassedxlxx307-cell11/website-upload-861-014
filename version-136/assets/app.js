(function () {
  function each(selector, callback) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), callback);
  }

  function initNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = hero.querySelectorAll('.hero-slide');
    var dots = hero.querySelectorAll('.hero-dot');
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      each('.hero-slide', function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      each('.hero-dot', function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(index);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  function initLocalFilters() {
    each('[data-local-filter]', function (panel) {
      var textInput = panel.querySelector('[data-filter-text]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var reset = panel.querySelector('[data-filter-reset]');
      var cards = document.querySelectorAll('.filter-targets .movie-card');

      function apply() {
        var text = textInput.value.trim().toLowerCase();
        var year = yearSelect.value;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year')
          ].join(' ').toLowerCase();
          var matchText = !text || haystack.indexOf(text) !== -1;
          var matchYear = !year || card.getAttribute('data-year') === year;
          card.classList.toggle('is-hidden-card', !(matchText && matchYear));
        });
      }

      textInput.addEventListener('input', apply);
      yearSelect.addEventListener('change', apply);
      reset.addEventListener('click', function () {
        textInput.value = '';
        yearSelect.value = '';
        apply();
      });
    });
  }

  function cardTemplate(movie) {
    return [
      '<article class="movie-card poster-card">',
      '<a href="./' + movie.url + '" class="card-link" aria-label="观看' + escapeHtml(movie.title) + '">',
      '<span class="poster-frame">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="cover-shade"></span>',
      '<span class="play-hover">▶</span>',
      '<span class="year-pill">' + escapeHtml(movie.year) + '</span>',
      '</span>',
      '<span class="card-body">',
      '<strong>' + escapeHtml(movie.title) + '</strong>',
      '<span class="card-desc">' + escapeHtml(movie.oneLine) + '</span>',
      '<span class="card-meta"><em>' + escapeHtml(movie.type) + '</em><em>' + escapeHtml(movie.genre) + '</em><em>' + escapeHtml(movie.region) + '</em></span>',
      '</span>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function initGlobalSearch() {
    var root = document.querySelector('[data-global-search]');
    if (!root || !window.MOVIE_INDEX) {
      return;
    }
    var input = document.getElementById('globalSearch');
    var category = document.getElementById('globalCategory');
    var year = document.getElementById('globalYear');
    var reset = document.getElementById('globalReset');
    var results = document.getElementById('searchResults');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    input.value = initial;

    function render() {
      var text = input.value.trim().toLowerCase();
      var cat = category.value;
      var selectedYear = year.value;
      var filtered = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = [movie.title, movie.genre, movie.region, movie.type, movie.tags, movie.year, movie.oneLine].join(' ').toLowerCase();
        var matchText = !text || haystack.indexOf(text) !== -1;
        var matchCat = !cat || movie.category === cat;
        var matchYear = !selectedYear || movie.year === selectedYear;
        return matchText && matchCat && matchYear;
      }).slice(0, 120);

      results.innerHTML = filtered.map(cardTemplate).join('');
    }

    input.addEventListener('input', render);
    category.addEventListener('change', render);
    year.addEventListener('change', render);
    reset.addEventListener('click', function () {
      input.value = '';
      category.value = '';
      year.value = '';
      render();
    });
    render();
  }

  function initBackTop() {
    var button = document.querySelector('.back-top');
    if (!button) {
      return;
    }
    window.addEventListener('scroll', function () {
      button.classList.toggle('is-visible', window.scrollY > 500);
    });
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  window.initMoviePlayer = function (videoId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var attached = false;
    var hlsInstance = null;

    if (!video || !overlay || !streamUrl) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      attach();
      overlay.classList.add('is-hidden');
      overlay.setAttribute('hidden', 'hidden');
      video.play().catch(function () {});
    }

    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initLocalFilters();
    initGlobalSearch();
    initBackTop();
  });
})();
