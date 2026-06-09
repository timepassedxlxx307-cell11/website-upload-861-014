(function () {
    var video = document.querySelector("[data-video-player]");
    var button = document.querySelector("[data-play-button]");
    var source = typeof VIDEO_SOURCE !== "undefined" ? VIDEO_SOURCE : "";
    var hls = null;
    var started = false;

    function hideButton() {
        if (button) {
            button.classList.add("is-hidden");
        }
    }

    function playVideo() {
        if (!video || !source) {
            return;
        }
        if (started) {
            var replay = video.play();
            if (replay && typeof replay.catch === "function") {
                replay.catch(function () {});
            }
            return;
        }
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                hideButton();
                var start = video.play();
                if (start && typeof start.catch === "function") {
                    start.catch(function () {
                        if (button) {
                            button.classList.remove("is-hidden");
                        }
                    });
                }
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                    hls = null;
                }
            });
        } else {
            video.src = source;
            hideButton();
            var nativeStart = video.play();
            if (nativeStart && typeof nativeStart.catch === "function") {
                nativeStart.catch(function () {
                    if (button) {
                        button.classList.remove("is-hidden");
                    }
                });
            }
        }
    }

    if (button) {
        button.addEventListener("click", playVideo);
    }
    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener("play", hideButton);
    }
    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
})();
