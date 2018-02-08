import { Black, GameObject, Sprite, AssetManager } from 'black';

export default class Game extends GameObject {
  constructor() {
    super();

    // Pick up default AssetManager
    var assets = AssetManager.default;

    assets.defaultPath = '/assets/';

    // Preload images
    assets.enqueueImage('bg', 'popart_bg_gre_4.png');
    assets.enqueueImage('anvil', 'popart_anvil.png');

    // Listen for a complete message
    assets.on('complete', this.onAssetsLoadded, this);

    // Start preloading all enqueued assets
    assets.loadQueue();
  }

  onAssetsLoadded(m) {
    // Create and add background
    this.addChild(new Sprite('bg'));

    // Create a sprite
    let sprite = new Sprite('anvil');

    // Align object pivot
    sprite.alignPivot();

    sprite.x = this.stage.centerX;
    sprite.y = this.stage.centerY;

    this.addChild(sprite);
  }
}