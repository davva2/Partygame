'use strict';

const ROUND = 1;

class Partygame {
    constructor(sock1, sock2) {
        this._players = [sock1, sock2];
        this._turns = [];

        //this._init();
    }
}

module.exports = Partygame;