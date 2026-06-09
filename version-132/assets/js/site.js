(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      var isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      mobileMenu.hidden = isOpen;
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
      dot.setAttribute('aria-selected', String(dotIndex === activeSlide));
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5600);
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]'));

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter(query, category) {
    var normalizedQuery = normalizeText(query);
    var normalizedCategory = normalizeText(category || 'all');
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalizeText(card.getAttribute('data-search'));
      var type = normalizeText(card.getAttribute('data-type'));
      var region = normalizeText(card.getAttribute('data-region'));
      var cardCategory = normalizeText(card.getAttribute('data-category'));
      var matchesText = !normalizedQuery || text.indexOf(normalizedQuery) !== -1;
      var matchesCategory = normalizedCategory === 'all' || type === normalizedCategory || region === normalizedCategory || cardCategory === normalizedCategory;
      var shouldShow = matchesText && matchesCategory;
      card.hidden = !shouldShow;
      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value : '';

      if (cards.length) {
        var activeFilter = document.querySelector('[data-filter-button].is-active');
        applyFilter(value, activeFilter ? activeFilter.getAttribute('data-filter-button') : 'all');
        var library = document.getElementById('library') || document.querySelector('[data-filter-scope]');
        if (library) {
          library.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        window.location.href = 'index.html?search=' + encodeURIComponent(value) + '#library';
      }
    });
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-filter-button') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      var scopedInput = document.querySelector('[data-local-search]');
      applyFilter(scopedInput ? scopedInput.value : '', value);
    });
  });

  document.querySelectorAll('[data-local-search]').forEach(function (input) {
    input.addEventListener('input', function () {
      var active = document.querySelector('[data-filter-button].is-active');
      applyFilter(input.value, active ? active.getAttribute('data-filter-button') : 'all');
    });
  });

  if (cards.length) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('search') || params.get('q') || '';
    if (query) {
      document.querySelectorAll('input[name="q"], [data-local-search]').forEach(function (input) {
        input.value = query;
      });
      applyFilter(query, 'all');
    }
  }

  document.querySelectorAll('.player-frame').forEach(function (frame) {
    var video = frame.querySelector('video');
    var overlay = frame.querySelector('.player-overlay');
    var stream = frame.getAttribute('data-stream');
    var initialized = false;

    function startPlayback() {
      if (!video || !stream) {
        return;
      }

      if (!initialized) {
        initialized = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      frame.classList.add('is-playing');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayback();
      });
    }

    frame.addEventListener('click', function (event) {
      if (event.target === video && video.paused) {
        startPlayback();
      }
    });
  });
})();
