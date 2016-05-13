
var ChatMessage = (function() {

    function ChatMessage(id, userId, content, date, isNew) {
		this.id = ko.observable(id);
        this.date = ko.observable(date);
        this.content = ko.observable(content);
        this.userId = ko.observable(userId);
        this.isNew = ko.observable(isNew);
    }

    return ChatMessage;
})();
