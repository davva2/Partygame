var socket = io();

socket.emit('player');

socket.on('msg', onMessage);
socket.on('clear', clear);
socket.on('gamemsg', gameMessage);
socket.on('timer', timerFunc);
socket.on('timeout', timeoutFunc);
socket.on('name', function (name) {
  var displayname = document.getElementById('name-display');
  displayname.innerHTML = name;
});

function gameMessage(text) {
  var list = document.getElementById('gameview');
  var content = document.createElement('li');
  content.innerHTML = text;
  list.appendChild(content);
}

socket.on('pickCategory', function() {
  var choice1 = document.createElement('button');
  var choice2 = document.createElement('button');
  choice1.addEventListener('click', function(e) {
    socket.emit('category', 'point');
  });
  choice2.addEventListener('click', function(e) {
    socket.emit('category', 'hand');
  });
  choice1.innerHTML = 'You gotta point';
  choice2.innerHTML = 'Hands up';
  choice1.style.padding = "24px 64px";
  choice2.style.padding = "24px 64px";
  var div = document.getElementById('gameview');
  div.appendChild(choice1);
  div.appendChild(choice2);
});

socket.on('vote', function (names, playerIndex) {

  names.forEach((player, index) => {
    var div = document.getElementById('gameview');
    if (playerIndex != index) {
      var btn = document.createElement('button');
      btn.innerHTML = names[index];
      btn.style.padding = "24px 64px";
      div.appendChild(btn);
      btn.addEventListener('click', function(e) {
        socket.emit('votePlayer', playerIndex, index);
      });

    }
  });
});

  /*
  var div = document.getElementById('gameview');
  if (localPlayers[0] && (0 != index)) {
    var player0 = document.createElement('button');
    player0.innerHTML = localPlayers[0].name;
    player0.style.padding = "24px 64px";
    div.appendChild(player0);
    player0.addEventListener('click', function(e) {
      socket.emit('votePlayer', 0, index);
    });
  }
  if (localPlayers[1] && 1 != index) {
    var player1 = document.createElement('button');
    player1.innerHTML = localPlayers[1].name;
    player1.style.padding = "24px 64px";
    div.appendChild(player1);
    player1.addEventListener('click', function(e) {
      socket.emit('votePlayer', 1, index);
    });
  }
  if (localPlayers[2] && 2 != index) {
    var player2 = document.createElement('button');
    player2.innerHTML = localPlayers[2].name;
    player2.style.padding = "24px 64px";
    div.appendChild(player2);
    player2.addEventListener('click', function(e) {
      socket.emit('votePlayer', 2, index);
    });
  }
  if (localPlayers[3] && 3 != index) {
    var player3 = document.createElement('button');
    player3.innerHTML = localPlayers[3].name;
    player3.style.padding = "24px 64px";
    div.appendChild(player3);
    player3.addEventListener('click', function(e) {
      socket.emit('votePlayer', 3, index);
    });
  }
  if (localPlayers[4] && 4 != index) {
    var player4 = document.createElement('button');
    player4.innerHTML = localPlayers[4].name;
    player4.style.padding = "24px 64px";
    div.appendChild(player4);
    player4.addEventListener('click', function(e) {
      socket.emit('votePlayer', 4, index);
    });
  }
  if (localPlayers[5] && 5 != index) {
    var player5 = document.createElement('button');
    player5.innerHTML = localPlayers[5].name;
    player5.style.padding = "24px 64px";
    div.appendChild(player5);
    player5.addEventListener('click', function(e) {
      socket.emit('votePlayer', 5, index);
    });
  }
  if (localPlayers[6] && 6 != index) {
    var player6 = document.createElement('button');
    player6.innerHTML = localPlayers[6].name;
    player6.style.padding = "24px 64px";
    div.appendChild(player6);
    player6.addEventListener('click', function(e) {
      socket.emit('votePlayer', 6, index);
    });
  }
  if (localPlayers[7] && 7 != index) {
    var player7 = document.createElement('button');
    player7.innerHTML = localPlayers[7].name;
    player7.style.padding = "24px 64px";
    div.appendChild(player7);
    player7.addEventListener('click', function(e) {
      socket.emit('votePlayer', 7, index);
    });
  }
});
*/

function onMessage(text) {
  var list = document.getElementById('chat');
  var content = document.createElement('li');
  content.innerHTML = text;
  list.appendChild(content);
}

Element.prototype.remove = function() {
  this.parentElement.removeChild(this);
};
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
  for(var i = this.length - 1; i >= 0; i--) {
    if(this[i] && this[i].parentElement) {
      this[i].parentElement.removeChild(this[i]);
    }
  }
};
// Timer function for
function timerFunc(timer) {
  var display = document.getElementById('timediv');
  display.textContent = timer;
}

function timeoutFunc(type) {
  var display = document.getElementById('timediv');
  display.textContent = '';
}

//Removes everything inside of the gameview div
function clear() {
  document.getElementsByClassName('gameview').remove();
  var content = document.createElement('div');
  var timediv = document.createElement('div');
  timediv.id = "timediv";
  content.className = "gameview";
  content.id = "gameview";
  var append = document.getElementById('wrap');
  append.appendChild(content);
  append.appendChild(timediv);

}

var form = document.getElementById('name-form');
form.addEventListener('submit', function(e) {
  var inputName = document.getElementById('name-input').value;
  var inputRoom = document.getElementById('room-input').value;
  document.getElementById('name-input').value = '';
  document.getElementById('room-input').value = '';

  socket.emit('input', inputName, inputRoom);

  e.preventDefault();

});
