(function () {
    function initPlayer(source) {
        var video = document.querySelector('.movie-video');
        var overlay = document.querySelector('.player-overlay');

        if (!video || !overlay || !source) {
            return;
        }

        var attached = false;
        var hlsInstance = null;

        function attachStream() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function startPlay() {
            attachStream();
            overlay.classList.add('is-hidden');
            video.setAttribute('controls', 'controls');

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    video.setAttribute('controls', 'controls');
                });
            }
        }

        overlay.addEventListener('click', startPlay);
        video.addEventListener('click', function () {
            if (!attached) {
                startPlay();
            }
        });
        video.addEventListener('ended', function () {
            if (hlsInstance && typeof hlsInstance.stopLoad === 'function') {
                hlsInstance.stopLoad();
            }
        });
    }

    window.initPlayer = initPlayer;
})();
