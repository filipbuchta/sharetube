
var YoutubeVideo = (function() {
    function YoutubeVideo(title, videoId, thumbnailUrl, userId) {
        this.title = title;
        this.videoId = videoId;
        this.thumbnailUrl = thumbnailUrl;
        this.userId = userId;
    }

    return YoutubeVideo;
})();
