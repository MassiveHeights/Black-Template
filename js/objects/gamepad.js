import { Input, Sprite, DisplayObject } from 'black-engine';

export default class Gamepad extends DisplayObject {
  constructor(stage) {
    super();

    this._topBtn = null;
    this._rightBtn = null;
    this._bottomBtn = null;
    this._leftBtn = null;
    this._isStartSelect = false;
    this._stage = stage;

    this._arrowsCenterX = this._stage.bounds.x + 200;
    this._arrowsCenterY = this._stage.bounds.y + this._stage.bounds.height - 200;

    this._distFromCenter = 100;

    this._init();
  }

  _init() {
    this.touchable = true;

    this._createTopBtn()
    this._createRightBtn();
    this._createBottomBtn()
    this._createLeftBtn();
    this._createActBtn();
  }

  _createTopBtn() {
    this._topBtn = new Sprite('button');
    this._topBtn.name = 'Button';
    this._topBtn.x = this._arrowsCenterX;
    this._topBtn.y = this._arrowsCenterY - this._distFromCenter;
    this._topBtn.scaleY = 0.4;
    this._topBtn.scaleX = 0.4;
    this._topBtn.rotation = 0;
    this._topBtn.touchable = true;
    this._topBtn.alignPivot();
    this.add(this._topBtn);
    this._topBtn.on(Input.POINTER_DOWN, this._goToTop, this);

  }

  _createRightBtn() {
    this._rightBtn = new Sprite('button');
    this._rightBtn.name = 'Button';
    this._rightBtn.x = this._arrowsCenterX + this._distFromCenter;
    this._rightBtn.y = this._arrowsCenterY;
    this._rightBtn.scaleY = 0.4;
    this._rightBtn.scaleX = 0.4;
    this._rightBtn.rotation = 90 * (Math.PI / 180);
    this._rightBtn.touchable = true;
    this._rightBtn.alignPivot();
    this.add(this._rightBtn);
    this._rightBtn.on(Input.POINTER_DOWN, this._goToRight, this);
  }

  _createBottomBtn() {
    this._bottomBtn = new Sprite('button');
    this._bottomBtn.name = 'Button';
    this._bottomBtn.x = this._arrowsCenterX;
    this._bottomBtn.y = this._arrowsCenterY + this._distFromCenter;
    this._bottomBtn.scaleY = 0.4;
    this._bottomBtn.scaleX = 0.4;
    this._bottomBtn.rotation = 180 * (Math.PI / 180);
    this._bottomBtn.touchable = true;
    this._bottomBtn.alignPivot();
    this.add(this._bottomBtn);
    this._bottomBtn.on(Input.POINTER_DOWN, this._goToBottom, this);
  }

  _createLeftBtn() {
    this._leftBtn = new Sprite('button');
    this._leftBtn.name = 'Button';
    this._leftBtn.x = this._arrowsCenterX - this._distFromCenter;
    this._leftBtn.y = this._arrowsCenterY;
    this._leftBtn.scaleY = 0.4;
    this._leftBtn.scaleX = 0.4;
    this._leftBtn.rotation = -90 * (Math.PI / 180);
    this._leftBtn.touchable = true;
    this._leftBtn.alignPivot();
    this.add(this._leftBtn);
    this._leftBtn.on(Input.POINTER_DOWN, this._goToLeft, this);
  }

  _createActBtn() {
    this._actBtn = new Sprite('button-act');
    this._actBtn.name = 'Button';
    this._actBtn.x = this._stage.bounds.x + this._stage.bounds.width - (this._stage.bounds.width / 10);
    this._actBtn.y = this._arrowsCenterY;
    this._actBtn.scaleY = 0.5;
    this._actBtn.scaleX = 0.5;
    this._actBtn.rotation = 0;
    this._actBtn.touchable = true;
    this._actBtn.alignPivot();
    this.add(this._actBtn);
    this._actBtn.on(Input.POINTER_DOWN, this._goToAct, this);
  }

  _goToTop() {
    this.post('move', 'TOP');
  }

  _goToRight() {
    this.post('move', 'RIGHT');
  }

  _goToBottom() {
    this.post('move', 'DOWN');
  }

  _goToLeft() {
    this.post('move', 'LEFT');
  }

  _goToAct() {

    if (this._isStartSelect == false) {
      this.post('select', 'START');
      this._isStartSelect = true;
    } else {
      this.post('select', 'STOP');
      this._isStartSelect = false;
    }

  }

}
