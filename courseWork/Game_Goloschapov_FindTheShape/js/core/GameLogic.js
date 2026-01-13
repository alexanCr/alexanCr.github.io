class GameLogic {
    constructor() {
        this.auth = new Auth();
        this.storage = new Storage();
        this.timer = new Timer();
        this.scoreManager = new ScoreManager();
        this.renderer = new Renderer('gameCanvas');
        this.levelManager = new LevelManager();
        this.animations = new Animations();
        
        this.canvas = this.renderer.canvas;
        this.ctx = this.renderer.ctx;
        
        this.currentLevel = 1;
        this.shapes = [];
        this.selectedShapes = [];
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.currentQuestion = null;
        this.isPaused = false;
        this.isGameOver = false;
        this.animationId = null;
        this.lastFrameTime = performance.now();
        
        this.isDragging = false;
        this.draggedShape = null;
        this.dragTarget = null;
        this.dropZones = [];
        this.floatingTexts = [];
        
        this.setupEventHandlers();
        this.setupTimerCallbacks();
        this.gameLoop = this.gameLoop.bind(this);
    }

    startGame(level) {
        if (this.timer.isRunning) {
            this.timer.stop();
        }
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        const oldSplash = document.getElementById('gameSplash');
        if (oldSplash) oldSplash.remove();
        
        const oldOverlays = document.querySelectorAll('.game-overlay');
        oldOverlays.forEach(overlay => overlay.remove());
        
        this.currentLevel = level;
        this.isGameOver = false;
        this.isPaused = false;
        this.timerStarted = false;
        
        this.scoreManager.setLevel(level);
        this.scoreManager.resetMultiplier();
        
        this.questions = this.levelManager.getQuestionsSet(level);
        this.currentQuestionIndex = 0;
        this.currentQuestion = this.questions[0];
        
        this.shapes = [];
        this.selectedShapes = [];
        this.dropZones = [];
        this.isDragging = false;
        this.draggedShape = null;
        this.dragTarget = null;
        
        const config = this.levelManager.getLevelConfig(level);
        this.timeLimit = config.timeLimit;
        
        this.updateUI();
        this.initTimerDisplay();
        this.hideCompleteLevelButton();
        
        this.isGameOver = false;
        this.lastFrameTime = performance.now();
        this.gameLoop(this.lastFrameTime);
        
        this.showSplashScreen();
    }

    showSplashScreen() {
        const config = this.levelManager.getLevelConfig(this.currentLevel);
        
        const canvasSection = document.querySelector('.canvas-section');
        const splash = document.createElement('div');
        splash.id = 'gameSplash';
        splash.className = 'game-splash';
        splash.innerHTML = `
            <div class="splash-content">
                <h2 class="splash-title">${config.name}</h2>
                <p class="splash-description">${this.currentQuestion.text}</p>
                <button class="splash-button" id="startGameButton">НАЧАТЬ</button>
            </div>
        `;
        canvasSection.appendChild(splash);
        
        document.getElementById('startGameButton').addEventListener('click', () => {
            this.generateShapes();
            this.applyLevelMechanics();
            this.startTimer();
            splash.remove();
        });
    }

    startTimer() {
        if (!this.timerStarted && !this.isGameOver) {
            this.timer.start(this.timeLimit);
            this.timerStarted = true;
        }
    }

    initTimerDisplay() {
        const timerText = document.getElementById('timerText');
        if (timerText && this.timeLimit) {
            timerText.textContent = `${this.timeLimit}.00`;
            timerText.classList.remove('warning');
        }
    }

    generateShapes() {
        this.shapes = [];
        this.selectedShapes = [];
        const config = this.levelManager.getLevelConfig(this.currentLevel);
        
        if (config.mechanics.textLabels) {
            const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
            const colorNames = {
                'red': 'КРАСНЫЙ', 'blue': 'СИНИЙ', 'green': 'ЗЕЛЕНЫЙ',
                'yellow': 'ЖЕЛТЫЙ', 'purple': 'ФИОЛЕТОВЫЙ', 'orange': 'ОРАНЖЕВЫЙ'
            };
            
            for (let i = 0; i < config.shapeCount; i++) {
                const actualColor = Utils.randomChoice(colors);
                const position = this.findFreePosition(60);
                
                let textLabel;
                if (Math.random() < 0.5) {
                    textLabel = colorNames[actualColor];
                } else {
                    const otherColors = colors.filter(c => c !== actualColor);
                    const wrongColor = Utils.randomChoice(otherColors);
                    textLabel = colorNames[wrongColor];
                }
                
                const hexColor = Utils.colorNameToHex(actualColor);
                const circle = new Circle(position.x, position.y, 60, hexColor, 0);
                circle.textLabel = textLabel;
                
                this.shapes.push(circle);
                this.animations.flicker(circle);
            }
            return;
        }
        
        const correctCount = Utils.randomInt(2, 4);
        for (let i = 0; i < correctCount; i++) {
            this.shapes.push(this.createShapeForQuestion(this.currentQuestion));
        }
        
        const randomCount = config.shapeCount - correctCount;
        for (let i = 0; i < randomCount; i++) {
            this.shapes.push(this.createRandomShape(this.currentQuestion));
        }
        
        Utils.shuffleArray(this.shapes);
        
        if (config.mechanics.keyboardShortcuts) {
            this.shapes.forEach((shape, index) => {
                if (index < 9) {
                    shape.numberLabel = (index + 1).toString();
                }
            });
        }
        
        this.applyLevelMechanics();
    }

    createShapeForQuestion(question) {
        let type = question.correctType;
        if (!type || type === 'null' || type === null) {
            const shapes = ['circle', 'square', 'triangle', 'pentagon', 'hexagon', 'star'];
            type = Utils.randomChoice(shapes);
        }
        
        const ShapeClass = Utils.getShapeClass(type);
        const position = this.findFreePosition(60);
        
        let color = question.correctColor;
        if (!color || color === 'null' || color === null) {
            const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
            color = Utils.randomChoice(colors);
        }
        const hexColor = Utils.colorNameToHex(color);
        
        let size;
        if (question.type === 'size') {
            if (question.criteria === 'большой') {
                size = Utils.randomInt(65, 80);
            } else if (question.criteria === 'маленький') {
                size = Utils.randomInt(25, 35);
            } else if (question.criteria === 'средний') {
                size = Utils.randomInt(40, 60);
            } else {
                size = Utils.randomInt(50, 80);
            }
        } else {
            size = Utils.randomInt(50, 80);
        }
        
        return new ShapeClass(position.x, position.y, size, hexColor, Utils.randomInt(0, 360));
    }

    createRandomShape(question) {
        const shapes = ['circle', 'square', 'triangle', 'pentagon', 'hexagon', 'star'];
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        const sizes = ['маленький', 'средний', 'большой'];
        
        let type, color, size;
        
        if (question.type === 'size') {
            type = Utils.randomChoice(shapes);
            color = Utils.randomChoice(colors);
            
            const wrongSizes = sizes.filter(s => s !== question.criteria);
            const wrongSize = Utils.randomChoice(wrongSizes);
            
            if (wrongSize === 'большой') {
                size = Utils.randomInt(65, 80);
            } else if (wrongSize === 'маленький') {
                size = Utils.randomInt(25, 35);
            } else {
                size = Utils.randomInt(40, 60);
            }
        } else {
            do {
                type = Utils.randomChoice(shapes);
                color = Utils.randomChoice(colors);
            } while (type === question.correctType && color === question.correctColor);
            
            size = Utils.randomInt(50, 80);
        }
        
        const ShapeClass = Utils.getShapeClass(type);
        const position = this.findFreePosition(60);
        const hexColor = Utils.colorNameToHex(color);
        
        return new ShapeClass(position.x, position.y, size, hexColor, Utils.randomInt(0, 360));
    }

    isPositionOverlapping(x, y, size) {
        const margin = 20;
        for (const shape of this.shapes) {
            const distance = Math.sqrt(Math.pow(x - shape.x, 2) + Math.pow(y - shape.y, 2));
            if (distance < (size + shape.size + margin)) {
                return true;
            }
        }
        return false;
    }

    findFreePosition(size, attempts = 0) {
        if (attempts >= 50) {
            return {
                x: this.renderer.width / 2,
                y: this.renderer.height / 2
            };
        }
        
        const margin = 100;
        const x = Utils.randomInt(margin, this.renderer.width - margin);
        const y = Utils.randomInt(margin, this.renderer.height - margin);
        
        if (!this.isPositionOverlapping(x, y, size)) {
            return { x, y };
        }
        
        return this.findFreePosition(size, attempts + 1);
    }

    applyLevelMechanics() {
        const config = this.levelManager.getLevelConfig(this.currentLevel);
        
        if (config.mechanics.movement) {
            this.shapes.forEach(shape => {
                const speed = Utils.randomFloat(0.5, 1.5);
                const angle = Utils.randomFloat(0, Math.PI * 2);
                shape.velocity = {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed
                };
            });
            
            const dropZoneSize = 200;
            const padding = 50;
            
            const possiblePositions = [
                { x: padding, y: this.renderer.height - dropZoneSize - padding },
                { x: this.renderer.width - dropZoneSize - padding, y: this.renderer.height - dropZoneSize - padding },
                { x: padding, y: padding },
                { x: this.renderer.width - dropZoneSize - padding, y: padding },
                { x: (this.renderer.width - dropZoneSize) / 2, y: this.renderer.height - dropZoneSize - padding },
                { x: padding, y: (this.renderer.height - dropZoneSize) / 2 }
            ];
            
            const randomPos = Utils.randomChoice(possiblePositions);
            
            this.dropZones = [
                {
                    x: randomPos.x,
                    y: randomPos.y,
                    width: dropZoneSize,
                    height: dropZoneSize,
                    label: this.currentQuestion.text,
                    correctType: this.currentQuestion.correctType,
                    correctColor: this.currentQuestion.correctColor
                }
            ];
        }
    }

    update(deltaTime) {
        if (this.isPaused || this.isGameOver) return;
        
        this.animations.update();
        
        const config = this.levelManager.getLevelConfig(this.currentLevel);
        if (config.mechanics.movement) {
            const timeScale = deltaTime / 16.67;
            
            if (this.isDragging && this.draggedShape && this.dragTarget) {
                const smoothing = 0.3;
                this.draggedShape.x += (this.dragTarget.x - this.draggedShape.x) * smoothing;
                this.draggedShape.y += (this.dragTarget.y - this.draggedShape.y) * smoothing;
            }
            
            this.shapes.forEach(shape => {
                if (shape.velocity && shape !== this.draggedShape) {
                    shape.x += shape.velocity.x * timeScale;
                    shape.y += shape.velocity.y * timeScale;
                    
                    const margin = 50;
                    if (shape.x - shape.size < margin || shape.x + shape.size > this.renderer.width - margin) {
                        shape.velocity.x *= -1;
                        if (shape.x - shape.size < margin) shape.x = margin + shape.size;
                        if (shape.x + shape.size > this.renderer.width - margin) shape.x = this.renderer.width - margin - shape.size;
                    }
                    if (shape.y - shape.size < margin || shape.y + shape.size > this.renderer.height - margin) {
                        shape.velocity.y *= -1;
                        if (shape.y - shape.size < margin) shape.y = margin + shape.size;
                        if (shape.y + shape.size > this.renderer.height - margin) shape.y = this.renderer.height - margin - shape.size;
                    }
                }
            });
        }
        
        this.floatingTexts = this.floatingTexts.filter(ft => {
            ft.y -= 2;
            ft.opacity -= 0.02;
            return ft.opacity > 0;
        });
    }

    render() {
        this.renderer.clear();
        this.renderer.drawBackground();
        
        if (this.dropZones.length > 0) {
            this.dropZones.forEach(zone => {
                this.renderer.drawDropZone(zone.x, zone.y, zone.width, zone.height, zone.label);
            });
        }
        
        this.shapes.forEach(shape => {
            shape.draw(this.ctx);
        });
        
        this.floatingTexts.forEach(ft => {
            this.ctx.save();
            this.ctx.globalAlpha = ft.opacity;
            this.ctx.fillStyle = ft.color;
            this.ctx.font = 'bold 32px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(ft.text, ft.x, ft.y);
            this.ctx.restore();
        });
    }

    gameLoop(currentTime) {
        if (this.isGameOver) return;
        
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        this.animationId = requestAnimationFrame(this.gameLoop);
    }

    checkAnswer() {
        if (this.isPaused || this.isGameOver) return;
        
        const config = this.levelManager.getLevelConfig(this.currentLevel);
        let isCorrect = false;
        
        if (config.mechanics.dragAndDrop) {
            const zone = this.dropZones[0];
            const correctShapes = this.levelManager.getCorrectShapes(this.currentQuestion, this.shapes);
            
            const correctInZone = correctShapes.filter(shape => 
                this.isShapeInZone(shape, zone)
            );
            
            const wrongInZone = this.shapes.filter(shape => 
                !correctShapes.includes(shape) && this.isShapeInZone(shape, zone)
            );
            
            isCorrect = correctInZone.length === correctShapes.length && wrongInZone.length === 0;
        } else {
            isCorrect = this.levelManager.checkAnswer(this.currentQuestion, this.selectedShapes, this.shapes);
        }
        
        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    handleCorrectAnswer() {
        const points = this.scoreManager.addCorrectAnswer();
        this.addFloatingText(`+${points}`, this.renderer.width / 2, this.renderer.height / 2, { 
            color: '#32CD32' 
        });
        
        this.selectedShapes.forEach(shape => {
            this.animations.pulse(shape, 500);
        });
        
        setTimeout(() => this.nextQuestion(), 1000);
    }

    handleWrongAnswer() {
        const penalty = this.scoreManager.addWrongAnswer();
        this.addFloatingText(`${penalty}`, this.renderer.width / 2, this.renderer.height / 2, { 
            color: '#FF4444' 
        });
        
        this.updateUI();
        
        this.shapes.forEach(shape => {
            this.animations.shake(shape, 300);
        });
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        
        const config = this.levelManager.getLevelConfig(this.currentLevel);
        const minQuestionsRequired = 5;
        
        if (this.currentQuestionIndex >= minQuestionsRequired) {
            this.showCompleteLevelButton();
            
            if (this.currentQuestionIndex >= this.questions.length) {
                const bonusQuestion = this.levelManager.getBonusQuestion(this.currentLevel, this.questions);
                if (bonusQuestion) {
                    this.questions.push(bonusQuestion);
                    this.currentQuestion = bonusQuestion;
                    
                    const bonusCount = this.currentQuestionIndex - minQuestionsRequired + 1;
                    this.scoreManager.setBonusMultiplier(bonusCount);
                } else {
                    this.completeLevel();
                    return;
                }
            } else {
                this.currentQuestion = this.questions[this.currentQuestionIndex];
                const bonusCount = this.currentQuestionIndex - minQuestionsRequired + 1;
                this.scoreManager.setBonusMultiplier(bonusCount);
            }
        } else {
            if (this.currentQuestionIndex >= this.questions.length) {
                this.completeLevel();
                return;
            }
            this.currentQuestion = this.questions[this.currentQuestionIndex];
        }
        
        this.generateShapes();
        this.updateUI();
    }

    completeLevel() {
        this.isGameOver = true;
        this.timer.stop();
        
        const multiplier = this.scoreManager.getBonusMultiplier();
        if (multiplier > 1.0) {
            const baseScore = this.scoreManager.getLevelScore(this.currentLevel) / multiplier;
            const bonusPoints = Math.floor(baseScore * (multiplier - 1.0));
            this.scoreManager.addPoints(bonusPoints);
        }
        
        this.showVictoryScreen();
    }

    updateUI() {
        const config = this.levelManager.getLevelConfig(this.currentLevel);
        const minQuestionsRequired = 5;
        
        document.getElementById('questionText').textContent = this.currentQuestion.text;
        
        const progressText = document.getElementById('progressText');
        if (this.currentQuestionIndex < minQuestionsRequired) {
            progressText.textContent = `Вопрос ${this.currentQuestionIndex + 1} из ${minQuestionsRequired}`;
            progressText.classList.remove('gold-glow');
        } else {
            const bonusNum = this.currentQuestionIndex - minQuestionsRequired + 1;
            const multiplier = this.scoreManager.getBonusMultiplier();
            progressText.textContent = `Вопрос ${this.currentQuestionIndex + 1} (Бонус x${multiplier.toFixed(1)})`;
            progressText.classList.add('gold-glow');
        }
        
        const maxLevel = Object.keys(this.levelManager.levels).length;
        document.getElementById('levelText').textContent = `${this.currentLevel} из ${maxLevel}`;
        
        const scoreText = document.getElementById('scoreText');
        const currentScore = this.scoreManager.getLevelScore(this.currentLevel);
        const multiplier = this.scoreManager.getBonusMultiplier();
        
        if (multiplier > 1.0) {
            scoreText.innerHTML = `${currentScore} <span class="gold-glow">(x${multiplier.toFixed(1)})</span>`;
        } else {
            scoreText.textContent = currentScore;
        }
    }

    setupEventHandlers() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleHover(e));
        this.canvas.addEventListener('contextmenu', (e) => this.handleRightClick(e));
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    setupTimerCallbacks() {
        this.timer.callbacks.onTick = (seconds) => {};
        
        this.timer.callbacks.onMsTick = (seconds, ms) => {
            const timerText = document.getElementById('timerText');
            if (timerText) {
                let displaySeconds, displayMs;
                
                if (ms === 0) {
                    displaySeconds = Math.max(0, seconds);
                    displayMs = '00';
                } else {
                    displaySeconds = Math.max(0, seconds - 1);
                    const msRemaining = Math.floor((1000 - ms) / 10);
                    displayMs = msRemaining.toString().padStart(2, '0');
                }
                
                timerText.textContent = `${displaySeconds}.${displayMs}`;
                
                if (displaySeconds <= 10) {
                    timerText.classList.add('warning');
                } else {
                    timerText.classList.remove('warning');
                }
            }
        };
        
        this.timer.callbacks.onWarning = () => {};
        
        this.timer.callbacks.onExpire = () => {
            const minQuestionsRequired = 5;
            
            if (this.currentQuestionIndex >= minQuestionsRequired) {
                this.showVictoryScreen();
            } else {
                this.showDefeatScreen();
            }
        };
    }

    handleClick(e) {
        if (this.isPaused || this.isGameOver) return;
        
        const config = this.levelManager.getLevelConfig(this.currentLevel);
        if (!config.mechanics.clickSelection) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const shape = this.shapes[i];
            if (shape.isPointInside(x, y)) {
                shape.toggleSelect();
                
                if (shape.selected) {
                    this.selectedShapes.push(shape);
                } else {
                    const index = this.selectedShapes.indexOf(shape);
                    if (index > -1) {
                        this.selectedShapes.splice(index, 1);
                    }
                }
                break;
            }
        }
    }

    handleDoubleClick(e) {
        if (this.isPaused || this.isGameOver) return;
        
        const config = this.levelManager.getLevelConfig(this.currentLevel);
        if (!config.mechanics.dragAndDrop) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const zone = this.dropZones[0];
        const correctShapes = this.levelManager.getCorrectShapes(this.currentQuestion, this.shapes);
        
        correctShapes.forEach(shape => {
            shape.x = zone.x + zone.width / 2;
            shape.y = zone.y + zone.height / 2;
            shape.velocity = { x: 0, y: 0 };
        });
    }

    handleMouseDown(e) {
        if (this.isPaused || this.isGameOver) return;
        
        const config = this.levelManager.getLevelConfig(this.currentLevel);
        if (!config.mechanics.dragAndDrop) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const shape = this.shapes[i];
            if (shape.isPointInside(x, y)) {
                this.isDragging = true;
                this.draggedShape = shape;
                this.draggedShape.savedVelocity = { ...shape.velocity };
                this.draggedShape.velocity = { x: 0, y: 0 };
                this.draggedShape.offset = {
                    x: x - shape.x,
                    y: y - shape.y
                };
                break;
            }
        }
    }

    handleMouseMove(e) {
        const config = this.levelManager.getLevelConfig(this.currentLevel);
        
        if (config.mechanics.dragAndDrop) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (this.isDragging && this.draggedShape) {
                this.dragTarget = {
                    x: x - this.draggedShape.offset.x,
                    y: y - this.draggedShape.offset.y
                };
            }
            return;
        }
        
        if (this.isDragging && this.draggedShape) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.draggedShape.x = x - this.draggedShape.offset.x;
            this.draggedShape.y = y - this.draggedShape.offset.y;
        }
    }

    handleHover(e) {
        if (this.isPaused || this.isGameOver) return;
        
        const config = this.levelManager.getLevelConfig(this.currentLevel);
        if (config.mechanics.dragAndDrop) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.shapes.forEach(shape => {
            shape.hovered = false;
        });
        
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const shape = this.shapes[i];
            if (shape.isPointInside(x, y)) {
                shape.hovered = true;
                break;
            }
        }
    }

    handleMouseUp(e) {
        if (!this.isDragging || !this.draggedShape) return;
        
        const zone = this.dropZones[0];
        const correctShapes = this.levelManager.getCorrectShapes(this.currentQuestion, this.shapes);
        
        if (this.isShapeInZone(this.draggedShape, zone)) {
            if (correctShapes.includes(this.draggedShape)) {
                this.draggedShape.velocity = { x: 0, y: 0 };
            } else {
                if (this.draggedShape.savedVelocity) {
                    this.draggedShape.velocity = { ...this.draggedShape.savedVelocity };
                } else {
                    const speed = Utils.randomFloat(0.5, 1.5);
                    const angle = Utils.randomFloat(0, Math.PI * 2);
                    this.draggedShape.velocity = {
                        x: Math.cos(angle) * speed,
                        y: Math.sin(angle) * speed
                    };
                }
            }
        } else {
            if (this.draggedShape.savedVelocity) {
                this.draggedShape.velocity = { ...this.draggedShape.savedVelocity };
            } else {
                const speed = Utils.randomFloat(0.5, 1.5);
                const angle = Utils.randomFloat(0, Math.PI * 2);
                this.draggedShape.velocity = {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed
                };
            }
        }
        
        this.isDragging = false;
        this.draggedShape = null;
        this.dragTarget = null;
    }

    isShapeInZone(shape, zone) {
        return shape.x > zone.x && 
               shape.x < zone.x + zone.width && 
               shape.y > zone.y && 
               shape.y < zone.y + zone.height;
    }

    handleRightClick(e) {
        e.preventDefault();
        
        if (this.isPaused || this.isGameOver) return;
        
        const config = this.levelManager.getLevelConfig(this.currentLevel);
        if (!config.mechanics.rightClickHint) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const shape = this.shapes[i];
            if (shape.isPointInside(x, y)) {
                this.animations.pulse(shape, 500);
                this.addFloatingText(shape.color, shape.x, shape.y - 50, {
                    color: shape.color
                });
                break;
            }
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Escape') {
            const cheatModal = document.getElementById('cheatModal');
            if (cheatModal && !cheatModal.classList.contains('hidden')) {
                cheatModal.classList.add('hidden');
                if (this.isPaused && !this.isGameOver) {
                    this.timer.resume();
                    this.isPaused = false;
                }
                return;
            }
            this.togglePause();
            return;
        }
        
        if (this.isPaused || this.isGameOver) return;
        if (!this.timerStarted) return;
        
        if (e.key === 'Enter') {
            this.checkAnswer();
            return;
        }

        const config = this.levelManager.getLevelConfig(this.currentLevel);
        if (config.mechanics.keyboardShortcuts) {
            const num = parseInt(e.key);
            
            if (!isNaN(num) && num >= 1 && num <= 9 && num <= this.shapes.length) {
                const shape = this.shapes[num - 1];
                if (shape) {
                    shape.toggleSelect();
                    
                    if (shape.selected) {
                        if (!this.selectedShapes.includes(shape)) {
                            this.selectedShapes.push(shape);
                        }
                    } else {
                        const index = this.selectedShapes.indexOf(shape);
                        if (index > -1) {
                            this.selectedShapes.splice(index, 1);
                        }
                    }
                }
            }
        }
    }

    addFloatingText(text, x, y, options = {}) {
        this.floatingTexts.push({
            text: text,
            x: x,
            y: y,
            opacity: 1,
            color: options.color || '#FFD700'
        });
    }

    showCompleteLevelButton() {
        let completeBtn = document.getElementById('completeLevelButton');
        if (!completeBtn) {
            completeBtn = document.createElement('button');
            completeBtn.id = 'completeLevelButton';
            completeBtn.className = 'panel-button';
            completeBtn.textContent = 'ЗАВЕРШИТЬ УРОВЕНЬ';
            completeBtn.onclick = () => this.completeLevel();
            
            const panelButtons = document.querySelector('.panel-buttons');
            panelButtons.appendChild(completeBtn);
        }
        completeBtn.style.display = 'block';
        
        const maxLevel = Object.keys(this.levelManager.levels).length;
        if (this.currentLevel < maxLevel) {
            let nextLevelBtn = document.getElementById('nextLevelButton');
            if (!nextLevelBtn) {
                nextLevelBtn = document.createElement('button');
                nextLevelBtn.id = 'nextLevelButton';
                nextLevelBtn.className = 'panel-button';
                nextLevelBtn.textContent = 'СЛЕДУЮЩИЙ УРОВЕНЬ';
                nextLevelBtn.onclick = () => {
                    this.goToNextLevel();
                };
                
                const panelButtons = document.querySelector('.panel-buttons');
                panelButtons.insertBefore(nextLevelBtn, completeBtn.nextSibling);
            }
            nextLevelBtn.style.display = 'block';
        }
    }

    hideCompleteLevelButton() {
        const completeBtn = document.getElementById('completeLevelButton');
        if (completeBtn) {
            completeBtn.style.display = 'none';
        }
        
        const nextLevelBtn = document.getElementById('nextLevelButton');
        if (nextLevelBtn) {
            nextLevelBtn.style.display = 'none';
        }
    }

    showVictoryScreen() {
        this.isGameOver = true;
        this.timer.stop();
        
        this.saveProgress();
        
        const multiplier = this.scoreManager.getBonusMultiplier();
        const finalScore = this.scoreManager.getLevelScore(this.currentLevel);
        const bonusText = multiplier > 1.0 ? `x${multiplier.toFixed(1)} множитель` : '';
        
        const canvasSection = document.querySelector('.canvas-section');
        const overlay = document.createElement('div');
        overlay.className = 'game-overlay';
        overlay.innerHTML = `
            <div class="overlay-content">
                <h2 class="overlay-title">ПОБЕДА!</h2>
                <div class="overlay-stats">
                    <p>Уровень ${this.currentLevel} пройден</p>
                    <p>Очки: ${finalScore}</p>
                    ${bonusText ? `<p class="gold-glow">${bonusText}</p>` : ''}
                </div>
                <div class="overlay-buttons">
                    ${this.currentLevel < Object.keys(this.levelManager.levels).length ? '<button class="panel-button primary" onclick="game.goToNextLevel()">СЛЕДУЮЩИЙ УРОВЕНЬ</button>' : ''}
                    <button class="panel-button" onclick="game.goToLeaderboard()">ТАБЛИЦА ЛИДЕРОВ</button>
                </div>
            </div>
        `;
        canvasSection.appendChild(overlay);
    }

    showDefeatScreen() {
        this.isGameOver = true;
        this.timer.stop();
        
        this.saveProgress();
        
        const finalScore = this.scoreManager.getLevelScore(this.currentLevel);
        
        const canvasSection = document.querySelector('.canvas-section');
        const overlay = document.createElement('div');
        overlay.className = 'game-overlay';
        overlay.innerHTML = `
            <div class="overlay-content">
                <h2 class="overlay-title defeat">ПОРАЖЕНИЕ...</h2>
                <div class="overlay-stats">
                    <p>Время истекло</p>
                    <p>Очки: ${finalScore}</p>
                    <p>Требовалось ответить на 5 вопросов</p>
                </div>
                <div class="overlay-buttons">
                    <button class="panel-button primary" onclick="game.restartLevel()">ПОВТОРИТЬ УРОВЕНЬ</button>
                    <button class="panel-button" onclick="game.goToLeaderboard()">ТАБЛИЦА ЛИДЕРОВ</button>
                </div>
            </div>
        `;
        canvasSection.appendChild(overlay);
    }

    restartLevel() {
        const overlay = document.querySelector('.game-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        const splash = document.getElementById('gameSplash');
        if (splash) {
            splash.remove();
        }
        
        this.startGame(this.currentLevel);
    }

    goToNextLevel() {
        const overlay = document.querySelector('.game-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        const splash = document.getElementById('gameSplash');
        if (splash) {
            splash.remove();
        }
        
        const nextLevel = this.currentLevel + 1;
        const maxLevel = Object.keys(this.levelManager.levels).length;
        if (nextLevel <= maxLevel) {
            this.storage.unlockLevel(this.auth.getCurrentUser(), nextLevel);
            this.startGame(nextLevel);
        } else {
            window.location.href = 'leaderboard.html';
        }
    }

    goToLeaderboard() {
        window.location.href = 'leaderboard.html';
    }

    saveProgress() {
        const username = this.auth.getCurrentUser();
        if (!username) return;
        
        const levelScores = {
            level1: 0,
            level2: 0,
            level3: 0
        };
        levelScores[`level${this.currentLevel}`] = this.scoreManager.getLevelScore(this.currentLevel);
        
        const totalScore = this.scoreManager.getScore();
        this.storage.saveGameSession(username, levelScores, totalScore);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.timer.pause();
            document.getElementById('pauseOverlay')?.classList.remove('hidden');
        } else {
            this.timer.resume();
            document.getElementById('pauseOverlay')?.classList.add('hidden');
        }
    }

    cheatAddPoints() {
        this.scoreManager.addPoints(100);
        this.updateUI();
        this.closeCheatMenu();
    }
    
    cheatAddTime() {
        this.timer.addTime(30);
        this.closeCheatMenu();
    }
    
    cheatSkipQuestion() {
        this.nextQuestion();
        this.closeCheatMenu();
    }
    
    cheatGoToLevel(level) {
        const maxLevel = Object.keys(this.levelManager.levels).length;
        if (level >= 1 && level <= maxLevel) {
            this.storage.unlockLevel(this.auth.getCurrentUser(), level);
            this.closeCheatMenu();
            this.startGame(level);
        }
    }
    
    closeCheatMenu() {
        document.getElementById('cheatModal').classList.add('hidden');
        if (this.isPaused && !this.isGameOver) {
            this.timer.resume();
            this.isPaused = false;
        }
    }
}
