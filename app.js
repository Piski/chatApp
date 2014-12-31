// SERVER
var express = require("express"),
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io").listen(server),
    users = {};

// listen to server
server.listen(3000);

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html")
});

// all the socket code goes inside this. Every user gets a own socket
// for private messaging, save socket
io.sockets.on("connection", function(socket) {
    // users
    socket.on("new user", function(data, callback) {
        // if username already exists, send false. Can send whatever you want
        if(data in users) {
            callback(false);
        } else {
            callback(true);
            socket.nickname = data;
            users[socket.nickname] = socket;
            updateNicknames();
        }
    });
    
    // update nickanmes after disconnects
    function updateNicknames() {
        // send new nicknames to client
        io.sockets.emit("usernames", Object.keys(users));
    }
              
    // receive message
    socket.on("send message", function(data, callback) {
        // in case user starts with spaces
        var msg = data.trim();
        if (msg.substr(0,3) === "/w ") {
            // after 3 character
            msg = msg.substr(3);
            var index = msg.indexOf(" ");
            if (index !== -1) {
                var name = msg.substring(0, index);
                var msg = msg.substring(index + 1);
                if (name in users) {
                    // send only to one person
                    users[name].emit("whisper", { msg: msg, nick: socket.nickname });
                    socket.emit("whisper", { msg: msg, nick: "to " + name });
                } else {
                    callback("Enter valid user for your whisper");
                }
            } else {
                callback("Enter a message for your whisper");
            }
        } else {
            // send back to client message and nickname
            io.sockets.emit("new message", { msg: msg, nick: socket.nickname }); 
        }
        // same as emit but sends the message to everyone besides the sender itself
        //socket.broadcast.emit("new message", data);
    });
    
    socket.on("disconnect", function(data) {
        // if username not picked
        if(!socket.nickname) {
            return;
        } else {
            // remove from array
            delete users[socket.nickname];
            updateNicknames();
        }
    });
});

// if all is fine
console.log('Server running at localhost:3000');