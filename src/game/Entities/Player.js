// entities/Player.js
export class Player {
	constructor(scene, x, y) {
		this.scene = scene;
		this.speed = 140;
		this.width = 64;
		this.height = 64;

		this.sprite = scene.physics.add.sprite(x, y, 'soldier');// Place at bottom-right corner

		this.sprite.anims.create({
			key: 'walk',
			frames: this.scene.anims.generateFrameNames('soldier', { prefix: 'soldier_3_walk_', start: 1, end: 8 }),
			frameRate: 12,
			repeat: -1
		});

		this.sprite.setDepth(1);
		this.sprite.setCollideWorldBounds(true);

		this.sprite.setDisplaySize(this.width, this.height);
		//
		// Setup joystick if needed
		this.joystick = scene.plugins.get('rexVirtualJoystick').add(scene, {
			x: scene.scale.width - 100,
			y: scene.scale.height - 100,
			radius: 60,
			base: scene.add.circle(0, 0, 60, 0x888888),
			thumb: scene.add.circle(0, 0, 25, 0xcccccc),
		});

		this.cursors = scene.input.keyboard.createCursorKeys(); // Fallback for desktop
	}

	update() {
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
			sprite.play('walk', true);
		} else {
			sprite.stop('walk');
		}
	}

	destroy() {
		this.sprite.destroy();
		if (this.joystick) this.joystick.destroy();
	}
}
