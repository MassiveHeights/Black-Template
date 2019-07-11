import { Sprite, DisplayObject } from 'black-engine';

export default class Player extends DisplayObject {
  constructor(stage) {
    super();

    this._player = null;
    this._stage = stage;

    this._init();
  }

  _init() {
    this._createPlayer();
  }

  _createPlayer() {
    this._player = new Sprite('player');
    this._player.name = 'Player';
    this._player.x = 100;
    this._player.y = 100;
    this._player.scaleY = 0.4;
    this._player.scaleX = 0.4;
    this._player.rotation = 0;
    this._player.alignPivot();
    this.add(this._player);

  }

  move(value) {

    if (value === "TOP") {
      this._player.y -= 50;
    }

    if (value === "RIGHT") {
      this._player.x += 50;
    }

    if (value === "DOWN") {
      this._player.y += 50;
    }

    if (value === "LEFT") {
      this._player.x -= 50;
    }

  }

  setType(val) {
    if (val === "START") {
      this._player.textureName = "player-act";
    }

    if (val === "STOP") {
      this._player.textureName = "player";
    }
  }

}
