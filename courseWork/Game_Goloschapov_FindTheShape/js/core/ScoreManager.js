class ScoreManager {
    constructor() {
        this.currentScore = 0;
        this.levelScores = {
            level1: 0,
            level2: 0,
            level3: 0
        };
        this.currentLevel = 1;
        this.bonusMultiplier = 1.0;
        this.correctPoints = {
            1: 10,
            2: 20,
            3: 30
        };
        this.penaltyPoints = {
            1: 5,
            2: 10,
            3: 15
        };
    }

    addCorrectAnswer() {
        const basePoints = this.correctPoints[this.currentLevel] || 10;
        const points = Math.round(basePoints * this.bonusMultiplier);
        this.currentScore += points;
        this.levelScores[`level${this.currentLevel}`] += points;
        return points;
    }

    setBonusMultiplier(bonusCount) {
        this.bonusMultiplier = 1.0 + (bonusCount * 0.2);
    }

    getBonusMultiplier() {
        return this.bonusMultiplier;
    }

    addWrongAnswer() {
        const penalty = this.penaltyPoints[this.currentLevel] || 5;
        this.currentScore = Math.max(0, this.currentScore - penalty);
        this.levelScores[`level${this.currentLevel}`] = Math.max(0, this.levelScores[`level${this.currentLevel}`] - penalty);
        return -penalty;
    }

    addPoints(points) {
        this.currentScore += points;
        this.levelScores[`level${this.currentLevel}`] += points;
    }

    getScore() {
        return this.currentScore;
    }

    getLevelScore(level) {
        return this.levelScores[`level${level}`] || 0;
    }

    getAllLevelScores() {
        return { ...this.levelScores };
    }

    setLevel(level) {
        this.currentLevel = level;
    }

    resetMultiplier() {
        this.bonusMultiplier = 1.0;
    }
}
