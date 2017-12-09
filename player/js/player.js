var socket = io();

socket.emit('player');

socket.on('msg', onMessage);
socket.on('clear', clear);
socket.on('gamemsg', gameMessage);

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
    socket.emit('categoryTimeout', 'point');
  });
  choice2.addEventListener('click', function(e) {
    socket.emit('categoryTimeout', 'hand');
  });
  choice1.innerHTML = 'You gotta point';
  choice2.innerHTML = 'Hands up';
  choice1.style.padding = "24px 64px";
  choice2.style.padding = "24px 64px";
  var div = document.getElementById('gameview');
  div.appendChild(choice1);
  div.appendChild(choice2);
});

function onMessage(text) {
  var list = document.getElementById('chat');
  var content = document.createElement('li');
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

//Removes everything inside of the gameview div
function clear() {
  document.getElementsByClassName('gameview').remove();
  var content = document.createElement('div');
  content.className = "gameview";
  content.id = "gameview";
  var append = document.getElementById('wrap');
  append.appendChild(content);
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
