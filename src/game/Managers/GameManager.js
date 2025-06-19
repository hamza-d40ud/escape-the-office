// managers/GameManager.js
import Phaser from 'phaser';

var floors = [
	{
		mapkey: 'map',
		player: {
			x: 100,
			y: 100,
		},
		npcs: [
			{
				x: 300,
				y: 500,
				path: [
					{ x: 300, y: 500 },
					{ x: 200, y: 300 },
				]
			},
			{
				x: 200,
				y: 100,
				path: [
					{ x: 200, y: 100 },
					{ x: 200, y: 300 },
				]
			}
		],
		timer: 3 * 60,
		backgroundmusic: 'bgm',
	},
	{
		mapkey: 'map',
		player: {
			x: 400,
			y: 600,
		},
		npcs: [
			{
				x: 300,
				y: 500,
				path: [
					{ x: 300, y: 500 },
					{ x: 200, y: 300 },
				]
			},
			{
				x: 200,
				y: 100,
				path: [
					{ x: 200, y: 100 },
					{ x: 200, y: 300 },
				]
			}
		],
		timer: 2 * 60,
		backgroundmusic: 'bgm',
	}
];

class GameManager extends Phaser.Events.EventEmitter {
	constructor() {
		super()

		this.currentFloor = 0;
		this.maxFloors = floors.length;
		this.currentScene = null; // to hold active scene reference
	}

	startGame(scene) {
		this.currentFloor = 1;
		scene.scene.start('FloorScene', { floor: 1 });
	}

	nextFloor() {
		if (this.currentFloor < this.maxFloors) {
			this.currentFloor++;
			this.emit('floor-started', { floor: this.currentFloor });
		} else {
			this.emit('game-won');
			this.currentScene.scene.start('GameWon');
		}
	}

	setScene(scene) {
		this.currentScene = scene;
	}

	getFloorData(floor) {
		return floors[floor - 1];
	}
}

export default GameManager = new GameManager();
