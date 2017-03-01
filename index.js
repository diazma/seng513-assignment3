var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

http.listen( port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));

var usernames = {};
// listen to 'chat' messages
io.on('connection', function(socket){
    socket.on('sendmessage', function(msg){
	io.emit('updatechat', Date().toString().split(' ')[4], socket.username, msg);
    });

    socket.on('userjoined', function(username) {
        socket.username = username;
        usernames[username] = username;
        io.emit('updatechat', Date().toString().split(' ')[4], 'SERVER', username + ' has connected to chat');
    })
});
