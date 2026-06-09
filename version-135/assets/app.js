(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide-dot]'));
      if (!slides.length) {
        return;
      }
      var index = Math.max(0, slides.findIndex(function (slide) {
        return slide.classList.contains('is-active');
      }));
      function show(next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
        });
      });
      setInterval(function () {
        show(index + 1);
      }, 5200);
    });

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
      var root = document.querySelector(panel.getAttribute('data-filter-panel')) || document;
      var input = panel.querySelector('[data-filter-input]');
      var year = panel.querySelector('[data-filter-year]');
      var type = panel.querySelector('[data-filter-type]');
      var empty = document.querySelector('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (input && query) {
        input.value = query;
      }
      function apply() {
        var term = input ? input.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        var typeValue = type ? type.value : '';
        var visible = 0;
        root.querySelectorAll('[data-filter-item]').forEach(function (item) {
          var haystack = [
            item.getAttribute('data-title'),
            item.getAttribute('data-region'),
            item.getAttribute('data-type'),
            item.getAttribute('data-year'),
            item.getAttribute('data-genre'),
            item.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var matchTerm = !term || haystack.indexOf(term) !== -1;
          var matchYear = !yearValue || item.getAttribute('data-year') === yearValue;
          var matchType = !typeValue || item.getAttribute('data-type') === typeValue;
          var match = matchTerm && matchYear && matchType;
          item.style.display = match ? '' : 'none';
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }
      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('[data-player-cover]');
      var button = player.querySelector('[data-play-button]');
      var url = player.getAttribute('data-m3u8');
      var loaded = false;
      var hlsInstance = null;
      function attach() {
        if (!video || !url || loaded) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        } else {
          video.src = url;
        }
        loaded = true;
      }
      function start() {
        attach();
        if (!video) {
          return;
        }
        player.classList.add('is-playing');
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener('click', start);
      }
      if (cover) {
        cover.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!loaded || video.paused) {
            start();
          } else {
            video.pause();
          }
        });
        video.addEventListener('ended', function () {
          player.classList.remove('is-playing');
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
