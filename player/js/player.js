var sock = io();

sock.emit('player');

sock.on('msg', onMessage);
sock.on('clear', clear);
sock.on('gamemsg', gameMessage);

sock.on('name', function (name) {
    var displayname = document.getElementById('name-display');
    displayname.innerHTML = name;
});

function gameMessage(text) {
  var list = document.getElementById('gv');
  var content = document.createElement('li');
  content.innerHTML = text;
  list.appendChild(content);
}

function onMessage(text) {
    var list = document.getElementById('chat');
    var content = document.createElement('li');
    content.innerHTML = text;
    list.appendChild(content);
}

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}
//Removes everything inside of the gameview div
function clear() {
  document.getElementsByClassName('gameview').remove();
  var content = document.createElement('div');
  content.className = "gameview";
  content.id = "gv";
  var append = document.getElementById('wrap');
  append.appendChild(content);
}

function fakerMode(){
  document.getElementsByClassName('gameview').innerHTML = "Du är faker";
}

var form = document.getElementById('name-form');
form.addEventListener('submit', function(e) {
var inputName = document.getElementById('name-input').value;
var inputRoom = document.getElementById('room-input').value;
document.getElementById('name-input').value = '';
document.getElementById('room-input').value = '';

sock.emit('input', inputName, inputRoom);

e.preventDefault();

});
