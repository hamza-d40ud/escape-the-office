export class Timer {
	constructor(scene, timeSeconds) {
		this.scene = scene; // 6 minutes in seconds
		this.timeLeft = timeSeconds; // 6 minutes in seconds
		console.log(timeSeconds)

		this.timerText = scene.add.text(scene.scale.width - 20, 20, '', {
			fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
			stroke: '#000000', strokeThickness: 4,
		}).setOrigin(1, 0).setScrollFactor(0);

		// Start a repeating timed event every 1 second
		this.countdownEvent = scene.time.addEvent({
			delay: 1000,
			callback: this.update,
			callbackScope: this,
			loop: true
		});
	}

	update() {
		if (this.timeLeft > 0) {
			this.timeLeft--;
			const minutes = Math.floor(this.timeLeft / 60);
			const seconds = this.timeLeft % 60;

			this.timerText.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);
		} else {
			// Timer ran out — trigger game over, floor lock, etc.
			this.countdownEvent.remove();
			this.timerText.setText("00:00");
			this.scene.scene.start('GameOver'); // or any failure logic
		}
	}
}
