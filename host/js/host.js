var audio = new Audio('bonetrousle.mp3');
audio.play();

var socket = io();

socket.emit('host');
socket.on('room', gameLobby);

function gameLobby(ip, roomcode) {
    document.getElementById('display').innerHTML = ('Join the game at: ' + ip + ':1337 with the code ' + roomcode)

    onMessage('Waiting for players');
};

socket.on('gameready', displayStartButton)

socket.on('msg', onMessage);

function displayStartButton() {
    document.getElementById('startButton').style.visibility = "visible";
}

function onMessage(text) {
    var list = document.getElementById('chat');
    var content = document.createElement('li');
    content.innerHTML = text;
    list.appendChild(content);
};
