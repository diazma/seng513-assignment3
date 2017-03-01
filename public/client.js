// shorthand for $(document).ready(...)
$(function() {
    var socket = io.connect('http://localhost:3000');
    $('form').submit(function(){
	socket.emit('sendmessage', $('#m').val());
	$('#m').val('');
	return false;
    });
    socket.on('updatechat', function(timestamp, username, msg){
	    $('#messages').append($('<li>').text(timestamp + ' ' + username + ': ' + msg));
    });

    socket.on('connect', function() {
        socket.emit('userjoined', prompt("What's your name?"));
    });
});
