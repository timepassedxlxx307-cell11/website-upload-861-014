(function () {
  var menuButton = document.querySelector('[data-mobile-menu-button]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('hidden');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var list = document.querySelector('[data-filter-list]');
    var input = panel.querySelector('[data-filter-input]');
    var category = panel.querySelector('[data-filter-category]');
    var year = panel.querySelector('[data-filter-year]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      if (!list) {
        return;
      }

      var queryValue = normalize(input ? input.value : '');
      var categoryValue = normalize(category ? category.value : '');
      var yearValue = normalize(year ? year.value : '');
      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.textContent
        ].join(' '));
        var matchQuery = !queryValue || haystack.indexOf(queryValue) !== -1;
        var matchCategory = !categoryValue || normalize(card.getAttribute('data-category')) === categoryValue;
        var matchYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;

        card.classList.toggle('is-hidden', !(matchQuery && matchCategory && matchYear));
      });
    }

    [input, category, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  });
})();
