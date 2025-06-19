import GameManager from '../Managers/GameManager.js';

export class Npc {
	constructor(scene, x, y, pathPoints = []) {
		this.scene = scene;
		this.speed = 80;
		this.width = 64;
		this.height = 64;
		this.pathPoints = pathPoints;
		this.currentTargetIndex = 0;
		this.facingAngle = 0;       // current facing angle in degrees
		this.targetAngle = 0;       // desired direction
		this.angleLerpSpeed = 5;
		this.sprite = scene.physics.add.sprite(x, y, 'soldier');
		this.detectionCount = 0;
		this.maxDetectionCount = 60;

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

		this.steps = scene.sound.add('steps', {
			volume: 0.5,
			loop: true,
			spatial: true
		});
	}

	drawVisionCone(originX, originY, angleDeg, radius, fovDeg) {
		this.visionGraphics.clear();

		const angleRad = Phaser.Math.DegToRad(angleDeg);
		const fovRad = Phaser.Math.DegToRad(fovDeg);

		const startAngle = angleRad - fovRad / 2;
		const endAngle = angleRad + fovRad / 2;

		this.visionGraphics.beginPath();
		this.visionGraphics.moveTo(originX, originY);

		for (let a = startAngle; a <= endAngle; a += 0.1) {
			const x = originX + radius * Math.cos(a);
			const y = originY + radius * Math.sin(a);
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

		if (distance > coneRadius) return false;

		const angleToPlayer = Phaser.Math.RadToDeg(Math.atan2(dy, dx));
		const npcFacing = coneAngleDeg;

		const deltaAngle = Phaser.Math.Angle.WrapDegrees(angleToPlayer - npcFacing);

		return Math.abs(deltaAngle) < fovDeg / 2;
	}

	update() {
		const npcPos = this.sprite;
		const playerPos = this.scene.player.sprite;

		this.drawVisionCone(npcPos.x, npcPos.y, this.facingAngle, 200, 60);

		// Check if player is in cone
		if (this.isPlayerInCone(npcPos, playerPos, this.facingAngle, 200, 60)) {
			this.detectionCount++;
		} else if (this.detectionCount > 0) {
			this.detectionCount--;
		}

		if (this.detectionCount >= this.maxDetectionCount) {
			GameManager.emit('player-spotted', { npc: this });
		}

		if (this.pathPoints.length === 0) return;

		const target = this.pathPoints[this.currentTargetIndex];
		const sprite = this.sprite;

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
