(function () {
  function findStage(button) {
    if (!button) {
      return null;
    }

    var localStage = button.closest('.player-stage');

    if (localStage) {
      return localStage;
    }

    return document.querySelector('.player-stage');
  }

  function initVideo(video) {
    if (!video || video.getAttribute('data-ready') === '1') {
      return;
    }

    var stream = video.getAttribute('data-stream') || '';

    if (!stream) {
      return;
    }

    video.setAttribute('data-ready', '1');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(stream);
      hls.attachMedia(video);
      video.hlsPlayer = hls;
      return;
    }

    video.src = stream;
  }

  function playFromButton(button) {
    var stage = findStage(button);
    var video = stage ? stage.querySelector('video') : document.querySelector('video[data-stream]');

    if (!video) {
      return;
    }

    initVideo(video);

    var playResult = video.play();

    if (playResult && typeof playResult.then === 'function') {
      playResult.then(function () {
        if (stage) {
          stage.classList.add('is-playing');
        }
      }).catch(function () {
        if (button) {
          button.focus();
        }
      });
    } else if (stage) {
      stage.classList.add('is-playing');
    }
  }

  document.querySelectorAll('[data-play-button]').forEach(function (button) {
    button.addEventListener('click', function () {
      playFromButton(button);
    });
  });

  document.querySelectorAll('video[data-stream]').forEach(function (video) {
    video.addEventListener('play', function () {
      initVideo(video);
      var stage = video.closest('.player-stage');

      if (stage) {
        stage.classList.add('is-playing');
      }
    });
  });
})();
