import { GameObject } from 'black-engine';
import Gamepad from './gamepad';
import Player from './player';

export default class UI extends GameObject {
  constructor(stage) {
    super();
    this._gamepad = null;
    this._player = null;

    this._init(stage);
  }

  _init(stage) {
    this.touchable = true;

    this._player = this.addChild(new Player(stage));

    this._gamepad = this.addChild(new Gamepad(stage));
    this._gamepad.on('move', this._onMove, this);
    this._gamepad.on('select', this._onSelect, this);

  }

  _onMove(msg, value) {
    console.log("move :", value);
    this._player.move(value);
  }

  _onSelect(msg, value) {
    console.log("select :", value);
    this._player.setType(value);
  }


}
