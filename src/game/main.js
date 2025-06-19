import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { FloorScene } from './scenes/FloorScene';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { AUTO, Game } from 'phaser';

import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
	type: AUTO,
	width: 1920,
	height: 1072,
	parent: 'game-container',
	backgroundColor: '#028af8',
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
		GameOver,
		FloorScene
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
