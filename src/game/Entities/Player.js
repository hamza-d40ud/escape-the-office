// entities/Player.js
export class Player {
	constructor(scene, x, y) {
		this.scene = scene;
		this.speed = 10;
		this.width = 150;
		this.height = 250;


		// this.joystick = scene.physics.add.sprite(10, 10, 'joystick');
		// this.handle = scene.physics.add.sprite(10, 10, 'handle');
		this.sprite = scene.physics.add.sprite(x, y, 'player');// Place at bottom-right corner

		// let padding = 100;

		// this.container = this.scene.add.container(x, y);
		// // this.container.setOrigin(1, 1);
		// this.container.setScrollFactor(0);
		// this.container.setPosition(this.scene.scale.width - padding, this.scene.scale.height - padding);

		// this.container.add(this.joystick);
		// this.container.add(this.handle);

		this.sprite.setDepth(1);
		this.sprite.setCollideWorldBounds(true);

		this.sprite.setDisplaySize(this.width, this.height);
		// this.joystick.setScale(0.5);;
		// this.handle.setScale(0.5);

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

		if (joystick.force > 0) {
			vx = Math.cos(joystick.angle) * joystick.force * speed;
			vy = -(Math.sin(joystick.angle) * joystick.force * speed);
		} else {
			if (cursors.left.isDown) vx = -speed;
			else if (cursors.right.isDown) vx = speed;

			if (cursors.up.isDown) vy = -speed;
			else if (cursors.down.isDown) vy = speed;
		}

		sprite.setVelocity(vx, vy);
	}

	destroy() {
		this.sprite.destroy();
		if (this.joystick) this.joystick.destroy();
	}
}
