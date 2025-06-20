import GameManager from '../Managers/GameManager.js';

export class Npc {
	constructor(scene, wallLayer, x, y, sound, npc_name, video_name, pathPoints = []) {
		this.wallLayer = wallLayer;
		this.scene = scene;
		this.speed = 260;
		this.width = 120;
		this.height = 120;
		this.pathPoints = pathPoints;
		this.detected = false;
		this.currentTargetIndex = 0;
		this.facingAngle = 0;       // current facing angle in degrees
		this.targetAngle = 0;       // desired direction
		this.angleLerpSpeed = 5;
		this.sprite = scene.physics.add.sprite(x, y, `run-left-${npc_name}`);

		this.detectionCount = 0;
		this.maxDetectionCount = 30;

		this.soundCount = 0;
		this.maxSoundCount = 40;
		this.video_name = video_name;

		this.debugBox = this.scene.add.graphics();
this.debugBox.setDepth(10);

		this.sprite.anims.create({
			key: `run-left-${npc_name}`,
			frames: this.scene.anims.generateFrameNames(`run-left-${npc_name}`, {
				prefix: 'Walking_',
				start: 0,
				end: 19,
				zeroPad: 5
			}),
			frameRate: 25,
			repeat: -1
		});


		this.sprite.anims.create({
			key: `run-right-${npc_name}`,
			frames: this.scene.anims.generateFrameNames(`run-right-${npc_name}`, {
				prefix: 'Walking_',
				start: 0,
				end: 19,
				zeroPad: 5
			}),
			frameRate: 25,
			repeat: -1
		});


		this.sprite.setDepth(1);
		this.sprite.setCollideWorldBounds(true);
		this.sprite.setDisplaySize(this.width, this.height);

		this.visionGraphics = this.scene.add.graphics({ fillStyle: { color: 0xffffff, alpha: 0.25 } });
		this.visionGraphics.setDepth(1); // draw below NPC

		this.caughtSound = scene.sound.add(sound, {
			
			loop: false,
			spatial: true
		});

		this.detectedSound = scene.sound.add(sound, {
			
			loop: false,
			spatial: true
		});

		this.detectedSound.once('complete', () => {
			GameManager.emit('player-spotted-ended', { npc: this });
		});

		this.scene.input.once('pointerdown', () => {
			if (this.detectedSound.isPlaying) {
				this.detectedSound.stop();
				GameManager.emit('player-spotted-ended', { npc: this });
			}
		});

		this.steps = scene.sound.add('steps', {
			
			loop: true,
			spatial: true
		});

		this.prevPosition = new Phaser.Math.Vector2(x, y);
		this.stuckTime = 0;
		this.maxStuckTime = 1000;
		this.npc_name = npc_name;
	}

	drawVisionCone(originX, originY, angleDeg, radius, fovDeg) {
		this.visionGraphics.clear();

		const ratio = Phaser.Math.Clamp(this.detectionCount / this.maxDetectionCount, 0, 1);

		let r = 228, g = 106, b = 142; // start with white

		if (ratio <= 0.5) {
			// Interpolate from white to yellow
			const t = ratio / 0.5;
			r = 228;
			g = 106;
			b = Math.floor(228 * (1 - t)); // 255 → 0
		} else {
			// Interpolate from yellow to red
			const t = (ratio - 0.5) / 0.5;
			r = 228;
			g = Math.floor(106 * (1 - t)); // 255 → 0
			b = 0;
		}

		const colorHex = (r << 16) | (g << 8) | b;

		this.visionGraphics.fillStyle(colorHex, 0.3);

		const angleRad = Phaser.Math.DegToRad(angleDeg);
		const fovRad = Phaser.Math.DegToRad(fovDeg);

		const startAngle = angleRad - fovRad / 2;
		const endAngle = angleRad + fovRad / 2;

		this.visionGraphics.beginPath();
		this.visionGraphics.moveTo(originX, originY);

		// STEP 1: For each ray in the cone
		for (let a = startAngle; a <= endAngle; a += 0.05) {
			const stepSize = 4; // smaller = more accurate
			let x = originX;
			let y = originY;

			for (let r = 0; r < radius; r += stepSize) {
				x = originX + r * Math.cos(a);
				y = originY + r * Math.sin(a);

				// Check tile at this point
				const tile = this.wallLayer.getTileAtWorldXY(x, y, true);

				if (tile && tile.collides) {
					// Wall hit → stop line here
					break;
				}
			}

			this.visionGraphics.lineTo(x, y);
		}

		this.visionGraphics.lineTo(originX, originY);
		this.visionGraphics.closePath();
		this.visionGraphics.fillPath();
	}

