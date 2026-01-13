class Storage {
    constructor() {
        this.leaderboardKey = 'leaderboard';
    }

    getPlayerData(username) {
        const key = `gameData_${username}`;
        const data = localStorage.getItem(key);
        
        if (data) {
            return JSON.parse(data);
        }

        return {
            username: username,
            games: [],
            highScore: 0,
            levelsUnlocked: 1,
            totalGamesPlayed: 0,
            averageScore: 0
        };
    }

    savePlayerData(username, data) {
        const key = `gameData_${username}`;
        localStorage.setItem(key, JSON.stringify(data));
    }

    saveGameSession(username, levelScores, totalScore) {
        const playerData = this.getPlayerData(username);

        const gameSession = {
            date: new Date().toISOString(),
            levelScores: levelScores,
            totalScore: totalScore,
            timestamp: Date.now()
        };

        playerData.games.push(gameSession);
        playerData.totalGamesPlayed = playerData.games.length;

        if (totalScore > playerData.highScore) {
            playerData.highScore = totalScore;
        }

        const totalAllGames = playerData.games.reduce((sum, g) => sum + g.totalScore, 0);
        playerData.averageScore = Math.round(totalAllGames / playerData.games.length);

        this.savePlayerData(username, playerData);
        this.updateLeaderboard(username, totalScore);
        
        this.updateLevelLeaderboard(username, 'level1', levelScores.level1);
        this.updateLevelLeaderboard(username, 'level2', levelScores.level2);
        this.updateLevelLeaderboard(username, 'level3', levelScores.level3);

        return playerData;
    }

    unlockLevel(username, level) {
        const playerData = this.getPlayerData(username);
        
        if (level > playerData.levelsUnlocked) {
            playerData.levelsUnlocked = level;
            this.savePlayerData(username, playerData);
        }
    }

    getUnlockedLevels(username) {
        const playerData = this.getPlayerData(username);
        return playerData.levelsUnlocked;
    }

    updateLeaderboard(username, score) {
        let leaderboard = this.getLeaderboard();

        const existingIndex = leaderboard.findIndex(entry => entry.username === username);

        if (existingIndex !== -1) {
            if (score > leaderboard[existingIndex].score) {
                leaderboard[existingIndex].score = score;
                leaderboard[existingIndex].date = new Date().toISOString();
            }
        } else {
            leaderboard.push({
                username: username,
                score: score,
                date: new Date().toISOString()
            });
        }

        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard = leaderboard.slice(0, 10);

        localStorage.setItem(this.leaderboardKey, JSON.stringify(leaderboard));
    }

    getLeaderboard() {
        const data = localStorage.getItem(this.leaderboardKey);
        return data ? JSON.parse(data) : [];
    }

    getPlayerRank(username) {
        const leaderboard = this.getLeaderboard();
        const index = leaderboard.findIndex(entry => entry.username === username);
        return index !== -1 ? index + 1 : null;
    }

    updateLevelLeaderboard(username, level, score) {
        const key = `leaderboard_${level}`;
        let leaderboard = JSON.parse(localStorage.getItem(key) || '[]');

        const existingIndex = leaderboard.findIndex(entry => entry.username === username);

        if (existingIndex !== -1) {
            if (score > leaderboard[existingIndex].score) {
                leaderboard[existingIndex].score = score;
                leaderboard[existingIndex].date = new Date().toISOString();
            }
        } else {
            leaderboard.push({
                username: username,
                score: score,
                date: new Date().toISOString()
            });
        }

        leaderboard.sort((a, b) => b.score - a.score);

        localStorage.setItem(key, JSON.stringify(leaderboard));
    }

    getLevelLeaderboard(level) {
        const key = `leaderboard_${level}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }
}
