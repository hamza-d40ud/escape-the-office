// scenes/FloorScene.js
import { Scene } from 'phaser';
import { Player } from '../Entities/Player';


export class FloorScene extends Scene {
	constructor() {
		super('FloorScene');

	}

	preload() {
		this.load.image('tiles', 'assets/maps/tilemap.png');
		this.load.tilemapTiledJSON('map', 'assets/maps/level1.json');

		this.load.atlas('soldier', 'assets/animations/soldier.png', 'assets/animations/soldier.json');
	}

	create() {
		this.map = this.make.tilemap({ key: 'map' });
		const tileset = this.map.addTilesetImage('main_tailset', 'tiles');
		const mainLayer = this.map.createLayer('main', tileset, 0, 0);
		const objectsLayer = this.map.createLayer('objects', tileset, 0, 0);

		objectsLayer.setCollisionByProperty({ collides: true });

		
		this.player = new Player(this, 0, 0);
		
		this.physics.add.collider(this.player.sprite, objectsLayer);
		
		this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
		this.uiCamera.ignore([mainLayer, objectsLayer, this.player.sprite]);
		
		this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
		this.cameras.main.startFollow(this.player.sprite);
		const desiredHeight = 350;
		const zoom = this.scale.height / desiredHeight;
		this.cameras.main.setZoom(zoom);
		this.cameras.main.ignore([
			this.player.joystickBase,
			this.player.joystickThumb
		]);

// 		const debugGraphics = this.add.graphics().setAlpha(0.75);
// objectsLayer.renderDebug(debugGraphics, {
//   tileColor: null,
//   collidingTileColor: new Phaser.Display.Color(255, 0, 0, 255), // Red
//   faceColor: new Phaser.Display.Color(0, 255, 0, 255) // Green
// });
		
	}

	update() {
		this.player.update()
	}

	destroy() {
		this.player.destroy();
	}
}

