import { Scene } from 'phaser';

export class Preloader extends Scene {
	constructor() {
		super('Preloader');
	}

	init() {
		//  We loaded this image in our Boot Scene, so we can display it here
		const centerX = 3840 / 2;
		const centerY = 2160 / 2;

		// this.add.image(centerX, centerY, 'background');

		//  A simple progress bar. This is the outline of the bar.
		const barWidth = 1404; // 36.5% of width, similar ratio as before
		const barHeight = 64;  // doubled from 32 for higher res
		this.add.rectangle(centerX, centerY, barWidth, barHeight).setStrokeStyle(2, 0xffffff);

		//  This is the progress bar itself. It will increase in size from the left based on the % of progress.
		const bar = this.add.rectangle(centerX - (barWidth / 2) + 4, centerY, 8, barHeight - 8, 0xffffff);

		//  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
		this.load.on('progress', (progress) => {
			//  Update the progress bar (our bar is barWidth px wide, so 100% = barWidth px)
			bar.width = 8 + ((barWidth - 8) * progress);
		});
	}

	preload() {
		//  Load the assets for the game - Replace with your own assets
		this.load.setPath('assets');

		this.load.image('mainmenu', 'Main.png');

		this.load.image('logo', 'logo.png');
		this.load.image('checkbox_off', 'checkbox_off.png');
		this.load.image('checkbox_on', 'checkbox_on.png');
		this.load.image('phone', 'phone.png');
		this.load.image('run', 'run.png');

		this.load.audio('running', 'audio/FOOTSTEPS.wav');

		this.load.audio('steps', 'audio/FOOTSTEPS.wav');

		this.load.image('tiles', 'maps/spritesheet.png');
		this.load.tilemapTiledJSON('floor1', 'maps/floor1.json');
		this.load.tilemapTiledJSON('floor2', 'maps/floor2.json');
		this.load.tilemapTiledJSON('floor3', 'maps/floor3.json');

		this.load.atlas('soldier', 'animations/soldier/soldier.png', 'animations/soldier/soldier.json');


		this.load.atlas('stand-right', 'animations/mainPlayer/StandingRight.png', 'animations/mainPlayer/StandingRight.json');
		this.load.atlas('stand-left', 'animations/mainPlayer/StandingLeft.png', 'animations/mainPlayer/StandingLeft.json');
		this.load.atlas('run-left', 'animations/mainPlayer/RunningLeft.png', 'animations/mainPlayer/RunningLeft.json');
		this.load.atlas('run-right', 'animations/mainPlayer/RunningRight.png', 'animations/mainPlayer/RunningRight.json');
		
		this.load.atlas('run-left-farah', 'animations/Farah/FarahWalkingLeft.png', 'animations/Farah/FarahWalkingLeft.json');
		this.load.atlas('run-right-farah', 'animations/Farah/FarahWalkingRight.png', 'animations/Farah/FarahWalkingRight.json');

		this.load.atlas('run-left-karam', 'animations/Karam/KaramWalkingLeft.png', 'animations/Karam/KaramWalkingLeft.json');
		this.load.atlas('run-right-karam', 'animations/Karam/KaramWalkingRight.png', 'animations/Karam/KaramWalkingRight.json');

		this.load.atlas('run-left-tala', 'animations/Tala/TalaWalkingLeft.png', 'animations/Tala/TalaWalkingLeft.json');
		this.load.atlas('run-right-tala', 'animations/Tala/TalaWalkingRight.png', 'animations/Tala/TalaWalkingRight.json');

		this.load.atlas('run-left-rida', 'animations/Rida/RidaWalkingLeft.png', 'animations/Rida/RidaWalkingLeft.json');
		this.load.atlas('run-right-rida', 'animations/Rida/RidaWalkingRight.png', 'animations/Rida/RidaWalkingRight.json');
		
		this.load.atlas('run-left-yasser', 'animations/Yasser/YasserWalkingLeft.png', 'animations/Yasser/YasserWalkingLeft.json');
		this.load.atlas('run-right-yasser', 'animations/Yasser/YasserWalkingRight.png', 'animations/Yasser/YasserWalkingRight.json');

		this.load.audio('bgm', 'audio/Main game music.mp3');
		this.load.audio('main_menu_m', 'audio/Main menu music.mp3');
		this.load.audio('Rida', 'audio/Rida.mp3');
		this.load.audio('Tala', 'audio/Tala.mp3');
		this.load.audio('Karam', 'audio/Karam.mp3');
		this.load.audio('Farah', 'audio/Farah.mp3');
		this.load.audio('Yasser', 'audio/Yasser.mp3');
		this.load.audio('success', 'audio/objective done.mp3');
		this.load.audio('vocal_cute_angry', 'audio/Vibrant_UI_Mouse_Click_1.wav');
		this.load.audio('dashing', 'audio/Vibrant_UI_Mouse_Click_1.wav');
		this.load.audio('game_over', 'audio/Game Over.mp3');
		this.load.audio('win', 'audio/win.wav');

		this.load.video('farah_cutscene', 'cutscenes/farah_cutscene.mp4', 'loadeddata', false, true);
		this.load.video('tala_cutscene', 'cutscenes/tala_cutscene.mp4', 'loadeddata', false, true);
		this.load.video('karam_cutscene', 'cutscenes/karam_cutscene.mp4', 'loadeddata', false, true);
		this.load.video('yasser_cutscene', 'cutscenes/yasser_cutscene.mp4', 'loadeddata', false, true);
		this.load.video('rida_cutscene', 'cutscenes/rida_cutscene.mp4', 'loadeddata', false, true);
		this.load.video('splash_video', 'video/Splash screen.mp4', 'loadeddata', false, true);
	}

	create() {
		//  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
		//  For example, you can define global animations here, so we can use them in other scenes.

		// Move to the SplashScene (which will play a splash video) instead of MainMenu
		this.scene.start('SplashScene');
	}
}
