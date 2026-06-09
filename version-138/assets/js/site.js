(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var searchInput = document.getElementById('movieSearch');
  var regionFilter = document.getElementById('regionFilter');
  var yearFilter = document.getElementById('yearFilter');
  var categoryFilter = document.getElementById('categoryFilter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-item'));

  function valueOf(control) {
    return control ? control.value.trim().toLowerCase() : '';
  }

  function filterCards() {
    var query = valueOf(searchInput);
    var region = valueOf(regionFilter);
    var year = valueOf(yearFilter);
    var category = valueOf(categoryFilter);

    cards.forEach(function (card) {
      var haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.category
      ].join(' ').toLowerCase();
      var regionOk = !region || String(card.dataset.region || '').toLowerCase() === region;
      var yearOk = !year || String(card.dataset.year || '').toLowerCase() === year;
      var categoryOk = !category || String(card.dataset.category || '').toLowerCase() === category;
      var queryOk = !query || haystack.indexOf(query) !== -1;
      card.classList.toggle('is-hidden', !(regionOk && yearOk && categoryOk && queryOk));
    });
  }

  [searchInput, regionFilter, yearFilter, categoryFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', filterCards);
      control.addEventListener('change', filterCards);
    }
  });

  function initializePlayer(shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var stream = shell.getAttribute('data-stream');
    var started = false;

    function playVideo() {
      if (!video || !stream) {
        return;
      }

      if (!started) {
        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      shell.classList.add('is-playing');
      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!started || video.paused) {
          playVideo();
        }
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(initializePlayer);
})();
