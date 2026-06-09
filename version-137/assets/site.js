(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var links = document.querySelector("[data-nav-links]");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        hero.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
        });
        hero.addEventListener("mouseleave", start);
        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupCardFilter() {
        var input = document.querySelector("[data-filter-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var empty = document.querySelector("[data-empty-state]");
        if (!input || !cards.length) {
            return;
        }
        function apply() {
            var keyword = normalize(input.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region")
                ].join(" "));
                var matched = !keyword || haystack.indexOf(keyword) !== -1;
                card.classList.toggle("hidden-card", !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }
        input.addEventListener("input", apply);
        apply();
    }

    function setupSearchPage() {
        var box = document.querySelector("[data-search-box]");
        var results = document.querySelector("[data-search-results]");
        var dataNode = document.getElementById("search-data");
        var button = document.querySelector(".search-panel .search-button");
        if (!box || !results || !dataNode) {
            return;
        }
        var data = [];
        try {
            data = JSON.parse(dataNode.textContent || "[]");
        } catch (error) {
            data = [];
        }

        function render(items) {
            if (!items.length) {
                results.innerHTML = '<div class="empty-state">没有找到匹配的影片，请尝试更换关键词。</div>';
                return;
            }
            results.innerHTML = items.slice(0, 80).map(function (item) {
                return [
                    '<article class="result-card">',
                    '    <a href="' + item.url + '"><img src="' + item.cover + '" alt="' + item.title + '"></a>',
                    '    <div>',
                    '        <h2><a href="' + item.url + '">' + item.title + '</a></h2>',
                    '        <p>' + item.desc + '</p>',
                    '        <div class="result-meta">',
                    '            <span>' + item.year + '</span>',
                    '            <span>' + item.region + '</span>',
                    '            <span>' + item.type + '</span>',
                    '            <span>' + item.genre + '</span>',
                    '        </div>',
                    '    </div>',
                    '</article>'
                ].join('');
            }).join('');
        }

        function run() {
            var keyword = normalize(box.value);
            if (!keyword) {
                render(data.slice(0, 24));
                return;
            }
            var matched = data.filter(function (item) {
                return normalize(item.title + ' ' + item.desc + ' ' + item.tags + ' ' + item.genre + ' ' + item.region + ' ' + item.year).indexOf(keyword) !== -1;
            });
            render(matched);
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
            box.value = q;
        }
        box.addEventListener("input", run);
        if (button) {
            button.addEventListener("click", run);
        }
        run();
    }

    function setupPlayer() {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }
        var video = player.querySelector("video");
        var layer = player.querySelector("[data-player-layer]");
        var button = player.querySelector("[data-play]");
        var source = button ? button.getAttribute("data-src") : "";
        var hlsInstance = null;
        if (!video || !button || !source) {
            return;
        }

        function playVideo() {
            layer.classList.add("is-hidden");
            video.setAttribute("controls", "controls");
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", function () {
                    video.play().catch(function () {});
                }, { once: true });
            } else {
                video.src = source;
                video.play().catch(function () {});
            }
        }

        button.addEventListener("click", playVideo);
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupCardFilter();
        setupSearchPage();
        setupPlayer();
    });
})();
