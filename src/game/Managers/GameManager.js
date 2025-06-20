// managers/GameManager.js
import Phaser from 'phaser';

var floors = [
	{
		mapkey: 'floor1',
		player: {
			x: 3316,
			y: 1370,
		},
		npcs: [
			{
				sound: 'Yasser',
				npc_name: 'yasser',
				video_name: 'yasser_cutscene'
			},
			{
				sound: 'Farah',
				npc_name: 'farah',
				video_name: 'farah_cutscene'
			},
			{
				sound: 'Rida',
				npc_name: 'rida',
				video_name: 'rida_cutscene'
			},
			{
				sound: 'Karam',
				npc_name: 'karam',
				video_name: 'karam_cutscene'
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
			},
			{
				title: "Clock Out",
				type: 1,
				key: "clock_out",
				required: false,
				score: 100,
			}
		],
	},
	// {
	// 	mapkey: 'floor2',
	// 	player: {
	// 		x: 100,
	// 		y: 100,
	// 	},
	// 	npcs: [
	// 		{
	// 			x: 300,
	// 			y: 500,
	// 			path: [
	// 				{ x: 300, y: 500 },
	// 				{ x: 200, y: 300 },
	// 			],
	// 			sound: 'rida_1'
	// 		},
	// 		{
	// 			x: 200,
	// 			y: 100,
	// 			path: [
	// 				{ x: 200, y: 100 },
	// 				{ x: 200, y: 300 },
	// 			],
	// 			sound: 'rida_1'
	// 		}
	// 	],
	// 	timer: 2 * 60,
	// 	backgroundmusic: 'bgm',
	// 	objectives: [
	// 		{
	// 			title: "Get your keys",
	// 			type: 1,
	// 			key: "keys",
	// 			required: true,
	// 			score: 100,
	// 		},
	// 		{
	// 			title: "Clock out",
	// 			type: 2,
	// 			key: "clock_out",
	// 			required: true,
	// 			score: 100,
	// 		},
	// 		{
	// 			title: "Drink water",
	// 			type: 3,
	// 			key: "water",
	// 			required: false,
	// 			score: 300,
	// 		}
	// 	]
	// }
];

class GameManager extends Phaser.Events.EventEmitter {
	constructor() {
		super()

		this.maxFloors = floors.length;
		this.submitted = false;

		this.on('game-over', (data) => {
			this.score = data.score
		})

		this.on('floor-cleared', (data) => {
			this.score = data.score
			this.submitLeaderboardAttempt();
		})
	}

	startGame(scene) {
		console.log('starting new game')
		this.currentFloor = 1;
		this.pretendBusyUses = 3;
		this.madDashUses = 3;
		this.score = 0;
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

	submitLeaderboardAttempt() {
		if (this.submitted) return;

		this.submitted = true;

		const playerName = localStorage.getItem('username') || 'Unknown';
		const payload = {
			username: playerName,
			score: this.score
		};
	
		fetch('http://159.89.49.190:3000/api/v1/leaderboard/submit-attempt', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		})
		.then(response => {
			if (!response.ok) throw new Error('Network response was not ok');
			return response.json();
		})
		.then(data => {
			console.log('Submitted to leaderboard:', data);
		})
		.catch(error => {
			console.error('Failed to submit score:', error);
		});
	}
	
}

export default GameManager = new GameManager();
