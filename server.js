' use strict';

let http = require('http');
let express = require('express');
let socketio = require('socket.io');

let app = express();
let server = http.createServer(app);
let io = socketio(server);
let path = require('path');
let ip = require('ip');
let Partygame = require('./Partygame');

var allClients = [];
var allPlayers = [];

var categoryIndex = 1;

io.on('connection', onConnect);

var rooms = [];

function onConnect(socket) {

  allClients.push(socket);

  socket.on('player', clientLoop);
  function clientLoop() {

    socket.emit('msg', 'Hello! Welcome new player. Please choose a name.');

    socket.on('input', function (inputName, inputRoom) {
      roomIndex = rooms.indexOf(inputRoom);
      room = rooms[roomIndex];

      if (roomIndex == -1) {
        socket.emit('msg', 'Not an existing room!');
        return;
      }

      //Check if connected player is a player
      for (var i = 0; i < allPlayers.length; i++) {
        if (allPlayers[i].name == inputName) {
          io.emit('msg', inputName + ' has reconnected!');
          // Rewrite reconnected allPlayers socket
        }
      }
      // Get amount of players in current room.
      var roomArray = io.sockets.adapter.rooms[inputRoom];
      if (roomArray.length > 3) {
        socket.emit('msg', 'Sorry, game is full.');
        return;
      }
      else allPlayers.push({sock:socket, name:inputName});
      if (roomArray.length > 1) io.emit('gameready');

      socket.join(room);
      io.to(room).emit('msg', inputName + ' just joined!');
      socket.emit('name', inputName);
    });
  }

  socket.on('host', hostLoop);

  function hostLoop() {

    //var roomcode = generateRoomCode();
    var roomcode = "A";
    rooms.push(roomcode);
    var localip = ip.address();
    socket.emit('room', localip, roomcode);
    console.log('Creating room with code: ' + roomcode);
    var room = io.of(roomcode);
    socket.join(roomcode);

    socket.on('startgame', function() {
      var localPlayers = [];
      //If a player is in host's room, push it into localPlayers
      //var localPlayers = io.sockets.adapter.rooms[roomcode];
      allPlayers.forEach((player) => {
        if(io.sockets.adapter.sids[player.sock.id][roomcode]) {
          localPlayers.push(player);
        }
      });
      // Game loop

      localPlayers.forEach((player, index) => {
        player.sock.emit('clear');
        player.sock.emit('gamemsg', 'Game is starting, you are player ' + index);
      });
      // Main game loop.
      var faker = chooseFaker(localPlayers);
      //var category = pickCategory(socket, localPlayers, categoryIndex);
      var category = 'point';
      var question = getQuestion(category);
      console.log(question);
      console.log(category);
      sendQuestion(localPlayers, faker, category, question);
      //Count down on host
      //Clear host and players
      //Vote and show count on host
      //clear and repeat

      //  var roomUsers = io.sockets.adapter.rooms[roomcode].sockets;


    });
  }

  socket.on('disconnect', function() {
    console.log('Got disconnect!');
    var i = allClients.indexOf(socket);
    allClients.splice(i, 1);
    var x = allPlayers.findIndex(p => p.sock === socket);
    if (x != -1) { //If the client is a player
      io.emit('msg', allPlayers[x].name + ' just left!');
    }
  });
}


//Get question from file depending on category
function getQuestion(category){
  if(category == 'point'){
    return 'Peka på Anton';
  }
  if(category == 'hand'){
    return 'Räck upp din hand om du heter Anton.';
  }
}

//Send question to all players except for the faker
function sendQuestion(localPlayers, faker, category, question){
  localPlayers.forEach((player, index) => {
    if (index == faker) {
      player.sock.emit('gamemsg', 'Youre the faker, try to blend in. The category is ' + category);
    }
    else {
      player.sock.emit('gamemsg', question);
    }
  });
}

//Chooses the faker randomly from all the players
function chooseFaker(localPlayers){
  return (Math.floor(Math.random() * allPlayers.length));
}

//One person picks the category for the round
function pickCategory(host, players, index) {

  host.on('categoryTimeout', function(category) {
    if (chosen == 0) host.emit('msg', 'Category is hand');
    io.removeAllListeners('categoryTimeout');
  });

  players[index].sock.emit('pickCategory');
  host.emit('pickCategory');
  categoryIndex++;
  var chosen = 0;
  players[index].sock.on('categoryTimeout', function(category) {
    if (category == 'point') {
      host.emit('msg', 'Category is point');
      return 'point';
    }
    else if (category == 'hand') {
      host.emit('msg', 'Category is hand');
      return 'hand';
    }
    chosen = 1;
  });


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
app.get('/player', function(req, res) {
  res.sendFile(path.join(__dirname, 'player/player.html'));
});

//Give access to files from /player and /host through Express
app.use(express.static(__dirname + '/player'));
app.use(express.static(__dirname + '/host'));
app.use(express.static(__dirname + '/'));


//Listen on port 1337
server.listen(1337, () => console.log('Server online on port 1337 with localip: ' + ip.address()) );
