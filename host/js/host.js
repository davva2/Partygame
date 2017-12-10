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
socket.on('timer', timerFunc);
socket.on('timeout', timeoutFunc);
socket.on('msg', onMessage);


/*
socket.on('pickCategory', function() {
  var disp = document.getElementById("time");
  startTimer(20, disp, 'categoryTimeout');
});
*/


function displayStartButton() {
  btn = document.getElementById('startButton');
  document.getElementById('startButton').style.visibility = "visible";
  btn.addEventListener('click', function(e) {
    socket.emit('startgame');
    document.getElementById('startButton').style.visibility = "hidden";

  });
}

function onMessage(text) {
  var list = document.getElementById('chat');
  var content = document.createElement('li');
  content.innerHTML = text;
  list.appendChild(content);
}

// Timer function for
function timerFunc(timer) {
  var display = document.getElementById('timediv');

  display.textContent = timer;
}

function timeoutFunc(type) {
  var display = document.getElementById('timediv');
  display.textContent = '';
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
