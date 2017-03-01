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
