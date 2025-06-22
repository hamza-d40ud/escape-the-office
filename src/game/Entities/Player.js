import GameManager from "../Managers/GameManager";

// entities/Player.js
export class Player {
	constructor(scene, x, y) {
		this.scene = scene;
		this.speed = 300;
		// this.width = 159;
		// this.height = 210;
		this.width = 98;
		this.height = 130;
		this.pretendBusyUsesLeft = GameManager.pretendBusyUses;
		this.maddashUsesLeft = GameManager.madDashUses;

		this.busy = false;
		this.dashing = false;

		this.sprite = scene.physics.add.sprite(x, y, 'run-right'); // Default texture atlas


		this.busyTone = this.scene.sound.add("vocal_cute_angry", {
			loop: false,
			 // or adjust to taste
		});
		this.pretendBusyText = scene.add.text(scene.scale.width - 20, 80, '', {
			fontFamily: 'Arial Black', fontSize: 52, color: '#ffffff',
			stroke: '#000000', strokeThickness: 4,
		}).setOrigin(1, 0).setScrollFactor(0);
		this.phone = this.scene.add
			.image(
				scene.scale.width * 0.05,
				scene.scale.height * 0.65,
				'phone'
			)
			.setScale(2) // Doubles the size of the sprite
			.setInteractive()
			.on("pointerdown", () => this.pretendBusy())
		scene.input.keyboard.on("keydown-" + "W", () => this.pretendBusy());
		this.pretendBusyText.setText(`Pretend busy: ${this.pretendBusyUsesLeft} left`);


		this.dashingTone = this.scene.sound.add("dashing", {
			loop: false,
			 // or adjust to taste
		});
		this.madDashText = scene.add.text(scene.scale.width - 20, 130, '', {
			fontFamily: 'Arial Black', fontSize: 52, color: '#ffffff',
			stroke: '#000000', strokeThickness: 4,
		}).setOrigin(1, 0).setScrollFactor(0);
		this.maddashSprite = this.scene.add
			.image(
				scene.scale.width * 0.05,
				scene.scale.height * 0.75,
				'run'
			)
			.setScale(2) // Doubles the size of the sprite
			.setInteractive()
			.on("pointerdown", () => this.madDash())
		scene.input.keyboard.on("keydown-" + "E", () => this.madDash());
		this.madDashText.setText(`Mad dash: ${this.maddashUsesLeft} left`);


		this.scene.cameras.main.ignore([
			this.phone,
			this.maddashSprite
		]);

		this.sprite.setDepth(2);
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
		this.joystickBase = scene.add.circle(0, 0, 170, 0x888888).setScrollFactor(0);
		this.joystickThumb = scene.add.circle(0, 0, 110, 0xcccccc).setScrollFactor(0);

		this.joystick = scene.plugins.get('rexVirtualJoystick').add(scene, {
			x: scene.scale.width * 0.85,
			y: scene.scale.height * 0.65,
			radius: 110,
			base: this.joystickBase,
			thumb: this.joystickThumb,
		});

		this.cursors = scene.input.keyboard.createCursorKeys(); // Fallback for desktop

		this.running = scene.sound.add('running', {
			
			loop: true,
			spatial: true
		});
	}

	disableInput() {
		this.spotted = true;
		this.sprite.setVelocity(0);
	}

	update() {
		if (this.spotted || this.busy) return;

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

	madDash() {
		if (this.maddashUsesLeft > 0 && !this.dashing) {
			this.maddashUsesLeft--;
			this.speed *= 2;
			this.madDashText.setText(`Mad dash: ${this.maddashUsesLeft} left`);
			this.dashing = true
			if (!this.dashingTone.isPlaying) {
				this.dashingTone.play()
			}
			setTimeout(() => {
				this.speed /= 2;
				this.dashing = false
			}, 1000);
		}
	}

	pretendBusy() {
		if (this.pretendBusyUsesLeft > 0 && !this.busy) {
			console.log(this)
			this.busy = true;
			this.pretendBusyUsesLeft--;
			this.pretendBusyText.setText(`Pretend busy: ${this.pretendBusyUsesLeft} left`);
			this.sprite.setVelocity(0);

			this.running.stop();

			// Not moving
			if (this.lastDirection === 'right') {
				this.sprite.play('stand-right', true);
			} else {
				this.sprite.play('stand-left', true);
			}

			if (!this.busyTone.isPlaying) {
				this.busyTone.play()
			}

			setTimeout(() => {
				this.busy = false;
			}, 1000);
		}
	}
}
