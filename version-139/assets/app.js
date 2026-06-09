(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      slides[index].classList.remove("is-active");
      dots[index].classList.remove("is-active");
      index = next;
      slides[index].classList.add("is-active");
      dots[index].classList.add("is-active");
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show((index + 1) % slides.length);
    }, 5200);
  }

  function initLocalSearch() {
    var input = document.querySelector("[data-local-search]");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        card.classList.toggle("hidden-by-filter", q && text.indexOf(q) === -1);
      });
    });
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    if (!form || !input || !results || !window.SITE_MOVIES) {
      return;
    }
    function render(q) {
      input.value = q;
      if (!q) {
        results.innerHTML = '<p class="search-empty jelly-card content-card">输入片名、地区、类型、年份或标签，即可浏览匹配的影视内容。</p>';
        return;
      }
      var key = q.toLowerCase();
      var matched = window.SITE_MOVIES.filter(function (movie) {
        return movie.search.indexOf(key) !== -1;
      }).slice(0, 120);
      if (!matched.length) {
        results.innerHTML = '<p class="search-empty jelly-card content-card">暂未找到匹配内容，可以换一个关键词继续搜索。</p>';
        return;
      }
      results.innerHTML = matched.map(function (movie) {
        return '<article class="movie-card jelly-card">' +
          '<a class="poster-wrap" href="./' + escapeHtml(movie.file) + '">' +
          '<img src="./' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>' +
          '</a>' +
          '<div class="movie-card-body">' +
          '<div class="card-tags"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
          '<h3><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p class="movie-meta">' + escapeHtml(movie.genre) + '</p>' +
          '<p class="movie-desc">' + escapeHtml(movie.desc) + '</p>' +
          '</div>' +
          '</article>';
      }).join("");
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var q = input.value.trim();
      var url = q ? "./search.html?q=" + encodeURIComponent(q) : "./search.html";
      history.replaceState(null, "", url);
      render(q);
    });
    render(getQuery());
  }

  window.initMoviePlayer = function (videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !source) {
      return;
    }
    var started = false;
    var hls = null;
    function start() {
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      button.classList.add("is-hidden");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      video.controls = true;
      video.play().catch(function () {});
    }
    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initMobileNav();
    initHero();
    initLocalSearch();
    renderSearchPage();
  });
})();
