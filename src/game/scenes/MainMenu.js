import { Scene } from 'phaser';

import GameManager from '../Managers/GameManager.js';

export class MainMenu extends Scene {
	constructor() {
		super('MainMenu');
	}

	create() {
		//  And some events
		this.input.on('gameobjectdown', (pointer, gameObject) => {

			fork.x = pointer.x;
			fork.y = pointer.y;

			label.setText(gameObject.name);
			label.x = gameObject.x;
			label.y = gameObject.y;

		});

		this.add
			.image(0, 0, 'mainmenu')
			.setDisplaySize(this.scale.width, this.scale.height)
			.setOrigin(0, 0)
			.setScrollFactor(0);

		this.input.once('pointerdown', () => {
			GameManager.startGame(this);
			this.scene.start('FloorScene', { floor: 1 });
		});
	}
}
