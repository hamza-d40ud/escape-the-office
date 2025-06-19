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
		this.load.image('tiles', 'assets/maps/tilemap.png');
		this.load.tilemapTiledJSON('map', 'assets/maps/level1.json');

		this.load.atlas('soldier', 'assets/animations/soldier.png', 'assets/animations/soldier.json');


		this.load.atlas('stand-right', 'assets/animations/StandingRight.png', 'assets/animations/StandingRight.json');
		this.load.atlas('stand-left', 'assets/animations/StandingLeft.png', 'assets/animations/StandingLeft.json');
		this.load.atlas('run-left', 'assets/animations/RunningLeft.png', 'assets/animations/RunningLeft.json');
		this.load.atlas('run-right', 'assets/animations/RunningRight.png', 'assets/animations/RunningRight.json');
		
	}

	create() {
		this.npcs = [];

		this.map = this.make.tilemap({ key: 'map' });
		const tileset = this.map.addTilesetImage('main_tailset', 'tiles');
		const mainLayer = this.map.createLayer('main', tileset, 0, 0);
		const objectsLayer = this.map.createLayer('objects', tileset, 0, 0);

		objectsLayer.setCollisionByProperty({ collides: true });

		
		this.player = new Player(this, 0, 0);
		
		const npcPath = [
			{ x: 200, y: 100 },
			{ x: 400, y: 100 },
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
		const desiredHeight = 150;
		const zoom = this.scale.height / desiredHeight;
		this.cameras.main.setZoom(zoom);
		this.cameras.main.ignore([
			this.player.joystickBase,
			this.player.joystickThumb
		]);
		
		this.timer = new Timer(this, 6 * 60);

		this.uiCamera.ignore([mainLayer, objectsLayer, this.player.sprite, ...npc_players, ...npc_cones]);

// 		const debugGraphics = this.add.graphics().setAlpha(0.75);
// objectsLayer.renderDebug(debugGraphics, {
//   tileColor: null,
//   collidingTileColor: new Phaser.Display.Color(255, 0, 0, 255), // Red
//   faceColor: new Phaser.Display.Color(0, 255, 0, 255) // Green
// });
		
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

