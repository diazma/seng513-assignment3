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
var coloursUsed = [];
var usersAvailable = ["Ruby", "Toulouse", "Dexter", "Mr. Mittens", "Warren the office cat"];
var availableColours = ["#ff3399", "#6600ff", "#339933", "#ff9900", "#cc0000"];
// listen to 'chat' messages
io.on('connection', function(socket){
    socket.on('sendmessage', function(msg){
        // Handle message sent from client
        let msgArray = msg.split(" ");
        if (msg.indexOf("/nick ") >= 0 && msgArray.length >= 1) { // Change nick
            let oldName = socket.username;
            let arrayLength = msgArray.length;
            socket.username = msgArray.slice(1, arrayLength).join(" ");
            socket.emit('assignednickname', socket.username, socket.colour);
            io.emit('updatechat', Date().toString().split(' ')[4], 'SERVER', 'user ' + oldName +
                ' has changed nickname to ' + socket.username, "#000000");
        }
        else if (msg.indexOf("/nickcolor ") >= 0 &&
            msgArray.length == 2  &&
            /(^[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(msgArray[1])){
            // Change color
            socket.colour = msgArray[1];
            socket.emit('assignednickname', null, "#" + socket.colour);
            socket.emit('updatechat', Date().toString().split(' ')[4], 'SERVER', 'You have changed successfully your nick color',
                "#000000");
        }
        else {
            io.emit('updatechat', Date().toString().split(' ')[4], socket.username, msg, socket.colour);
        }

    });

    // Assign a random username
    socket.on('userjoined', function() {

        let index = Math.floor(Math.random()*usersAvailable.length);
        usersConnected.push(usersAvailable[index]);
        socket.username = usersAvailable[index];
        let colorIndex = Math.floor(Math.random()*usersAvailable.length);
        socket.colour = availableColours[colorIndex];
        usersAvailable.splice(index, 1);
        availableColours.splice(colorIndex, 1);
        socket.emit('assignednickname', socket.username, socket.colour);
        socket.emit('updatechat', '', 'SERVER NOTIFICATION', 'You are user: ' + socket.username, "#000000");
        io.emit('updatechat', Date().toString().split(' ')[4], 'SERVER', socket.username + ' has connected to chat', "#000000");
        io.emit('updateusers', usersConnected);

    });

    // Handling user disconnecting
    socket.on('disconnect', function(){
        // remove the username from global usernames list
        delete usersConnected[socket.username];
        // update list of users in chat, client-side
        io.emit('updateusers', usersConnected);
        // echo globally that this client has left
        io.emit('updatechat', Date().toString().split(' ')[4], 'SERVER', socket.username + ' has disconnected');
    });

});
