// SERVER
var express = require("express"),
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io").listen(server),
    nicknames = [];

// listen to server
server.listen(3000);

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html")
});

// all the socket code goes inside this
io.sockets.on("connection", function(socket) {
    // users
    socket.on("new user", function(data, callback) {
        // if username already exists, send false. Can send whatever you want
        if(nicknames.indexOf(data) != -1) {
            callback(false);
        } else {
            callback(true);
            socket.nickname = data;
            nicknames.push(socket.nickname);
            updateNicknames();
        }
    });
    
    // update nickanmes after disconnects
    function updateNicknames() {
        // send new nicknames to client
        io.sockets.emit("usernames", nicknames);
    }
              
    // receive message
    socket.on("send message", function(data) {
        // send back to client message and nickname
        io.sockets.emit("new message", { msg: data, nick: socket.nickname }); 
        // same as emit but sends the message to everyone besides the sender itself
        //socket.broadcast.emit("new message", data);
    });
    
    socket.on("disconnect", function(data) {
        // if username not picked
        if(!socket.nickname) {
            return;
        } else {
            // remove from array
            nicknames.splice(nicknames.indexOf(socket.nickname), 1);
            updateNicknames();
        }
    });
});

// if all is fine
console.log('Server running at localhost:3000');