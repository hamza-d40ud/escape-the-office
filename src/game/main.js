import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { FloorScene } from './scenes/FloorScene';
import { MainMenu } from './scenes/MainMenu';
import { GameWon } from './scenes/GameWon';
import { Preloader } from './scenes/Preloader';
import { CutsceneScene } from './scenes/CutsceneScene';
import { SplashScene } from './scenes/SplashScene';
import { AUTO, Game } from 'phaser';
import { LeaderboardScene } from './scenes/LeaderboardScene';

import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
	type: AUTO,
	width: 3840,
	height: 2160,
	parent: 'game-container',
	backgroundColor: '#000000',
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH
	},
	pixelArt: true,
	render: {
		antialias: false,
	},
	physics: {
		default: 'arcade'
	},
	scene: [
		Boot,
		Preloader,
		MainMenu,
		MainGame,
		FloorScene,
		GameOver,
		GameWon,
		LeaderboardScene,
		CutsceneScene,
		SplashScene
	],
	plugins: {
		global: [{
			key: 'rexVirtualJoystick',
			plugin: VirtualJoystickPlugin,
			start: true
		}]
	}
};

const StartGame = (parent) => {
	return new Game({ ...config, parent });

}

export default StartGame;
