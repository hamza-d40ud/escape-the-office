// scenes/FloorScene.js
import { Scene } from 'phaser';
import { Player } from '../Entities/Player';
import { Timer } from '../Entities/Timer';
import { Npc } from '../Entities/Npc';


export class FloorScene extends Scene {
	npcs = []

	constructor() {
		super('FloorScene');

	}

	preload() {
		this.load.image('tiles', 'assets/maps/tmw_desert_spacing.png');
		this.load.tilemapTiledJSON('map', 'assets/maps/desert.json');

		this.load.atlas('soldier', 'assets/animations/soldier.png', 'assets/animations/soldier.json');

		this.anims.create({
			key: 'walk-down',
			frames: this.anims.generateFrameNumbers('soldier', { start: 0, end: 3 }),
			frameRate: 8,
			repeat: -1
		});


		// this.add.image(512, 384, 'background').setAlpha(0.5);
	}

	create() {
		this.npcs = [];

		this.map = this.make.tilemap({ key: 'map' });

		const tiles = this.map.addTilesetImage('Desert', 'tiles');
		const layer = this.map.createLayer('Ground', tiles, 0, 0);

		this.marker = this.add.graphics();
		this.marker.lineStyle(2, 0x000000, 1);
		this.marker.strokeRect(0, 0, 6 * this.map.tileWidth, 6 * this.map.tileHeight);

		this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

		this.player = new Player(this, 100, 100);
		this.timer = new Timer(this, 6 * 60);

		const npcPath = [
			{ x: 200, y: 100 },
			{ x: 400, y: 100 },
			{ x: 400, y: 300 },
			{ x: 200, y: 300 }
		];

		this.npcs.push(new Npc(this, 200, 100, npcPath));

		// Optional: camera follow
		this.cameras.main.startFollow(this.player.sprite);
	}

	update() {
		this.player.update()
		this.npcs.forEach(npc => npc.update())
	}

	destroy() {
		this.player.destroy();
		this.npcs.forEach(npc => npc.destroy())
	}
}

