import { Scene } from 'phaser';

export class firstFloor extends Scene {
  constructor() {
    super('firstFloor');
  }

  preload() {
    // Load the tileset image and tilemap JSON
    this.load.image('tiles', 'assets/maps/tilemap.png');
    this.load.tilemapTiledJSON('map', 'assets/maps/map1.json');

    // Load a player sprite (placeholder)
    this.load.spritesheet('player', 'assets/sprites/player.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    // Create tilemap and layer
    const map = this.make.tilemap({ key: 'map', tileHeight: 16, tileWidth: 16 });
    const tileset = map.addTilesetImage('tile1', 'tiles');
    const mainLayer = map.createLayer('main', tileset, 0, 0);
    const objcetsLayer = map.createLayer('object', tileset, 0, 0);

    // Scale the tilemap layer
    const scaleX = this.cameras.main.width / mainLayer.width;
    const scaleY = this.cameras.main.height / mainLayer.height;
    mainLayer.setScale(scaleX, scaleY);
    objcetsLayer.setScale(scaleX, scaleY);
    // Enable collisions for tiles with the "collides" property set in Tiled
    objcetsLayer.setCollisionByProperty({ collides: true });

    // Add player
    this.player = this.physics.add.sprite(100, 100, 'player', 0);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(scaleX, scaleY); // match map scale if needed

    // Collide player with tilemap
    this.physics.add.collider(this.player, objcetsLayer);

    // Set up cursors for movement
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    const speed = 100;
    const player = this.player;
    const cursors = this.cursors;

    player.setVelocity(0);

    if (cursors.left.isDown) {
      player.setVelocityX(-speed);
    } else if (cursors.right.isDown) {
      player.setVelocityX(speed);
    }

    if (cursors.up.isDown) {
      player.setVelocityY(-speed);
    } else if (cursors.down.isDown) {
      player.setVelocityY(speed);
    }
  }
}
