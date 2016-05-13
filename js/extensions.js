


ko.extenders.youtubePlaylist = function(target, option) {
    target.subscribe(function(changes) {

        var playlist = target();

        if (playlist.length > 0) {
            if (site.currentVideo != playlist[0]) {
                site.currentVideo = playlist[0];

                site.player.loadVideoById(site.currentVideo.videoId);
                site.player.playVideo();
            }
        }

        //if (playlist)

//        console.log("change", playlist, changes, option);
    }, null, "arrayChange");
    return target;
};



ko.extenders.scrollFollow = function (target, selector) {
    target.subscribe(function (newval) {
        var el = document.querySelector(selector);

        // the scroll bar is all the way down, so we know they want to follow the text
        if (el.scrollTop + 10 > el.scrollHeight - el.clientHeight) {
            // have to push our code outside of this thread since the text hasn't updated yet
            setTimeout(function () { el.scrollTop = el.scrollHeight - el.clientHeight; }, 0);
        }
    });

    return target;
};

ko.bindingHandlers.enterkey = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var allBindings = allBindingsAccessor();

        $(element).on('keypress', 'input, textarea, select', function (e) {
            var keyCode = e.which || e.keyCode;
            if (keyCode !== 13) {
                return true;
            }
            var target = e.target;
            target.blur();

            allBindings.enterkey.call(viewModel, viewModel, target, element);
            target.focus();

            return false;
        });
    }
};



Array.prototype.indexOfElement = function(predicate) {
    for (var i = 0; i < this.length; i++) {
        if (predicate(this[i]))
        return i;
    }
    return -1;
};


function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
}