import { Scene } from 'phaser';
import GameManager from '../Managers/GameManager';

export class GameWon extends Scene {
	constructor() {
		super('GameWon');
	}

	create() {
		this.cameras.main.setBackgroundColor(0xff0000);

		this.add
			.image(0, 0, 'background')
			.setDisplaySize(this.scale.width, this.scale.height)
			.setOrigin(0, 0)
			.setScrollFactor(0);

		this.add.text(this.scale.width * 0.5, this.scale.height * 0.5, 'Congratulation you have escaped!!', {
			fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
			stroke: '#000000', strokeThickness: 8,
			align: 'center'
		}).setOrigin(0.5);

		let score = GameManager.score;

		this.add.text(this.scale.width * 0.5, this.scale.height * 0.6, 'Score: ' + score, {
			fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
			stroke: '#000000', strokeThickness: 8,
			align: 'center'
		}).setOrigin(0.5);

		this.gameWonMusic = this.sound.add('win', {
			loop: true,
			
		});
		this.gameWonMusic.play();
		this.events.on('shutdown', this.stopGameWonMusic, this);
		this.events.on('destroy', this.stopGameWonMusic, this);

		this.input.once('pointerdown', () => {
			this.scene.start('MainMenu');
		});
	}

	stopGameWonMusic() {
		if (this.gameWonMusic) {
			this.gameWonMusic.stop();
		}
	}
}
