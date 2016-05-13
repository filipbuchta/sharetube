
var hash = window.location.hash.replace('#', '');
if (!hash.length) {
    location.href = location.href + '#' + ((Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-'));
    location.reload();
}


var site;

$(document).ready(function () {

    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    $('textarea, input').focus();


    site = new SiteModel();

    ko.applyBindings(site);


});


function googleApiClientReady() {
    console.log("Google Api loaded");
    gapi.client.load('youtube', 'v3', onYouTubeApiLoad);
}

function onYouTubeApiLoad() {
    console.log("Youtube Api loaded");
    gapi.client.setApiKey('AIzaSyBvN7ZHMcxzNuth6THjMQL5dOaH0v4N5zo');
}

function onYouTubePlayerAPIReady() {
    console.log("Youtube player ready");

    site.player = new YT.Player('player', {
        playerVars: {
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            modestbranding: 1,
            rel: 0,
            cc_load_policy: 0,
            iv_load_policy: 3,
            showinfo: 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });




}

function initNetwork() {

    var channelId = location.hash.substr(1);


    site.channel = new DataChannel(channelId || 'auto-session-establishment', {
        firebase: 'webrtc'
    });

    site.channel.onmessage = function(data, userId, latency) {
        console.log(userId, 'posted', data, 'latency:', latency, 'ms');

        var command = JSON.parse(data);
        command.userId = userId;

        site.processCommand(command);
    };

    site.channel.onopen = function(userId, channel) {

        var command = new Command(Command.CHANGE_NICK);
        command.newNick = "" + userId;
        site.doCommand(command);

        var command = new Command(Command.CHAT);
        command.content = "Hello I am " + userId;
        site.broadcastCommand(command)
    };


    /* users presence detection */
    site.channel.onleave = function(userid) {
        var message = 'A user whose id is ' + userid + ' left you!';
        // appendDIV(message, userid);
        console.warn(message);
    };

}


function onPlayerReady(evt) {

    initNetwork();

    var step = function (timestamp) {
        site.currentTime(site.player.getCurrentTime());
        requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
}

function onPlayerStateChange(evt) {

    if (evt.data == YT.PlayerState.ENDED) {
        var command = new Command(Command.REMOVE_VIDEO);
        command.videoId = site.currentVideo.videoId;
        site.processCommand(command);
    }

console.log("evt", evt);
    site.isPlaying(evt.data == YT.PlayerState.PLAYING);

    if (evt.data == YT.PlayerState.PLAYING) {
        site.duration(site.player.getDuration());
    }

}

function stopVideo() {
    site.player.stopVideo();
}

