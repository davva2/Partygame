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

var EventEmitter = require("events").EventEmitter;
var ee = new EventEmitter();

var allClients = [];
var allPlayers = [];

var categoryIndex = 1;

io.on('connection', onConnect);
var votedForFaker = 100;
var rooms = [];
var abortTimer = 0;

function onConnect(socket) {

  allClients.push(socket);

  socket.on('player', clientLoop);
  function clientLoop() {

    socket.emit('gamemsg', 'Hello! Welcome new player. Please choose a name and then input the roomcode.');

    socket.on('input', function (inputName, inputRoom) {
      roomIndex = rooms.indexOf(inputRoom);
      room = rooms[roomIndex];

      if (roomIndex == -1) {
        socket.emit('gamemsg', 'Not an existing room!');
        return;
      }

      //Check if connected player is a player

      for (var i = 0; i < allPlayers.length; i++) {
        if (allPlayers[i].name == inputName) {
          io.emit('msg', inputName + ' has reconnected!');
          // Rewrite reconnected allPlayers socket
          server.emit('reconnect', allPlayers[i].name, socket);
          socket.join(room);
          socket.emit('name', inputName);
          return;
        }
      }
      // Get amount of players in current room.
      var roomArray = io.sockets.adapter.rooms[inputRoom];
      if (roomArray.length > 6) {
        socket.emit('gamemsg', 'Sorry, game is full.');
        return;
      }
      else allPlayers.push({sock:socket, name:inputName, score:0});
      if (roomArray.length > 1) io.emit('gameready');

      socket.join(room);
      io.to(room).emit('msg', inputName + ' just joined!');
      socket.emit('name', inputName);
    });
  }

  socket.on('host', hostLoop);

  function hostLoop() {
    var host = socket;
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
      socket.removeAllListeners();
      localPlayers.forEach((player, index) => {
        player.sock.removeAllListeners();
      });
      //If a player is in host's room, push it into localPlayers
      //var localPlayers = io.sockets.adapter.rooms[roomcode];
      allPlayers.forEach((player) => {
        if(io.sockets.adapter.sids[player.sock.id][roomcode]) {
          localPlayers.push(player);
        }
      });
      server.on('reconnect', function(matchingName, newSocket){
        localPlayers.forEach((player) => {
          if (player.name == matchingName) {
          player.sock = newSocket;
          newSocket.emit('clear');
          newSocket.emit('gamemsg', 'Successfully reconnected.');
          }

        });
      });
      // Game loop

      server.on('gameloop', function(){
        socket.removeAllListeners();
        localPlayers.forEach((player, index) => {
          player.sock.removeAllListeners();
        });

        if (fakerCount > 1) return;
        var faker = null;
        var category = null;
        var rounds = 0;

        server.on('startRound', function(currentRound){
            console.log('currentRound is ' + currentRound);
            socket.removeAllListeners();
            //if (currentRound > 3) return; //server.emit('gameloop2');
            host.emit('clear');
            host.emit('msg', 'Game is starting');
              localPlayers.forEach((player, index) => {
                player.sock.removeAllListeners();
                player.sock.emit('clear');
                player.sock.emit('gamemsg', 'Game is starting, you are player ' + index);
              });
              // Main game loop.

              if (category == null) {
                category = pickCategory(socket, localPlayers, roomcode);
                startTimer(10, 'category', roomcode);
              }
              else {
                server.emit('categoryPicked', category);
              }
              server.on('categoryPicked', function(picked) {
                category = picked;
                if (faker == null) {
                  faker = chooseFaker(localPlayers);
                  fakerCount++;
                }
                var question = getQuestion(category);
                var variables = [category, faker, question];
                localPlayers.forEach((player, index) => {
                  player.sock.emit('clear');
                });
                //host.emit('msg', 'Wait for the timer and do the task when it runs out.');
                sendQuestion(localPlayers, faker, category, question);
                startTimer(10, 'startVote', roomcode, variables, 'votePrep');
              });

              server.on('votePrep', function(variables){
                localPlayers.forEach((player, index) => {
                  player.sock.emit('clear');
                  player.sock.emit('gamemsg', 'Do the task!');
                });
                startTimer(7, '', roomcode, variables, 'gameEvent');
              });

              server.once('gameEvent', function(variables){
                var faker = variables[1];
                var question = variables[2];
                localPlayers.forEach((player, index) => {
                  player.sock.emit('clear');
                  player.sock.emit('gamemsg', 'Vote for the player that you think is the faker.');
                });
                vote(localPlayers);
                  var fakerVotes = 0;
                  localPlayers.forEach((player, index) => {
                    player.sock.once('votePlayer', function(votePlayer, fromPlayer){
                      if (votePlayer == faker) {
                        fakerVotes++;
                        localPlayers[fromPlayer].score = localPlayers[fromPlayer].score + votedForFaker;
                        console.log(localPlayers[fromPlayer].score);
                      }
                      host.emit('msg', localPlayers[fromPlayer].name + ' voted for ' + localPlayers[votePlayer].name + '.');
                      localPlayers[fromPlayer].sock.emit('clear');
                    });
                  });
                  host.emit('msg', 'The question was:\n' + question);
                  startTimer(20, '', roomcode, [faker, question], 'startVote');
                  server.once('startVote', function(variables){
                    localPlayers.forEach((player, index) => {
                      player.sock.emit('clear');
                    });
                    host.emit('clear');
                    host.emit('msg', 'Voting finished!');
                    if (fakerVotes == (localPlayers.length - 1)){
                      host.emit('clear');
                      host.emit('msg', 'The faker is found! It was: ' + localPlayers[faker].name);
                      /*host.emit('msg', 'The score is: ');
                      localPlayers.forEach((player, index) => {
                        host.emit('msg', player.name + ': ' + player.score);
                      }); */
                      rounds = 2;

                      // SCORE HERE
                      //server.emit('gameloop2');
                    }
                    else {
                      host.emit('msg', 'The faker is still at large!');
                      localPlayers[faker].score = localPlayers[faker].score + 200;

                    }
                    startTimer(7, '', roomcode, faker, 'roundEnd');
                    server.once('roundEnd', function(variables) {
                      console.log(rounds);
                      rounds++;
                      server.emit('startRound2', rounds);
                    });
                  });
                });

              });
              //outer loop
              server.emit('startRound', rounds);
              server.on('startRound2', function(currentRound){
                console.log('fakerCount is ' + fakerCount);
                if(((currentRound % 3) == 0) && (fakerCount != 2)) {
                  faker = null;
                  console.log('nulling faker');
                  category = null;
                  currentRound = 0;
                }
                if ((fakerCount >= 2) && (currentRound % 3) == 0) {
                  console.log('game will end');
                  host.emit('clear');
                  host.emit('msg', 'Game over!');
                  localPlayers.forEach((player, index) => {
                    host.emit('msg', (player.name + ' got ' + player.score + 'points.'));
                  });
                  return;
                }
                server.emit('startRound', currentRound);
              });


              //function results

              /*
            });
            //Count down on host
            //Clear host and players
            //Vote and show count on host


          });*/
          //clear and repeat


        });
        var fakerCount = 0;

        server.emit('gameloop');
        server.on('gameloop2', function(){
          server.emit('gameloop');
        });
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

function loadJSON(callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', 'questions.json', true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}


var pointQ = [
        "Point at the person with most cats." ,
        "Point at the person who is best at lying.",
        "Point at the person with best cooking skills."
      ];

var handQ = [
        "Hands up if you ate pizza today" ,
        "Hands up if you like water.",
        "Hands up if you play videogames every day."
      ];


//Get question from file depending on category
function getQuestion(category){

  if(category == 'point'){
    var q = pointQ[Math.floor(Math.random() * pointQ.length)];
    console.log(q);
    return q;
  }
  if(category == 'hand'){
    return handQ[Math.floor(Math.random() * handQ.length)];
  }
}

//Send question to all players except for the faker
function sendQuestion(localPlayers, faker, category, question){
  localPlayers.forEach((player, index) => {
    if (index == faker) {
      player.sock.emit('gamemsg', 'You are the faker, try to blend in.');
      player.sock.emit('gamemsg', 'Wait! Do the task when the timer runs out...');
    }
    else {
      player.sock.emit('gamemsg', question);
      player.sock.emit('gamemsg', 'Wait! Do the task when the timer runs out...');
    }
  });
}

//Chooses the faker randomly from all the players
function chooseFaker(localPlayers){
  return (Math.floor(Math.random() * allPlayers.length));
}

//One person picks the category for the round
function pickCategory(host, players, roomcode) {
  /*
  host.on('categoryTimeout', function(category) {
  if (chosen == 0) host.emit('msg', 'Category is hand');
  io.removeAllListeners('categoryTimeout');
});*/
var index = Math.floor(Math.random()*players.length);
players[index].sock.emit('pickCategory');
var chosen = 0;
var category;
players[index].sock.once('category', function(categoryFromPlayer) {
  if (categoryFromPlayer == 'point') {
    host.emit('msg', (players[index].name + ' has chosen You Gotta Point!'));
    chosen = 1;
  }
  else if (categoryFromPlayer == 'hand') {
    host.emit('msg', (players[index].name + ' has chosen Hands Up!'));
    chosen = 1;
  }
  category = categoryFromPlayer;

// Ska vi ha denna?
//  abortTimer = 1;

});
setTimeout(function checkTimeout() {
  if (chosen == 0) {
    host.emit('msg', 'No category was chosen therefore it is randomly chosen as: "You gotta point"');
    category = 'point';
  }
  server.emit('categoryPicked', category);
}, 10.5*1000);
}

function startTimer(timer, type, room, variables, nextStop) {
  var k = setInterval(function () {
    if (timer > 0 && abortTimer == 0) {
      timer = timer-1;
      io.to(room).emit('timer', timer);
    }
    else{
      io.to(room).emit('timeout', type);
      server.emit(nextStop, variables);
      clearInterval(k);
      abortTimer = 0;
    }
  }, 1000);
}

function vote(localPlayers) {
  names = [];
  localPlayers.forEach((player, index) => {
    names.push(player.name);
  });

  localPlayers.forEach((player, index) => {
    player.sock.emit('vote', names, index);
  });
}

function generateRoomCode() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (var i = 0; i < 4; i++)
  text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}
function deadFunc(){}






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
