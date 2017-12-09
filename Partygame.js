'use strict';

var socket = require('socket.io-client');

const ROUND = 1;

class Partygame {
  constructor(host, players, roomcode) {
    this._players = players;
    this._host = host;
    this._init();
  }

  _init() {
    this._players.forEach((player, index) => {
      player.sock.emit('msg', 'Game is starting, you are player ' + index);
      player.sock.emit('clear');
    });
    this._host.emit('pickCategory');
    this._host.on('categoryTimeout', categoryChoosen);
  }
}

function categoryChoosen(category){
  if (category == 'point') {
    this._host.emit('msg', 'Someone chose point :)))');
  }
}

module.exports = Partygame;
