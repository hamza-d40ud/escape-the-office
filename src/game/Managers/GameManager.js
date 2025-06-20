// managers/GameManager.js
import Phaser from 'phaser';

var floors = [
	{
		mapkey: 'floor1',
		player: {
			x: 887,
			y: 586,
		},
		npcs: [
		],
		timer: 0.5 * 60,
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
			x: 1606,
			y: 730,
		},
		npcs: [
			{
				sound: 'Karam',
				npc_name: 'karam',
				video_name: 'karam_cutscene'
			}
		],
		timer: 1.5 * 60,
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
				title: "Get your game jam duck",
				type: 1,
				key: "duck",
				required: true,
				score: 100,
			}
		],
	},
	{
		mapkey: 'floor3',
		player: {
			x: 3312,
			y: 2000,
		},
		npcs: [
			{
				sound: 'Karam',
				npc_name: 'karam',
				video_name: 'karam_cutscene'
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
				sound: 'Yasser',
				npc_name: 'yasser',
				video_name: 'yasser_cutscene'
			},
			{
				sound: 'Tala',
				npc_name: 'tala',
				video_name: 'tala_cutscene'
			},
		],
		timer: 5 * 60,
		backgroundmusic: 'bgm',
		objectives: [
			{
				title: "Get your first key",
				type: 1,
				key: "key1",
				required: true,
				score: 100,
			},
			{
				title: "Get your second key",
				type: 1,
				key: "key2",
				required: true,
				score: 100,
			},
			{
				title: "Get your first game jam duck",
				type: 1,
				key: "duck1",
				required: false,
				score: 100,
			},
			{
				title: "Get your second game jam duck",
				type: 1,
				key: "duck2",
				required: false,
				score: 100,
			},
			{
				title: "Get your first لوزة",
				type: 1,
				key: "lozz1",
				required: false,
				score: 100,
			},
			{
				title: "Get your second لوزة",
				type: 1,
				key: "lozz2",
				required: false,
				score: 100,
			},
		],
	},
];

class GameManager extends Phaser.Events.EventEmitter {
	constructor() {
		super()

		this.maxFloors = floors.length;
		this.submitted = false;

		this.on('game-over', (data) => {
			this.score = 0;
			this.currentFloor = 1;
			this.pretendBusyUses = 3;
			this.madDashUses = 3;
		})

		this.on('floor-cleared', (data) => {
			this.score += data.score
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
		console.log("this.currentFloor.", this.currentFloor)
		console.log("this.maxFloors.", this.maxFloors)
		if (this.currentFloor < this.maxFloors) {
			setTimeout(() => {
				this.currentFloor++;
				this.emit('floor-started', { floor: this.currentFloor });
			}, 1000);
		} else {
			this.emit('game-won');
			this.submitLeaderboardAttempt();
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
	
		fetch('https://159.89.49.190:3000/api/v1/leaderboard/submit-attempt', {
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