	isPlayerInCone(npc, player, coneAngleDeg, coneRadius, fovDeg) {
		if (player.busy) return;

		const dx = player.sprite.x - npc.x;
		const dy = player.sprite.y - npc.y;
		const distance = Math.hypot(dx, dy);

		// Outside cone radius
		if (distance > coneRadius) return false;

		// Check cone angle
		const angleToPlayer = Phaser.Math.RadToDeg(Math.atan2(dy, dx));
		const npcFacing = coneAngleDeg;
		const deltaAngle = Phaser.Math.Angle.WrapDegrees(angleToPlayer - npcFacing);

		if (Math.abs(deltaAngle) > fovDeg / 2) return false;

		const npcPos = new Phaser.Math.Vector2(npc.x, npc.y);

		const playerPos = new Phaser.Math.Vector2(player.sprite.x, player.sprite.y);

		const ray = new Phaser.Geom.Line(npcPos.x, npcPos.y, playerPos.x, playerPos.y);

		const blockingTiles = this.wallLayer.getTilesWithinShape(ray, {
			isColliding: true
		});

		if (blockingTiles.length > 0) {
			return false;
		}

		return true;
	}

	disableInput() {
		this.detected = true;
		this.sprite.setVelocity(0)
		this.steps.stop();
		this.sprite.stop(`run-right-${this.npc_name}`);
		this.visionGraphics.clear();
	}

	update() {
// Clear and redraw debug box
this.debugBox.clear();
this.debugBox.lineStyle(2, 0x00ff00, 1); // Green outline

// Get the current bounds of the sprite
const bounds = this.sprite.getBounds();
this.debugBox.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
		if (this.detected) return;
	
		const sprite = this.sprite;
		const player = this.scene.player;
	
		if (!player.busy)
		this.drawVisionCone(sprite.x, sprite.y, this.facingAngle, 700, 60);
	
		// Check if player is in cone
		if (this.isPlayerInCone(sprite, this.scene.player, this.facingAngle, 1100, 60, this.scene.objects)) {
			this.soundCount++;
		} else if (this.soundCount > 0) {
			this.soundCount--;
		}
	
		if (this.isPlayerInCone(sprite, this.scene.player, this.facingAngle, 700, 60, this.scene.objects)) {
			this.detectionCount++;
		} else if (this.detectionCount > 0) {
			this.detectionCount--;
		}
	
		if (this.soundCount >= this.maxSoundCount) {
			if (!this.caughtSound.isPlaying) {
				this.caughtSound.play({ loop: false });
			}
		}
	
		if (this.detectionCount >= this.maxDetectionCount) {
			this.detected = true;
			this.sprite.setVelocity(0, 0);
			this.scene.scene.start('CutsceneScene', { video_name: this.video_name });
			return;
		}
	
		if (this.pathPoints.length === 0) return;
	
		const target = this.pathPoints[this.currentTargetIndex];
	
		const dx = target.x - sprite.x;
		const dy = target.y - sprite.y;
		const distance = Math.hypot(dx, dy);
	
		if (distance < 4) {
			// Arrived at current target
			this.currentTargetIndex = (this.currentTargetIndex + 1) % this.pathPoints.length;
			return;
		}
	
		// Normalize direction
		const dirX = dx / distance;
		const dirY = dy / distance;
	
		var vx = dirX * this.speed;
		var vy = dirY * this.speed;
	
		sprite.setVelocity(vx, vy);
	
		// If we're moving, update targetAngle
		if (distance > 1) {
			this.targetAngle = Phaser.Math.RadToDeg(Math.atan2(dy, dx));
		}
	
		// Smoothly rotate current angle toward targetAngle
		let delta = Phaser.Math.Angle.WrapDegrees(this.targetAngle - this.facingAngle);
	
		this.facingAngle += Phaser.Math.Clamp(delta, -this.angleLerpSpeed, this.angleLerpSpeed);
	
	
		if (vx > 0) {
			sprite.play(`run-right-${this.npc_name}`, true);
			this.lastDirection = 'right';
		} else if (vx < 0) {
			sprite.play(`run-left-${this.npc_name}`, true);
			this.lastDirection = 'left';
		} else if (vy !== 0) {
			// Moving vertically → play last known horizontal direction
			if (this.lastDirection === 'right') {
				sprite.play(`run-right-${this.npc_name}`, true);
			} else {
				sprite.play(`run-left-${this.npc_name}`, true);
			}
		} else {
			this.running.stop();
			// Not moving
			if (this.lastDirection === 'right') {
				sprite.play('stand-right', true);
			} else {
				sprite.play('stand-left', true);
			}
		}
	
		const now = this.scene.time.now;
		const currentPos = this.sprite.getCenter();
	
		if (Phaser.Math.Distance.BetweenPoints(currentPos, this.prevPosition) < 2) {
			this.stuckTime += this.scene.game.loop.delta;
		} else {
			this.stuckTime = 0;
		}
	
		this.prevPosition.copy(currentPos);
	
		if (this.stuckTime > this.maxStuckTime) {
			// If stuck for more than 1 second, force skip to next target
			this.currentTargetIndex = (this.currentTargetIndex + 1) % this.pathPoints.length;
			this.stuckTime = 0;
			return;
		}
	}

	stop() {
		this.steps.stop();
	}

	destroy() {
		this.sprite.destroy();
	}
}
