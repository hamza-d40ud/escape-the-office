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

		GameManager.once('player-spotted', () => {
			console.log('Player spotted! Switching to GameOverScene...');
			this.player.stop()
			this.stop()
			this.npcs.forEach(npc => npc.stop())
			this.scene.start('GameOver');
		});

		GameManager.once('floor-started', (data) => {
			console.log(data)
			this.init(data)
		});
	}

	handleFloorClear() {
		// Optional: fade out, play sound, delay, etc.
		this.cameras.main.fadeOut(500);

		this.time.delayedCall(600, () => {
			GameManager.nextFloor();
		});
	}

	init(data) {
		this.floor = data.floor || GameManager.floor;
		this.npcs = [];

		this.map = this.make.tilemap({ key: 'map' });
		const tileset = this.map.addTilesetImage('main_tailset', 'tiles');
		const mainLayer = this.map.createLayer('main', tileset, 0, 0);
		const objectsLayer = this.map.createLayer('objects', tileset, 0, 0);

		objectsLayer.setCollisionByProperty({ collides: true });

		this.player = new Player(this, 0, 0);

		const npcPath = [
			{ x: 200, y: 100 },
			{ x: 200, y: 300 },
		];

		this.npcs.push(new Npc(this, 200, 100, npcPath));

		const npc_players = []
		const npc_cones = []

		this.npcs.map((npc) => {
			npc_players.push(npc.sprite)
			this.physics.add.collider(npc.sprite, objectsLayer)
			npc_cones.push(npc.visionGraphics)
		})

		this.physics.add.collider(this.player.sprite, objectsLayer);

		this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);

		this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
		this.cameras.main.startFollow(this.player.sprite);

		const desiredHeight = 250;

		const zoom = this.scale.height / desiredHeight;

		this.cameras.main.setZoom(zoom);

		this.cameras.main.ignore([
			this.player.joystickBase,
			this.player.joystickThumb
		]);

		this.timer = new Timer(this, 6 * 60);

		this.uiCamera.ignore([mainLayer, objectsLayer, this.player.sprite, ...npc_players, ...npc_cones]);

		this.bgm = this.sound.add('bgm', {
			loop: true,
			volume: 0.3 // or adjust to taste
		});

		this.bgm.play();

		console.log(this.map);

		// Create exit zone from object
		const exitObject = this.map.findObject('objects', obj => {
			console.log(obj);
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

	stop() {
		this.bgm.stop();
	}

	destroy() {
		this.bgm.stop();
		this.player.destroy();
		this.npcs.forEach(npc => npc.destroy())
	}
}

