// scenes/FloorScene.js
import { Scene } from 'phaser';
import { Player } from '../Entities/Player';
import { Timer } from '../Entities/Timer';
import { Npc } from '../Entities/Npc';
import GameManager from '../Managers/GameManager.js';

export class FloorScene extends Scene {
	constructor() {
		super('FloorScene');
		this.npcs = []
		this.objectives = []
		this.zones = []
		this.uiElements = {
			checkboxes: [],
			texts: []
		};
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
			GameManager.emit('game-over', { score: 0 });
			this.scene.start('GameOver', { score: 0 });
		});

		GameManager.once('floor-started', (data) => {
			console.log(data)
			this.stopAllAudio()
			this.scene.restart({ floor: data.floor });
		});

		this.successTone = this.sound.add("success", {
			loop: false,
			 // or adjust to taste
		});
	}

	handleFloorClear() {
		// Optional: fade out, play sound, delay, etc.
		this.cameras.main.fadeOut(500);

		GameManager.pretendBusyUses = this.player.pretendBusyUsesLeft;
		GameManager.madDashUses = this.player.maddashUsesLeft;

		this.time.delayedCall(1000, () => {
			this.stopAllAudio()
			GameManager.nextFloor();
		});
	}

	init(data) {
		this.npcs = []
		this.objectives = []
		this.zones = []
		this.uiElements = {
			checkboxes: [],
			texts: []
		};

		this.floor = data.floor || GameManager.floor;

		let floorData = GameManager.getFloorData(this.floor);

		this.npcs = [];
		this.objectives = [];

		if (floorData.objectives) {
			this.objectives = floorData.objectives.map(x => ({ ...x, complete: false }))
		}

		this.map = this.make.tilemap({ key: floorData.mapkey });

		const tileset = this.map.addTilesetImage('main_tailset', 'tiles');
		const mainLayer = this.map.createLayer('main', tileset, 0, 0);
		const objectsLayer = this.map.createLayer('objects', tileset, 0, 0);

		objectsLayer.setCollisionByProperty({ collides: true });

		this.player = new Player(this, floorData.player.x, floorData.player.y);

		const npc_players = []
		const npc_cones = []

		let c = 1;
		floorData.npcs.forEach((npc) => {
			const pathObj = this.map.findObject(`npcs`, obj => obj.name === `npc${c}`);
			const path = pathObj.polygon.map(point => ({
				x: point.x + pathObj.x,
				y: point.y + pathObj.y
			}));
			
			let npcToPush = new Npc(this, objectsLayer, path[0].x, path[0].y, npc.sound, npc.npc_name, npc.video_name, path);
			this.npcs.push(npcToPush);
			npc_players.push(npcToPush.sprite)
			this.physics.add.collider(npcToPush.sprite, objectsLayer)
			npc_cones.push(npcToPush.visionGraphics)
			c++;
		})

		this.physics.add.collider(this.player.sprite, objectsLayer);

		this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);

		this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

		this.cameras.main.startFollow(this.player.sprite);

		const desiredHeight = 1000;

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
			volume: 0.7 // or adjust to taste
		});

		this.bgm.play();

		// Create exit zone from object
		const exitObject = this.map.findObject('objects', obj => {
			return obj.name === 'exit'
		});


		this.objectives.forEach(obj => {
			const objectiveObject = this.map.findObject('objects', objective => {
				return objective.name === obj.key
			});

			if (objectiveObject) {
				var zone = this.add.zone(objectiveObject.x, objectiveObject.y, objectiveObject.width, objectiveObject.height);
				this.zones.push(zone)
				this.physics.add.existing(zone);
				zone.body.setAllowGravity(false);
				zone.body.setImmovable(true);
				this.physics.add.overlap(this.player.sprite, zone, () => {
					this.objectives.forEach(x => {
						if (x.key === obj.key && !x.complete) {
							this.successTone.play();
							x.complete = true;
						}
					})
				});
			}
		})

		this.exitZone = this.add.zone(exitObject.x, exitObject.y, exitObject.width, exitObject.height);
		this.physics.add.existing(this.exitZone);
		this.exitZone.body.setAllowGravity(false);
		this.exitZone.body.setImmovable(true);

		this.physics.add.overlap(this.player.sprite, this.exitZone, () => {
			var complete = true;

			if (this.objectives.length > 0) {
				for (var i = 0; i < this.objectives.length; i++) {
					if (!this.objectives[i].complete && this.objectives[i].required) {
						complete = false;
						break;
					}
				}
			}

			if (complete) {
				let score = this.calculateScore(true);

				GameManager.emit('floor-cleared', { score });
			}
		});

		this.uiContainer = this.add.container(0, 0);
		this.uiContainer.setScrollFactor(0); // Essential for fixed UI

		this.createUiElements()
	}

	update() {
		this.player.update()
		this.npcs.forEach(npc => npc.update())
		this.renderUi()
	}

	stopAllAudio() {
		this.sound.stopAll(); // stops all currently playing sounds
	}

	destroy() {
		this.bgm.stop();
	}

	createUiElements() {
		if (this.objectives) {
			this.objectives.forEach((obj, i) => {
				const checkbox = this.add.image(100, (i + 1) * 130, 'checkbox_off').setAlpha(1);
				checkbox.setOrigin(0.5); // Set origin for consistency

				var textContent = obj.title;

				if (!obj.required) {
					textContent += " (Optional)"
				}

				const text = this.add.text(140, (i + 1) * 130, textContent, {
					fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
					stroke: '#000000', strokeThickness: 8,
					align: 'left'
				}).setOrigin(0, 0.5);

				this.uiContainer.add([checkbox, text]); // Add to the container
				this.uiElements.checkboxes.push(checkbox);
				this.uiElements.texts.push(text);
			});
		}
	}

	renderUi() {
		if (this.objectives && this.uiElements.checkboxes.length > 0) {
			this.objectives.forEach((obj, i) => {
				const checkbox = this.uiElements.checkboxes[i];
				const text = this.uiElements.texts[i];

				// Update the texture of the checkbox
				checkbox.setTexture(obj.complete ? 'checkbox_on' : 'checkbox_off');

				// If the text itself can change, update it here:
				// text.setText(obj.title); // Only if title can change dynamically

				// You might also want to change text color or style if an objective is complete
				if (obj.complete) {
					text.setColor('#00ff00'); // Green for complete
				} else {
					text.setColor('#ffffff'); // White for incomplete
				}
			});
		}
	}

	calculateScore(gameWon) {
		let score = 0;

		if (gameWon) {
			if (this.objectives && this.uiElements.checkboxes.length > 0) {
				this.objectives.forEach((obj) => {
					if (obj.complete) {
						score += obj.score;
					}
				})
			}

			// score += (this.player.pretendBusyUsesLeft * 150)

			// console.log('busy scoore', score)

			// score += (this.player.maddashUsesLeft * 50)

			score += Math.ceil((this.timer.timeLeft * 10) / 3);
		}



		return score;
	}
}

