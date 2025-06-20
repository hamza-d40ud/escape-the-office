import GameManager from '../Managers/GameManager.js';

export class Npc {
	constructor(scene, wallLayer, x, y, pathPoints = []) {
		this.wallLayer = wallLayer;
		this.scene = scene;
		this.speed = 80;
		this.width = 64;
		this.height = 64;
		this.pathPoints = pathPoints;
		this.detected = false;
		this.currentTargetIndex = 0;
		this.facingAngle = 0;       // current facing angle in degrees
		this.targetAngle = 0;       // desired direction
		this.angleLerpSpeed = 5;
		this.sprite = scene.physics.add.sprite(x, y, 'soldier');
		this.detectionCount = 0;
		this.maxDetectionCount = 20;

		this.sprite.anims.create({
			key: 'walk',
			frames: this.scene.anims.generateFrameNames('soldier', {
				prefix: 'soldier_3_walk_',
				start: 1,
				end: 8
			}),
			frameRate: 12,
			repeat: -1
		});

		this.sprite.setDepth(1);
		this.sprite.setCollideWorldBounds(true);
		this.sprite.setDisplaySize(this.width, this.height);

		this.visionGraphics = this.scene.add.graphics({ fillStyle: { color: 0xffffff, alpha: 0.25 } });
		this.visionGraphics.setDepth(1); // draw below NPC

		this.detectedSound = scene.sound.add('rida_1', {
			volume: 0.5,
			loop: false,
			spatial: false
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
			volume: 0.5,
			loop: true,
			spatial: true
		});
	}

	drawVisionCone(originX, originY, angleDeg, radius, fovDeg) {
		this.visionGraphics.clear();

		const ratio = Phaser.Math.Clamp(this.detectionCount / this.maxDetectionCount, 0, 1);

		let r = 255, g = 255, b = 255; // start with white

		if (ratio <= 0.5) {
			// Interpolate from white to yellow
			const t = ratio / 0.5;
			r = 255;
			g = 255;
			b = Math.floor(255 * (1 - t)); // 255 → 0
		} else {
			// Interpolate from yellow to red
			const t = (ratio - 0.5) / 0.5;
			r = 255;
			g = Math.floor(255 * (1 - t)); // 255 → 0
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
		const dx = player.x - npc.x;
		const dy = player.y - npc.y;
		const distance = Math.hypot(dx, dy);

		// Outside cone radius
		if (distance > coneRadius) return false;

		// Check cone angle
		const angleToPlayer = Phaser.Math.RadToDeg(Math.atan2(dy, dx));
		const npcFacing = coneAngleDeg;
		const deltaAngle = Phaser.Math.Angle.WrapDegrees(angleToPlayer - npcFacing);

		if (Math.abs(deltaAngle) > fovDeg / 2) return false;

		const npcPos = new Phaser.Math.Vector2(npc.x, npc.y);

		const playerPos = new Phaser.Math.Vector2(player.x, player.y);

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
		this.sprite.stop('walk');
		this.visionGraphics.clear();
	}

	update() {
		if (this.detected) return;

		const sprite = this.sprite;
		const player = this.scene.player;
		const playerPos = this.scene.player.sprite;

		this.drawVisionCone(sprite.x, sprite.y, this.facingAngle, 200, 60);

		// Check if player is in cone
		if (this.isPlayerInCone(sprite, playerPos, this.facingAngle, 200, 60, this.scene.objects)) {
			this.detectionCount++;
		} else if (this.detectionCount > 0) {
			this.detectionCount--;
		}

		if (this.detectionCount >= this.maxDetectionCount) {
			this.detected = true;

			sprite.setVelocity(0, 0);

			GameManager.emit('player-spotted', { npc: this });

			if (!this.detectedSound.isPlaying) {
				this.detectedSound.play();
			}

			const playerCenter = player.sprite.getCenter();
			const npcCenter = sprite.getCenter();

			// Vector to player
			const direction = new Phaser.Math.Vector2(
				playerCenter.x - npcCenter.x,
				playerCenter.y - npcCenter.y
			).normalize();

			// Apply fast velocity
			const sprintSpeed = 300;

			sprite.setVelocity(direction.x * sprintSpeed, direction.y * sprintSpeed);

			// Play sprint animation (you must define it in advance)
			sprite.play('npc_run_fast');

			// Optional: face player direction
			sprite.setFlipX(direction.x < 0);

			this.scene.time.addEvent({
				delay: 100, // start checking soon
				loop: true,
				callback: () => {
					const distance = Phaser.Math.Distance.BetweenPoints(sprite, player.sprite);
					if (distance < 50) {
						sprite.setVelocity(0);
						sprite.play('npc_attack'); // or 'grab', etc.

						if (!this.detectedSound.isPlaying) {
							this.detectedSound.play();
						}

						// Optional: emit event after a delay
						this.scene.time.delayedCall(500, () => {
							GameManager.emit('player-caught', { npc: this });
						});

						this.steps.stop();

						sprite.stop('walk');

						// Stop this loop
						return false;
					}
				}
			});
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

		if (vx !== 0 || vy !== 0) {
			sprite.play('walk', true);
			if (!this.steps.isPlaying) {
				this.steps.play({ loop: true });
			}
		} else {
			sprite.stop('walk');
			this.steps.stop();
		}
	}

	stop() {
		this.steps.stop();
	}

	destroy() {
		this.sprite.destroy();
	}
}
