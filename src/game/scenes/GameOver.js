import { Scene } from 'phaser';
import GameManager from '../Managers/GameManager';

export class GameOver extends Scene {
	constructor() {
		super('GameOver');
	}

	create() {
		// this.cameras.main.setBackgroundColor(0xff0000);

		this.add
			.image(0, 0, 'background')
			.setDisplaySize(this.scale.width, this.scale.height)
			.setOrigin(0, 0)
			.setScrollFactor(0);

		this.add.text(this.scale.width * 0.5, this.scale.height * 0.5, 'Game Over', {
			fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
			stroke: '#000000', strokeThickness: 8,
			align: 'center'
		}).setOrigin(0.5);

		// let score = GameManager.score;

		// this.add.text(this.scale.width * 0.5, this.scale.height * 0.6, 'Score: ' + score, {
		// 	fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
		// 	stroke: '#000000', strokeThickness: 8,
		// 	align: 'center'
		// }).setOrigin(0.5);
		
		this.gameOverMusic = this.sound.add('game_over', {
			loop: true,
			
		});
		this.gameOverMusic.play();
		// Clean up music when scene is shutdown or destroyed
		this.events.on('shutdown', this.stopGameOverMusic, this);
		this.events.on('destroy', this.stopGameOverMusic, this);

		this.input.once('pointerdown', () => {
			this.scene.start('MainMenu');
		});
	}

	stopGameOverMusic() {
		if (this.gameOverMusic) {
			this.gameOverMusic.stop();
		}
	}
}
