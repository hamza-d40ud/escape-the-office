// managers/GameManager.js
class GameManager {
	constructor() {
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

export const gameManager = new GameManager();
