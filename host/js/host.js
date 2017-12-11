//var audio = new Audio('bonetrousle.mp3');
//audio.play();

var socket = io();

socket.emit('host');
socket.on('room', gameLobby);

function gameLobby(ip, roomcode) {
  document.getElementById('display').innerHTML = ('Join the game at: ' + ip + ':1337 with the code ' + roomcode);

  onMessage('Waiting for players');
}

socket.on('gameready', displayStartButton);
socket.on('timer', timerFunc)
socket.on('timeout', timeoutFunc);
socket.on('msg', onMessage);
socket.on('clear', clear)
//socket.on('gamemsg', gameMessage);

/*
socket.on('pickCategory', function() {
  var disp = document.getElementById("time");
  startTimer(20, disp, 'categoryTimeout');
});
*/

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


function displayStartButton() {
  btn = document.getElementById('startButton');
  document.getElementById('startButton').style.visibility = "visible";
  btn.addEventListener('click', function(e) {
    socket.emit('startgame');
    onMessage('Game has been started!');
    document.getElementById('startButton').style.visibility = "hidden";

  });
}

function onMessage(text) {
  var list = document.getElementById('gameview');
  var content = document.createElement('li');
  content.innerHTML = text;
  list.appendChild(content);
}
/*
function gameMessage(text) {
  var list = document.getElementById('gameview');
  var content = document.createElement('li');
  content.innerHTML = text;
  list.appendChild(content);
}
*/
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

/////
/*
function startTimer(timer, display, type) {
  var k = setInterval(function () {
    display.textContent = timer;
    if (timer > 0) {
      timer = timer-1;
    }
    else{
      socket.emit(type, 'point');
      clearInterval(k);
    }
  }, 1000);
}
*/
