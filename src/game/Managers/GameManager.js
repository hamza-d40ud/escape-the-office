// managers/GameManager.js
import Phaser from 'phaser';

var floors = [
	{
		mapkey: 'floor1',
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
				],
				sound: 'rida_1'
			},
			{
				x: 200,
				y: 100,
				path: [
					{ x: 200, y: 100 },
					{ x: 200, y: 300 },
				],
				sound: 'rida_1'
			}
		],
		timer: 3 * 60,
		backgroundmusic: 'bgm',
		objectives: [
			{
				title: "Get your keys",
				type: 1,
				key: "keys",
				required: true,
				score: 100,
			}
		],
	},
	{
		mapkey: 'floor2',
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
				],
				sound: 'rida_1'
			},
			{
				x: 200,
				y: 100,
				path: [
					{ x: 200, y: 100 },
					{ x: 200, y: 300 },
				],
				sound: 'rida_1'
			}
		],
		timer: 2 * 60,
		backgroundmusic: 'bgm',
		objectives: [
			{
				title: "Get your keys",
				type: 1,
				key: "keys",
				required: true,
				score: 100,
			},
			{
				title: "Clock out",
				type: 2,
				key: "clock_out",
				required: true,
				score: 100,
			},
			{
				title: "Drink water",
				type: 3,
				key: "water",
				required: false,
				score: 300,
			}
		]
	}
];

class GameManager extends Phaser.Events.EventEmitter {
	constructor() {
		super()

		this.score = 0;
		this.currentFloor = 0;
		this.maxFloors = floors.length;
		this.currentScene = null; // to hold active scene reference

		this.on('game-over', (data) => {
			this.score += data.score
		})
		this.on('floor-cleared', (data) => {
			this.score += data.score
		})
	}

	startGame(scene) {
		console.log('starting new game')
		this.currentFloor = 1;
		this.score = 0;
		scene.scene.start('FloorScene', { floor: 1 });
	}

	nextFloor() {
		console.log(this.currentFloor, this.maxFloors)
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
