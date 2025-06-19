// scenes/FloorScene.js
import { Scene } from 'phaser';
import { Player } from '../Entities/Player';


export class FloorScene extends Scene {
	constructor() {
		super('FloorScene');

	}

	preload() {
		this.load.image('player', 'assets/player.png');
		this.load.image('joystick', 'assets/Joystick.png');
		this.load.image('handle', 'assets/LargeHandleFilledGrey.png');
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

