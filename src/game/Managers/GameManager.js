// managers/GameManager.js
import Phaser from 'phaser';

class GameManager extends Phaser.Events.EventEmitter {
	constructor() {
		super()

		this.reset();
	}

	reset() {
		this.currentFloor = 0;
		this.maxFloors = 5;
		this.spotted = false;
		this.inventory = [];
	}

	advanceFloor() {
		if (this.currentFloor < this.maxFloors - 1) {
			this.currentFloor++;
		} else {
			console.log("Game complete!");
		}
	}

	markSpotted() {
		this.spotted = true;
	}

	addItem(item) {
		this.inventory.push(item);
	}
}

export default GameManager = new GameManager();
