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

var messageLog = [];

// functions that updates the message log stack, limiting size to 200 messages
function updateMessageLog(time, username, msg, colour) {
    if (messageLog.length == 200) {
        messageLog.pop();
    }
    messageLog.push({timestamp: time, name: username, message: msg, nickcolour: colour});
}
// listen to 'chat' messages
io.on('connection', function(socket){
    socket.on('sendmessage', function(msg){
        // Handle message sent from client
        let msgArray = msg.split(" ");

        // Change nick of user
        if (msg.indexOf("/nick ") >= 0 && msgArray.length >= 1) {
            let arrayLength = msgArray.length;
            let newUserNick = msgArray.slice(1, arrayLength).join(" ");

            // Check if new name is unique against the users connected
            if (usersConnected.indexOf(newUserNick) >= 0) {
                socket.emit('updatechat', Date().toString().split(' ')[4], 'SERVER', 'Unable to change nickname. Nickname ' + newUserNick +
                    ' already in use',
                    "#000000");
            }
            else {
                // Change the nickname
                let oldName = socket.username;
                let indexOldName = usersConnected.indexOf(oldName);
                delete usersConnected[indexOldName];
                socket.username = newUserNick;
                usersConnected.push(socket.username);
                io.emit('updateusers', usersConnected);
                socket.emit('assignednickname', socket.username, socket.colour);
                io.emit('updatechat', Date().toString().split(' ')[4], 'SERVER', 'user ' + oldName +
                    ' has changed nickname to ' + socket.username, "#000000");
            }

        }
        // Change of nick colour by checking if valid hex colour
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
            // Send a message from user to chat
            let timestamp = Date().toString().split(' ')[4];
            io.emit('updatechat', timestamp, socket.username, msg, socket.colour);
            updateMessageLog(timestamp, socket.username, msg, socket.colour);
        }

    });

    // Assign a random username
    socket.on('userjoined', function() {

        // Select a random nickname and colour from default list, add user to usersConnected
        let index = Math.floor(Math.random()*usersAvailable.length);
        usersConnected.push(usersAvailable[index]);
        socket.username = usersAvailable[index];
        let colorIndex = Math.floor(Math.random()*usersAvailable.length);
        socket.colour = availableColours[colorIndex];

        // Remove nicks and colours from available global list
        usersAvailable.splice(index, 1);
        availableColours.splice(colorIndex, 1);

        // Let the client know their assigned nickname and colour
        socket.emit('assignednickname', socket.username, socket.colour);
        // Sent the history of all messages
        socket.emit('loadmessages', messageLog);

        // Let user know the nickname
        socket.emit('updatechat', '', 'SERVER NOTIFICATION', 'You are user: ' + socket.username, "#000000");

        // Let other users know user joined
        io.emit('updatechat', Date().toString().split(' ')[4], 'SERVER', socket.username + ' has connected to chat', "#000000");

        // Update the list of users connected
        io.emit('updateusers', usersConnected);

    });

    // Handling user disconnecting
    socket.on('disconnect', function(){
        // remove the username from global usersConnected list

        delete usersConnected[socket.username];
        let indexOldName = usersConnected.indexOf(socket.username);
        delete usersConnected[indexOldName];

        // update list of users in chat, client-side
        io.emit('updateusers', usersConnected);

        // echo globally that this user left the chat
        io.emit('updatechat', Date().toString().split(' ')[4], 'SERVER', socket.username + ' has disconnected');
    });

});
