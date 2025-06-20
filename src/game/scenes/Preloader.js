import { Scene } from 'phaser';

export class Preloader extends Scene {
	constructor() {
		super('Preloader');
	}

	init() {
		//  We loaded this image in our Boot Scene, so we can display it here
		this.add.image(512, 384, 'background');

		//  A simple progress bar. This is the outline of the bar.
		this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

		//  This is the progress bar itself. It will increase in size from the left based on the % of progress.
		const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

		//  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
		this.load.on('progress', (progress) => {
			//  Update the progress bar (our bar is 464px wide, so 100% = 464px)
			bar.width = 4 + (460 * progress);
		});
	}

	preload() {
		//  Load the assets for the game - Replace with your own assets
		this.load.setPath('assets');

		this.load.image('mainmenu', 'Main.png');

		this.load.image('logo', 'logo.png');

		this.load.audio('running', 'audio/running.mp3');

		this.load.audio('steps', 'audio/steps.wav');

		this.load.image('tiles', 'maps/tilemap.png');
		this.load.tilemapTiledJSON('map', 'maps/level1.json');

		this.load.atlas('soldier', 'animations/soldier.png', 'animations/soldier.json');


		this.load.atlas('stand-right', 'animations/StandingRight.png', 'animations/StandingRight.json');
		this.load.atlas('stand-left', 'animations/StandingLeft.png', 'animations/StandingLeft.json');
		this.load.atlas('run-left', 'animations/RunningLeft.png', 'animations/RunningLeft.json');
		this.load.atlas('run-right', 'animations/RunningRight.png', 'animations/RunningRight.json');

		this.load.audio('bgm', 'audio/floor_1_bg.wav');
		this.load.audio('rida_1', 'audio/rida_1.mp3');
	}

	create() {
		//  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
		//  For example, you can define global animations here, so we can use them in other scenes.

		//  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
		this.scene.start('MainMenu');
	}
}
