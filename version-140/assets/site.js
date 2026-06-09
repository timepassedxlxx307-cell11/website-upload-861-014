(function () {
    var header = document.querySelector('.site-header');
    var menu = document.querySelector('.menu-toggle');

    if (menu && header) {
        menu.addEventListener('click', function () {
            header.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var index = parseInt(dot.getAttribute('data-slide'), 10);
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('.filter-search'));

    function applyFilter(value) {
        var keyword = String(value || '').trim().toLowerCase();
        var cards = Array.prototype.slice.call(document.querySelectorAll('.filterable-list .movie-card'));

        cards.forEach(function (card) {
            var text = card.textContent.toLowerCase() + ' ' + Object.keys(card.dataset).map(function (key) {
                return card.dataset[key];
            }).join(' ').toLowerCase();
            card.classList.toggle('is-filtered-out', keyword && text.indexOf(keyword) === -1);
        });
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    filterInputs.forEach(function (input) {
        if (query) {
            input.value = query;
        }

        input.addEventListener('input', function () {
            applyFilter(input.value);
        });
    });

    if (query) {
        applyFilter(query);
    }
})();
