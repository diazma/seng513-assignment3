var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

http.listen( port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));
var usersConnected = [];
var usersAvailable = ["Ruby", "Toulouse", "Dexter", "Mr. Mittens", "Warren the office cat"];
var usernames = {};
// listen to 'chat' messages
io.on('connection', function(socket){
    socket.on('sendmessage', function(msg){
	io.emit('updatechat', Date().toString().split(' ')[4], socket.username, msg);
    });

    // Assign a random username
    socket.on('userjoined', function() {

        let index = Math.floor(Math.random()*usersAvailable.length)
        usersConnected.push(usersAvailable[index]);
        socket.username = usersAvailable[index];
        usersAvailable.splice(index, 1);
        io.emit('assign-nick', socket.username);
        socket.emit('updatechat', Date().toString().split(' ')[4], 'SERVER', 'You are user: ' + socket.username );
        io.emit('updatechat', Date().toString().split(' ')[4], 'SERVER', socket.username + ' has connected to chat');
    });

});
