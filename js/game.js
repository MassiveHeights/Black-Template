import { AssetManager, GameObject, Sprite, Tween, InitialScale, InitialLife, InitialVelocity, Acceleration, RotationOverLife, ScaleOverLife, Input, Emitter, FloatScatter, ColorOverLife, Ease, BlendMode, TextField } from 'black-engine';

export default class Game extends GameObject {
  constructor() {
    super();

    // Pick default AssetManager
    var assets = AssetManager.default;

    assets.defaultPath = '/assets/';

    // Preload images
    assets.enqueueImage('anvil', 'popart_anvil.png');
    assets.enqueueImage('star', 'particle.png');

    // Listen for a complete message
    assets.on('complete', this.onAssetsLoadded, this);

    // Start preloading all enqueued assets
    assets.loadQueue();
  }

  onAssetsLoadded(m) {

    // Create a sprite
    let sprite = new Sprite('anvil');
    sprite.name = 'anvil';

    // Align object pivot
    sprite.alignPivot();

    sprite.x = this.stage.centerX;
    sprite.y = this.stage.centerY;

    // make this game object touchable so children elements can be able to receive input too
    this.touchable = true;

    // sprite also needs to be touchable
    sprite.touchable = true;

    // Create a emitter
    let emitter = new Emitter();
    emitter.name = 'glow';

    // Addetive blending
    emitter.blendMode = BlendMode.ADD;

    // center emitter
    emitter.x = this.stage.centerX + 10;
    emitter.y = this.stage.centerY - 30;

    // Emit 10 particles
    emitter.emitCount = new FloatScatter(20);

    // With 0 delay
    emitter.emitDelay = new FloatScatter(0);

    // with no interval
    emitter.emitInterval = new FloatScatter(0);

    // for 0.1 second
    emitter.emitDuration = new FloatScatter(0.1);

    // and repeat this forever!
    emitter.emitNumRepeats = new FloatScatter(Infinity);

    // Pick a texture for emitting
    emitter.textures = [AssetManager.default.getTexture('star')];

    // Render all particles inside this GameObject
    emitter.space = this;

    // No one lives forever
    emitter.add(new InitialLife(0.3, 0.4));

    // Initialize every particles with a random velocity inside a box
    emitter.add(new InitialVelocity(-500, -500, 500, 500));

    // Let particles change the color over life
    emitter.add(new ColorOverLife(0xf16c20, 0xfc3aa4));

    // Make them smaller over lief
    emitter.add(new ScaleOverLife(2, 0));

    sprite.on('pointerDown', x => {
      let tween = new Tween({ alpha: 0 }, 1, { delay: 0.2 });
      sprite.addComponent(tween);
    });

    // Add both sprite and emitter onto the stage

    this.addChild(emitter);
    this.addChild(sprite);
  }
}