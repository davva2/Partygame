var sock = io();

sock.emit('client');

sock.on('msg', onMessage);
sock.on('name', function (name) {
    var displayname = document.getElementById('name-display');
    displayname.innerHTML = name;
});

function onMessage(text) {
    var list = document.getElementById('chat');
    var content = document.createElement('li');
    content.innerHTML = text;
    list.appendChild(content);
}

var form = document.getElementById('name-form');
form.addEventListener('submit', function(e) {
var inputName = document.getElementById('name-input').value;
var inputRoom = document.getElementById('room-input').value;
document.getElementById('name-input').value = '';
document.getElementById('room-input').value = '';

sock.emit('msg', inputName, inputRoom);

e.preventDefault();
});

