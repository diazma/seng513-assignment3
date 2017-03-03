// shorthand for $(document).ready(...)


$(function() {
    var currentNickname = null;
    var currentColour = null;


    function createCookie(username) {

        var date = new Date();
        date.setTime(date.getTime() + (7*24*60*60*1000));
        let expires = "; expires=" + date.toUTCString();
        document.cookie = "username=" + username + expires + "; path=/";
    }

    function readCookie() {
        var usernameString = "username=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(usernameString) == 0) return c.substring(usernameString.length,c.length);
        }
        return null;
    }

    function deleteCookie() {
        let expires = "; expires=-1";
        document.cookie = "username=''" + expires + "; path=/";
    }

    function positionMessages() {
        var containerHeight = $('#messages-container').height();
        var messagesHeight = $('#messages').height();
        $('#messages').css('margin-top', Math.max(0, containerHeight-messagesHeight));
        $('#messages-container').scrollTop($('#messages-container').prop('scrollHeight'));
    }

    $(window).on('resize', positionMessages);

    var socket = io.connect('http://localhost:3000');
        $('form').submit(function(){
            // Sending messages to the server
            socket.emit('sendmessage', $('#m').val());
            $('#m').val('');
        return false;
    });
    socket.on('updatechat', function(timestamp, username, msg, colour){
        // When the user is the current user, add colour
        if (username == currentNickname) {
            $('#messages').append($('<li>').html('<b>' + timestamp + ' ' + '<span style="color: '+ currentColour + '">'
                + username + ':</span> ' + msg + '</b>'));
        }
        else {
            $('#messages').append($('<li>').html(timestamp + ' ' + '<span style="color: ' + colour + '">'
                + username + ':</span> ' + msg));
        }

        positionMessages();
    });

    // Delete cookie
    socket.on('destroy-cookie', function() {
        deleteCookie();
    });

    // Assigning nick and colour for usernick
    socket.on('assignednickname', function(nickname, hexColour) {
        if (nickname) {
            currentNickname = nickname;
            if (!readCookie() || nickname !== readCookie() ) {
                createCookie(nickname);
            }
        }
        if (hexColour) {
            currentColour = hexColour;
        }

    });

    // Adding users to the list of connected users
    socket.on('updateusers', function(usernameList){
        // Empty the current users displayed
        $('#user-list').empty();

        // Add the fresh list of users connected
        for (var i = 0; i < usernameList.length; i++) {
            if (usernameList[i] == currentNickname) {
                $('#user-list').append($('<li>').html('<span id="you">' + usernameList[i] + ' (You)</span>'));
            }
            else {
                $('#user-list').append($('<li>').html(usernameList[i]));
            }
        }


    });


    // User has joined to the chat upon connect
    socket.on('connect', function() {
        let previousName = readCookie();
        if (previousName) {
            socket.emit('user-reconnected', previousName);
        }
        else {
            socket.emit('userjoined');
        }

    });

    // After connection, listen to receive old messages
    socket.on('loadmessages', function(messageLog) {
        // Remove any messages if any
        $('#messages').empty();

        // Place all the messages
        for (var i =0; i < messageLog.length; i++) {
            if (messageLog[i].username == currentNickname) {
                $('#messages').append($('<li>').html('<b>' + messageLog[i].timestamp + ' '
                    + '<span style="color: '+ currentColour + '">'
                    + messageLog[i].username + ':</span> ' + messageLog[i].message + '</b>'));
            }
            else {
                $('#messages').append($('<li>').html(messageLog[i].timestamp + ' ' + '<span style="color: '
                    + messageLog[i].colour + '">'
                    + messageLog[i].name + ':</span> ' + messageLog[i].message));
            }
        }
    });

});
