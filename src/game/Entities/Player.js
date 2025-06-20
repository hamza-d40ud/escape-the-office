// entities/Player.js
export class Player {
	constructor(scene, x, y) {
		this.scene = scene;
		this.speed = 135;
		this.width = 40;
		this.height = 53;

		this.sprite = scene.physics.add.sprite(x, y, 'run-right'); // Default texture atlas

		this.sprite.setDepth(1);
		this.sprite.setCollideWorldBounds(true);
		this.sprite.setDisplaySize(this.width, this.height);
		this.sprite.setBodySize(230, 430)

		this.spotted = false;

		this.sprite.anims.create({
			key: 'stand-right',
			frames: this.scene.anims.generateFrameNames('stand-right', {
				prefix: 'Standing_',
				start: 0,
				end: 14, // Or whatever the last frame index is
				zeroPad: 5
			}),
			frameRate: 25,
			repeat: -1
		});

		this.sprite.anims.create({
			key: 'stand-left',
			frames: this.scene.anims.generateFrameNames('stand-left', {
				prefix: 'Standing_',
				start: 0,
				end: 14, // Or whatever the last frame index is
				zeroPad: 5
			}),
			frameRate: 25,
			repeat: -1
		});

		this.sprite.anims.create({
			key: 'run-right',
			frames: this.scene.anims.generateFrameNames('run-right', {
				prefix: 'Running_',
				start: 0,
				end: 9, // Or whatever the last frame index is
				zeroPad: 5
			}),
			frameRate: 25,
			repeat: -1
		});

		this.sprite.anims.create({
			key: 'run-left',
			frames: this.scene.anims.generateFrameNames('run-left', {
				prefix: 'Running_',
				start: 0,
				end: 9, // Or whatever the last frame index is
				zeroPad: 5
			}),
			frameRate: 25,
			repeat: -1
		});

		// Setup joystick if needed
		this.joystickBase = scene.add.circle(0, 0, 90, 0x888888).setScrollFactor(0);
		this.joystickThumb = scene.add.circle(0, 0, 50, 0xcccccc).setScrollFactor(0);

		this.joystick = scene.plugins.get('rexVirtualJoystick').add(scene, {
			x: scene.scale.width * 0.85,
			y: scene.scale.height * 0.65,
			radius: 90,
			base: this.joystickBase,
			thumb: this.joystickThumb,
		});

		this.cursors = scene.input.keyboard.createCursorKeys(); // Fallback for desktop

		this.running = scene.sound.add('running', {
			volume: 0.5,
			loop: true,
			spatial: true
		});
	}

	disableInput() {
		this.spotted = true;
		this.sprite.setVelocity(0);
	}

	update() {
		if (this.spotted) return;

		const { sprite, speed, joystick, cursors } = this;

		let vx = 0;
		let vy = 0;

		sprite.setVelocity(0);

		var leftKeyDown = joystick.left;
		var rightKeyDown = joystick.right;
		var upKeyDown = joystick.up;
		var downKeyDown = joystick.down;

		if (joystick.force > 0) {
			if (leftKeyDown) vx = -speed;
			else if (rightKeyDown) vx = speed;
			if (upKeyDown) vy = -speed;
			else if (downKeyDown) vy = speed;
		} else {
			if (cursors.left.isDown) vx = -speed;
			else if (cursors.right.isDown) vx = speed;
			if (cursors.up.isDown) vy = -speed;
			else if (cursors.down.isDown) vy = speed;
		}

		sprite.setVelocity(vx, vy);

		if (vx != 0 || vy != 0) {
			if (!this.running.isPlaying) {
				this.running.play({ loop: true });
			}
		}

		if (vx > 0) {
			sprite.play('run-right', true);
			this.lastDirection = 'right';
		} else if (vx < 0) {
			sprite.play('run-left', true);
			this.lastDirection = 'left';
		} else if (vy !== 0) {
			// Moving vertically → play last known horizontal direction
			if (this.lastDirection === 'right') {
				sprite.play('run-right', true);
			} else {
				sprite.play('run-left', true);
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

		// this.scene.sound.setListenerPosition(this.sprite.x, this.sprite.y, 0);
	}

	stop() {
		this.running.stop();
	}

	destroy() {
		this.sprite.destroy();
		if (this.joystick) this.joystick.destroy();
	}
}
