import { Scene } from 'phaser';

export class CutsceneScene extends Scene {
	constructor() {
		super('CutsceneScene');
	}

	create(data) {
		const { width, height } = this.scale;

		// Stop all sounds before video
		this.sound.stopAll();

		const videoName = data?.video_name || 'karam_cutscene';
		const video = this.add.video(width / 2, height / 2, videoName);

		video.setMute(false);
		video.setVolume(1);
		video.play(false); // no loop


		video.once('complete', () => {
			video.pause(); // freeze on last frame

			// Allow clicking anywhere to go to MainMenu
			this.input.once('pointerdown', () => {
				video.stop();
				this.scene.start('MainMenu');
			});
		});
	}
}
