'use strict';

var socket = require('socket.io-client');

const ROUND = 1;

class Partygame {
    constructor(players, roomcode) {
        this._players = players;
        this._init();
    }

    _init() {
      this._players.forEach((player, index) => {
        player.sock.emit('msg', 'Game is starting, you are player ' + index);
      });
    }
}

module.exports = Partygame;
