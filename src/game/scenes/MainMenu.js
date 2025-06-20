import { Scene } from 'phaser';

import GameManager from '../Managers/GameManager.js';

export class MainMenu extends Scene {
	constructor() {
		super('MainMenu');
	}

	create() {
		this.add
			.image(0, 0, 'mainmenu')
			.setDisplaySize(this.scale.width, this.scale.height)
			.setOrigin(0, 0)
			.setScrollFactor(0);
	
		// Button dimensions
		const buttonWidth = 1400;
		const buttonHeight = 370;
	
		// Start Button (ابدأ)
		const startX = this.scale.width / 1.38;
		const startY = this.scale.height * 0.64;
		const startButton = this.add.zone(startX * 0.95, startY, buttonWidth, buttonHeight)
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });
	
		startButton.on('pointerdown', () => {
			if (!document.getElementById('nameInput')) {
				this.showNameInput();
			}
		});
	
	
		// Leaderboard Button (المتصدرين)
		const leaderboardY = this.scale.height * 0.88;
		const leaderboardButton = this.add.zone(startX, leaderboardY, buttonWidth, buttonHeight)
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });
	
		leaderboardButton.on('pointerdown', () => {
			this.scene.start('LeaderboardScene');
		});
	
		// Play main menu music
		this.menuMusic = this.sound.add('main_menu_m', {
			loop: true,
			
		});
		this.menuMusic.play();

		// Stop music when scene is shutdown or destroyed
		this.events.on('shutdown', this.stopMenuMusic, this);
		this.events.on('destroy', this.stopMenuMusic, this);
	}

	stopMenuMusic() {
		if (this.menuMusic) {
			this.menuMusic.stop();
		}
	}

	showNameInput() {
		const saved_name = localStorage.getItem('username');
		if(saved_name){
			GameManager.startGame(this);
		}
		else{
			const container = document.createElement('div');
		container.id = 'nameContainer';
		container.style.position = 'absolute';
		container.style.top = '50%';
		container.style.left = '50%';
		container.style.transform = 'translate(-50%, -50%)';
		container.style.background = 'rgba(255, 255, 255)';
		container.style.padding = '40px';
		container.style.borderRadius = '16px';
		container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
		container.style.textAlign = 'center';
		container.style.zIndex = 1000;
		container.style.fontFamily = "'Cairo', sans-serif"; // Arabic-friendly font
		container.style.minWidth = '300px';
	
		// Add Google Font (Cairo)
		if (!document.getElementById('googleFont')) {
			const fontLink = document.createElement('link');
			fontLink.id = 'googleFont';
			fontLink.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap';
			fontLink.rel = 'stylesheet';
			document.head.appendChild(fontLink);
		}
	
		// Create title
		const title = document.createElement('div');
		title.textContent = 'هات اسمك لو سمحت';
		title.style.fontSize = '22px';
		title.style.marginBottom = '15px';
		title.style.color = '#333';
	
		// Create input
		const input = document.createElement('input');
		input.id = 'name';
		input.dir = 'rtl';
		input.type = 'text';
		input.placeholder = '';
		input.style.width = '100%';
		input.style.padding = '12px';
		input.style.border = '1px solid #ccc';
		input.style.borderRadius = '8px';
		input.style.fontSize = '18px';
		input.style.marginBottom = '20px';
		input.style.fontFamily = 'inherit';
	
		// Create button
		const button = document.createElement('button');
		button.textContent = 'ابدأ اللعبة';
		button.style.backgroundColor = '#e53935';
		button.style.color = 'white';
		button.style.border = 'none';
		button.style.padding = '12px 24px';
		button.style.borderRadius = '8px';
		button.style.fontSize = '18px';
		button.style.cursor = 'pointer';
		button.style.fontFamily = 'inherit';
	
		// Handle submission
		button.onclick = () => {
			const playerName = input.value.trim();
			if (playerName.length > 0) {
				localStorage.setItem('username', playerName);
				container.remove();
				GameManager.startGame(this);
			} else {
				alert('من فضلك أدخل اسمك!');
			}
		};
	
		// Append to container
		container.appendChild(title);
		container.appendChild(input);
		container.appendChild(button);
	
		// Add to DOM
		document.body.appendChild(container);
		}
	}
	
	
	
}
