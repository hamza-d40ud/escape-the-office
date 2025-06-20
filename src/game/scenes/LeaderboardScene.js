import { Scene } from 'phaser';

export class LeaderboardScene extends Scene {
    constructor() {
        super('LeaderboardScene');
    }

    create() {
        const centerX = 3840 / 2;
        const centerY = 2160 / 2;

        // Title
        this.add.text(centerX, centerY - 500, 'Leaderboard', {
            fontSize: '128px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // Loading text
        const loadingText = this.add.text(centerX, centerY - 300, 'Loading...', {
            fontSize: '80px',
            color: '#ffff99',
            fontFamily: 'Arial',
        }).setOrigin(0.5);

        // Fetch leaderboard data
        fetch('https://159.89.49.190:3000/api/v1/leaderboard/')
            .then(response => response.json())
            .then(data => {
                loadingText.destroy();
                if (data.status === 'success' && Array.isArray(data.data)) {
                    const leaderboard = data.data
                        .sort((a, b) => parseInt(b.score) - parseInt(a.score))
                        .slice(0, 5);
                    if (leaderboard.length === 0) {
                        this.add.text(centerX, centerY - 200, 'No scores yet!', {
                            fontSize: '64px',
                            color: '#ffaaaa',
                            fontFamily: 'Arial',
                        }).setOrigin(0.5);
                    } else {
                        leaderboard.forEach((entry, i) => {
                            this.add.text(centerX, centerY - 200 + i * 120, `${i + 1}. ${entry.username} - ${entry.score}`, {
                                fontSize: '80px',
                                color: '#ffff99',
                                fontFamily: 'Arial',
                            }).setOrigin(0.5);
                        });
                    }
                } else {
                    this.add.text(centerX, centerY - 200, 'Failed to load leaderboard.', {
                        fontSize: '64px',
                        color: '#ffaaaa',
                        fontFamily: 'Arial',
                    }).setOrigin(0.5);
                }
            })
            .catch(() => {
                loadingText.destroy();
                this.add.text(centerX, centerY - 200, 'Error loading leaderboard.', {
                    fontSize: '64px',
                    color: '#ffaaaa',
                    fontFamily: 'Arial',
                }).setOrigin(0.5);
            });

        // Return to Main Menu button
        const button = this.add.rectangle(centerX, centerY + 500, 600, 120, 0x222244).setInteractive({ useHandCursor: true });
        this.add.text(centerX, centerY + 500, 'Return to Main Menu', {
            fontSize: '64px',
            color: '#ffffff',
            fontFamily: 'Arial',
        }).setOrigin(0.5);

        button.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
} 