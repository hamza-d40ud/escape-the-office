// scenes/FloorScene.js
import { Scene } from 'phaser';
import { Player } from '../Entities/Player';


export class FloorScene extends Scene {
	constructor() {
		super('FloorScene');

	}

	preload() {
		this.load.atlas('soldier', 'assets/animations/soldier.png', 'assets/animations/soldier.json');

		this.anims.create({
			key: 'walk-down',
			frames: this.anims.generateFrameNumbers('soldier', { start: 0, end: 3 }),
			frameRate: 8,
			repeat: -1
		});


		this.add.image(512, 384, 'background').setAlpha(0.5);
	}

	create() {
		this.player = new Player(this, 100, 100);

		// Optional: camera follow
		this.cameras.main.startFollow(this.player.sprite);
	}

	update() {
		this.player.update()
	}

	destroy() {
		this.player.destroy();
	}
}

