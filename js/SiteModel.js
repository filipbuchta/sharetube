
var SiteModel = (function() {

    function SiteModel() {

        this.chatMessages = ko.observableArray().extend({ scrollFollow: '.panel-body' });

        this.currentMessageContent = ko.observable();
		this.currentMessageId = ko.observable(guid());

        this.nicknames = ko.observable();

        this.playlist = ko.observableArray().extend({youtubePlaylist: this, site: this});
        this.currentVideo = ko.observable();

        this.searchQuery = ko.observable();

        this.searchResults = ko.observableArray();

        this.isPlaying = ko.observable(false);

        this.currentTime = ko.observable();
        this.duration = ko.observable();

        this.channel = null;
        this.player = null;

        this.userId = ko.observable(null);

		this.soundEnabled = ko.observable(true);

        var self = this;

        this.percentageComplete = ko.computed(function () {
            var percentage = (self.currentTime() * 100 / self.duration()) | 0;
            return "width: " + percentage + "%;";
        });

        window.addEventListener("focus", function() {
            self.chatMessages().forEach( function (item) {
               item.isNew(false);
            });
        });

        //TODO: get nick from local storage
//        var command = new Command(Command.CHANGE_NICK);
//        command.newNick = "Guest";
//        this.doCommand(command);

    }


	SiteModel.prototype.toggleSound = function() {
		this.soundEnabled(!this.soundEnabled());
	};

    SiteModel.prototype.command_removeVideo = function(command) {
        var found = this.playlist().filter( function (v) {
            return v.videoId == command.videoId;
        });

        if (found == null)
            return;

        this.playlist.remove(found[0]);
    };

    SiteModel.prototype.command_addVideo = function(command) {
        this.playlist.splice(command.index, 0, command.video);
    };




    SiteModel.prototype.command_changeNick = function(command) {
        this.nicknames[command.userId] = command.newNick;

//        var message = new ChatMessage("System", "Your name is now " + command.newNick, new Date(), true);
//        this.chatMessages.push(message);
    };

    SiteModel.prototype.command_chat = function(command) {

        if (command.userId != this.userId() && this.soundEnabled()) {
            //$.titleAlert("New message!");
            var sound = document.getElementById("audio-message");
            sound.load();
            sound.play();
        }

        var content = command.content;

        content = content.replace(/((http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?)/g, "<a href=\"$1\" target=\"_blank\">$1</a>")

		for (var i = 0; i < this.chatMessages().length; i++) {
			if (this.chatMessages()[i].id() == command.id) {
				this.chatMessages()[i].content(content);
				this.chatMessages()[i].isNew(command.userId != this.userId());
				return;
			}
		}

        var message = new ChatMessage(command.id, command.userId, content, new Date(), command.userId != this.userId() && !document.hasFocus());
        this.chatMessages.push(message);
    };


    SiteModel.prototype.command_changeOrder = function(command) {
        var index = this.playlist().indexOfElement( function (v) {
            return v.videoId == command.videoId;
        });

        if (index == command.index)
            return;

        var old = this.playlist()[index];

        this.playlist.splice(index, 1);
        this.playlist.splice(command.index, 0, old);
    };

    SiteModel.prototype.reorderPlaylist = function(arg) {
        var command = new Command(Command.CHANGE_ORDER);
        command.videoId = arg.item.videoId;
        command.index = arg.targetIndex;
        this.doCommand(command);
    };

    SiteModel.prototype.removeVideo = function(video) {

        var command = new Command(Command.REMOVE_VIDEO);
        command.videoId = video.videoId;

        this.doCommand(command);
    };

    SiteModel.prototype.playVideo = function(video) {
        var index = this.playlist().indexOfElement( function (v) {
            return v.videoId == video.videoId;
        });

        if (index != -1) {
            return;
        }

        var command = new Command(Command.ADD_VIDEO);
        command.video = video;
        command.index = 0;
        this.doCommand(command);
    };

    SiteModel.prototype.queueVideo = function(video) {
        var index = this.playlist().indexOfElement( function (v) {
            return v.videoId == video.videoId;
        });

        if (index != -1) {
            return;
        }
        var command = new Command(Command.ADD_VIDEO);
        command.video = video;
        command.index = this.playlist().length;
        this.doCommand(command);
    };


    SiteModel.prototype.doCommand = function(command) {
        command.userId = this.userId();
        this.processCommand(command);
        this.broadcastCommand(command);
    };

    /**
     @param {Command} command
     */
    SiteModel.prototype.processCommand = function(command) {
        console.log(command);

        var fnc = this[command.functionName];

        if (fnc != null) {
            fnc.call(this, command);
        } else {
            console.log("Unknown command", command)
        }

    };

    SiteModel.prototype.broadcastCommand = function (command) {
        this.channel.send(JSON.stringify(command));
    };



    SiteModel.prototype.seekVideo = function(model, event) {

        if (!this.isPlaying())
            return;

        var percentage = event.offsetX / event.currentTarget.clientWidth;
        var position = percentage * this.duration();
        this.player.seekTo(position, true);
    };

    SiteModel.prototype.resumeVideo = function () {

    };



    SiteModel.prototype.pauseVideo = function () {

    };



    SiteModel.prototype.search = function() {

        var request = gapi.client.youtube.search.list({
            q: this.searchQuery(),
            part: 'snippet'
        });


        var self = this;

        request.execute(function(response) {


            self.searchResults.removeAll();

            var result = response.result;
            var items = result.items;
            if (items != null) {
                for (var i = 0; i < items.length; i++) {
                    var videoId = items[i].id.videoId;
                    var snippet = items[i].snippet;

                    self.searchResults.push(new YoutubeVideo(snippet.title, videoId, snippet.thumbnails.high.url, self.userId));

                }
            }
        });


    };


	SiteModel.prototype.editMessage = function() {
		var self = site; //hack

		console.log("test");
		var myLastMessage = null;
		for (var i = this.chatMessages().length - 1; i >= 0; i--) {
			if (this.chatMessages()[i].userId() == self.userId()) {
				myLastMessage = this.chatMessages()[i];
				break;
			}
		}
		if (myLastMessage != null) {
			self.currentMessageContent(myLastMessage.content());
			self.currentMessageId(myLastMessage.id());
		}
	};

    SiteModel.prototype.sendMessage = function(model) {

        if (this.currentMessageContent() == null || this.currentMessageContent() == "") {

			this.currentMessageContent(null);
			this.currentMessageId(guid());

            return;
        }

        var command = new Command(Command.CHAT);
		command.id = this.currentMessageId();
        command.content = this.currentMessageContent();

        this.doCommand(command);


        this.currentMessageContent(null);
		this.currentMessageId(guid());
    };

    return SiteModel;
})();
