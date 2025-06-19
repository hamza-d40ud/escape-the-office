// managers/GameManager.js
import Phaser from 'phaser';

class GameManager extends Phaser.Events.EventEmitter {
	constructor() {
		super()

		this.currentFloor = 0;
		this.maxFloors = 2;
		this.currentScene = null; // to hold active scene reference
	}

	startGame(scene) {
		this.floor = 1;
		this.currentScene = scene;
		this.emit('floor-started', this.floor);
	}

	nextFloor() {
		if (this.currentFloor < this.maxFloors - 1) {
			this.currentFloor++;
			this.emit('floor-started', this.currentFloor);
			this.currentScene.scene.restart({ floor: this.currentFloor });
		} else {
			this.emit('game-won');
			this.currentScene.scene.start('GameWon');
		}
	}

	setScene(scene) {
		this.currentScene = scene;
	}
}

export default GameManager = new GameManager();
