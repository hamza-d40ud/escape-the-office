// scenes/FloorScene.js
import { Scene } from 'phaser';
import { Player } from '../Entities/Player';
import { Timer } from '../Entities/Timer';
import { Npc } from '../Entities/Npc';
import GameManager from '../Managers/GameManager.js';

export class FloorScene extends Scene {
	npcs = []

	constructor() {
		super('FloorScene');
	}

	create() {
		GameManager.setScene(this);

		// Listen for floor-cleared
		GameManager.once('floor-cleared', () => {
			this.handleFloorClear();
		});

		GameManager.once('game-won', () => {
			this.stopAllAudio();
		});

		GameManager.once('player-spotted', () => {
			console.log('Player spotted! Switching to GameOverScene...');
			this.stopAllAudio()
			this.player.disableInput();
			this.npcs.forEach(npc => npc.disableInput())
		});

		GameManager.once('player-spotted-ended', () => {
			this.stopAllAudio()
			this.scene.start('GameOver');
		});

		GameManager.once('floor-started', (data) => {
			this.stopAllAudio()
			this.scene.restart({ floor: data.floor });
		});
	}

	handleFloorClear() {
		// Optional: fade out, play sound, delay, etc.
		this.cameras.main.fadeOut(500);

		this.time.delayedCall(600, () => {
			this.stopAllAudio()
			GameManager.nextFloor();
		});
	}

	init(data) {
		this.floor = data.floor || GameManager.floor;

		let floorData = GameManager.getFloorData(this.floor);

		console.log(data, this.floor, floorData);

		this.npcs = [];

		this.map = this.make.tilemap({ key: floorData.mapkey });

		const tileset = this.map.addTilesetImage('main_tailset', 'tiles');
		const mainLayer = this.map.createLayer('main', tileset, 0, 0);
		const objectsLayer = this.map.createLayer('objects', tileset, 0, 0);

		objectsLayer.setCollisionByProperty({ collides: true });

		this.player = new Player(this, floorData.player.x, floorData.player.y);

		const npc_players = []
		const npc_cones = []

		floorData.npcs.forEach((npc) => {
			let npcToPush = new Npc(this, objectsLayer, npc.x, npc.y, npc.path);
			this.npcs.push(npcToPush);
			npc_players.push(npcToPush.sprite)
			this.physics.add.collider(npcToPush.sprite, objectsLayer)
			npc_cones.push(npcToPush.visionGraphics)
		})

		this.physics.add.collider(this.player.sprite, objectsLayer);

		this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);

		this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

		this.cameras.main.startFollow(this.player.sprite);

		const desiredHeight = 250;

		const zoom = this.scale.height / desiredHeight;

		this.cameras.main.setZoom(zoom);

		this.cameras.main.roundPixels = true;

		this.cameras.main.ignore([
			this.player.joystickBase,
			this.player.joystickThumb
		]);

		this.timer = new Timer(this, floorData.timer);

		this.uiCamera.ignore([mainLayer, objectsLayer, this.player.sprite, ...npc_players, ...npc_cones]);

		this.bgm = this.sound.add(floorData.backgroundmusic, {
			loop: true,
			volume: 0.1 // or adjust to taste
		});

		this.bgm.play();

		// Create exit zone from object
		const exitObject = this.map.findObject('objects', obj => {
			return obj.name === 'exit'
		});

		this.exitZone = this.add.zone(exitObject.x, exitObject.y, exitObject.width, exitObject.height);
		this.physics.add.existing(this.exitZone);
		this.exitZone.body.setAllowGravity(false);
		this.exitZone.body.setImmovable(true);

		this.physics.add.overlap(this.player.sprite, this.exitZone, () => {
			GameManager.emit('floor-cleared');
		});
	}

	update() {
		this.player.update()
		this.npcs.forEach(npc => npc.update())
	}

	stopAllAudio() {
		this.sound.stopAll(); // stops all currently playing sounds
	}

	destroy() {
		this.bgm.stop();
	}
}

