(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var links = document.querySelector(".nav-links");
        if (toggle && links) {
            toggle.addEventListener("click", function () {
                var open = links.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var current = 0;
        var timer = null;

        function activate(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            if (slides.length > 1) {
                timer = window.setInterval(function () {
                    activate(current + 1);
                }, 5000);
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                activate(i);
                restart();
            });
        });
        restart();

        var input = document.querySelector(".js-filter-input");
        var typeFilter = document.querySelector(".js-type-filter");
        var yearFilter = document.querySelector(".js-year-filter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilter() {
            var query = normalize(input ? input.value : "");
            var typeValue = typeFilter ? typeFilter.value : "";
            var yearValue = yearFilter ? yearFilter.value : "";
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var type = card.getAttribute("data-type") || "";
                var year = card.getAttribute("data-year") || "";
                var matched = (!query || text.indexOf(query) !== -1) && (!typeValue || type === typeValue) && (!yearValue || year === yearValue);
                card.classList.toggle("is-filter-hidden", !matched);
            });
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q) {
                input.value = q;
            }
            input.addEventListener("input", applyFilter);
        }
        if (typeFilter) {
            typeFilter.addEventListener("change", applyFilter);
        }
        if (yearFilter) {
            yearFilter.addEventListener("change", applyFilter);
        }
        applyFilter();
    });
})();
