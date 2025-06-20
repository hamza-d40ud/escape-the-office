import { Scene } from 'phaser';
import GameManager from '../Managers/GameManager';

export class GameWon extends Scene {
	constructor() {
		super('GameWon');
	}

	create() {
		this.cameras.main.setBackgroundColor(0xff0000);

		this.add.image(512, 384, 'background').setAlpha(0.5);

		this.add.text(512, 384, 'Congratulation you have escaped!!', {
			fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
			stroke: '#000000', strokeThickness: 8,
			align: 'center'
		}).setOrigin(0.5);

		let score = GameManager.score;

		this.add.text(512, 484, 'Score: ' + score, {
			fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
			stroke: '#000000', strokeThickness: 8,
			align: 'center'
		}).setOrigin(0.5);

		this.input.once('pointerdown', () => {
			this.scene.start('MainMenu');
		});
	}
}
