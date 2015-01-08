    // CLIENT
    $(document).ready(function () {
        var socket = io.connect();
        var $messageForm = $("#send-message");
        var $messageBox = $("#message");
        var $chat = $("#chat");
        var $nickContainer = $("#nickContainer");
        var $nickForm = $("#setNick");
        var $nickError = $("#nickError");
        var $nickBox = $("#nickname");
        var $nickWrap = $("#nickWrap");
        var $contentWrap = $("#contentWrap");
        var $users = $("#users");

        // handling nicks
        $nickForm.submit(function (e) {
            e.preventDefault();
            socket.emit("new user", $nickBox.val(), function (data) {
                if (data) {
                    $nickContainer.hide();
                    $contentWrap.show();
                } else {
                    $nickError.html("That user name is already taken! Try again");
                }
            });
            $nickBox.val("");
        });

        socket.on("usernames", function (data) {
            var html = "";
            for (var i = 0; i < data.length; i++) {
                html += data[i] + "<br>";
            }
            $users.html(html);
        });

        // send message
        $messageForm.submit(function (e) {
            e.preventDefault(); // prevent the actual event & refresh of the page. just send the
            socket.emit("send message", $messageBox.val(), function (data) {
                // here comes the callbacks aka errors in this case
                $chat.append("<span class='error'>" + data + "</span><br/>");
            });
            $messageBox.val("");
        });

        // receive message in client side
        socket.on("new message", function (data) {
            console.log("new message");
            $chat.append("<span class='message' <b>" + data.nick + ": </b>" + data.msg + "</span><br/>").animate({
                scrollTop: $chat.prop('scrollHeight')
            }, 1);
        });

        // on whisper
        socket.on("whisper", function (data) {
            $chat.append("<span class='whisper' <b>" + data.nick + ": </b>" + data.msg + "</span><br/>").animate({
                scrollTop: $chat.prop('scrollHeight')
            }, 1);
        });

        // help
        socket.on("help", function (data) {
            console.log("help");
            var helpMessage = "/w name --> send private message";
            $chat.append("<span class='help'>" + helpMessage + "</span><br/>").animate({
                scrollTop: $chat.prop('scrollHeight')
            }, 1);
        });
    });
