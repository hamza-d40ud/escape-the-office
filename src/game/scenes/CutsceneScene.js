import { Scene } from 'phaser';

export class CutsceneScene extends Scene {
	constructor() {
		super('CutsceneScene');
	}

	create(data) {
		const { width, height } = this.scale;
		const videoName = data && data.video_name ? data.video_name : 'karam_cutscene';
		const video = this.add.video(width / 2, height / 2, videoName);
		video.setDisplaySize(width, height);
		video.play(true);

		video.once('complete', () => {
			this.scene.start('GameOver');
		});

		this.input.once('pointerdown', () => {
			video.stop();
			this.scene.start('GameOver');
		});
	}
} 