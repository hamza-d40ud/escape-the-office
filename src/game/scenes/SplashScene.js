import { Scene } from 'phaser';

export class SplashScene extends Scene {
	constructor() {
		super('SplashScene');
	}

	create() {
		const { width, height } = this.scale;

		const video = this.add.video(width / 2, height / 2, 'splash_video');
		video.play();

		video.once('complete', () => {
			this.scene.start('MainMenu');
		});
	}
}
