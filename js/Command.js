
var Command = (function() {

    function Command(functionName) {
        this.functionName = functionName;
        this.userId = null;
    }

    Command.CHAT = "command_chat";
    Command.SEEK_VIDEO = "command_seekVideo";
    Command.PAUSE_VIDEO = "command_pauseVideo";
    Command.RESUME_VIDEO = "command_resumeVideo";
    Command.ADD_VIDEO = "command_addVideo";
    Command.REMOVE_VIDEO = "command_removeVideo";
    Command.CHANGE_NICK = "command_changeNick";
    Command.CHANGE_ORDER = "command_changeOrder";

    return Command;
})();
