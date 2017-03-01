// shorthand for $(document).ready(...)

var currentNickname = null;
var currentColour = null;
$(function() {
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

    });
    // Assigning nick and colour for usernick
    socket.on('assignednickname', function(nickname, hexColour) {
        if (nickname) {
            currentNickname = nickname;
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
                $('#user-list').append($('<li>').html('<b>' + usernameList[i] + ' (You)</b>'));
            }
            else {
                $('#user-list').append($('<li>').html(usernameList[i]));
            }
        }


    });


    // User has joined to the chat upon connect
    socket.on('connect', function() {
        socket.emit('userjoined');
    });

});
