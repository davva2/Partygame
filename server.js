' use strict';

let http = require('http');
let express = require('express');
let socketio = require('socket.io');

let app = express();
let server = http.createServer(app);
let io = socketio(server);
let path = require('path');
let ip = require('ip');
let Partygame = require('./');

var allClients = [];
var Players = [];

io.on('connection', onConnect);

var rooms = [];

function onConnect(socket) {

    allClients.push(socket);

    socket.on('client', clientLoop);
    function clientLoop() {

    socket.emit('msg', 'Hello! Welcome new player. Please choose a name.');

    socket.on('msg', function (inputName, inputRoom) {
        roomIndex = rooms.indexOf(inputRoom);
        room = rooms[roomIndex];

        if (roomIndex == -1) {
            socket.emit('msg', 'Not an existing room!');
            return;
        }

        //Check if connected client is a player
        for (var i = 0; i < Players.length; i++) {
                if (Players[i].name == inputName) {
                io.emit('msg', inputName + ' has reconnected!');
                // Rewrite reconnected players socket
                }
            }

        if (Players[2]) {
            socket.emit('msg', 'Sorry, game is full.');
            return;
        }
        if (Players[1]) {
        Players[2] = {sock:socket, name:inputName};
        }
        // P2 overwrites P1
        if (Players[0]) {
        Players[1] = {sock:socket, name:inputName};
        io.emit('gameready');
        }
        else Players[0] = {sock:socket, name:inputName};

        socket.join(room);
        io.to(room).emit('msg', inputName + ' just joined!');
        socket.emit('name', inputName);
        });
    };

    socket.on('host', hostLoop);

    function hostLoop() {

        var roomcode = generateRoomCode();
        rooms.push(roomcode);
        var localip = ip.address();
        socket.emit('room', localip, roomcode);
        console.log('Creating room with code: ' + roomcode);
        var room = io.of(roomcode);
        socket.join(roomcode);
    };

    socket.on('disconnect', function() {
          console.log('Got disconnect!');
          var i = allClients.indexOf(socket);
          allClients.splice(i, 1);
          var x = Players.findIndex(p => p.sock === socket);
          if (x != -1) { //If the client is a player
          io.emit('msg', Players[x].name + ' just left!');
          }
          });
}

function matchReady(sockA, sockB) {
    [sockA, sockB].forEach((socket) => socket.emit('msg', 'Game can be started!'));
}

function generateRoomCode() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (var i = 0; i < 4; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

// Serve index.html as root page
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});
// Serve host.html as subpage
app.get('/host', function(req, res) {
  res.sendFile(path.join(__dirname, 'host/host.html'));
});
// Serve client.html as subpage
app.get('/client', function(req, res) {
  res.sendFile(path.join(__dirname, 'client/client.html'));
});

//Give access to files from /client and /host through Express
app.use(express.static(__dirname + '/client'));
app.use(express.static(__dirname + '/host'));

//Listen on port 1337
server.listen(1337, () => console.log('Server online on port 1337 with localip: ' + ip.address()) );


