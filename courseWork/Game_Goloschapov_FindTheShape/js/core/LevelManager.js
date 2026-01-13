class LevelManager {
    constructor() {
        this.levels = this.initializeLevels();
        this.currentLevel = 1;
    }

    initializeLevels() {
        return {
            1: {
                name: 'Уровень 1: Кликни правильную фигуру',
                timeLimit: 60,
                shapeCount: 8,
                questionsCount: 5,
                difficulty: 'easy',
                mechanics: {
                    movement: false,
                    textLabels: false,
                    keyboardShortcuts: true,
                    clickSelection: true,
                    dragAndDrop: false,
                    rightClickHint: false
                },
                questions: this.getLevel1Questions()
            },
            2: {
                name: 'Уровень 2: Перетащи и сгруппируй',
                timeLimit: 60,
                shapeCount: 10,
                questionsCount: 5,
                difficulty: 'medium',
                mechanics: {
                    movement: true,
                    textLabels: false,
                    keyboardShortcuts: false,
                    clickSelection: false,
                    dragAndDrop: true,
                    rightClickHint: false
                },
                questions: this.getLevel2Questions()
            },
            3: {
                name: 'Уровень 3: Текст против Цвета',
                timeLimit: 60,
                shapeCount: 12,
                questionsCount: 5,
                difficulty: 'hard',
                mechanics: {
                    movement: false,
                    textLabels: true,
                    keyboardShortcuts: true,
                    clickSelection: true,
                    dragAndDrop: false,
                    rightClickHint: true
                },
                questions: this.getLevel3Questions()
            }
        };
    }

    getLevel1Questions() {
        return [
            { type: 'color', criteria: 'red', text: 'Найди все КРАСНЫЕ фигуры', correctColor: 'red', correctType: null },
            { type: 'color', criteria: 'blue', text: 'Найди все СИНИЕ фигуры', correctColor: 'blue', correctType: null },
            { type: 'color', criteria: 'green', text: 'Найди все ЗЕЛЕНЫЕ фигуры', correctColor: 'green', correctType: null },
            { type: 'color', criteria: 'yellow', text: 'Найди все ЖЕЛТЫЕ фигуры', correctColor: 'yellow', correctType: null },
            { type: 'shape', criteria: 'circle', text: 'Найди все КРУГИ', correctColor: null, correctType: 'circle' },
            { type: 'shape', criteria: 'square', text: 'Найди все КВАДРАТЫ', correctColor: null, correctType: 'square' },
            { type: 'shape', criteria: 'triangle', text: 'Найди все ТРЕУГОЛЬНИКИ', correctColor: null, correctType: 'triangle' },
            { type: 'shape', criteria: 'star', text: 'Найди все ЗВЕЗДЫ', correctColor: null, correctType: 'star' },
            { type: 'sides', criteria: 3, text: 'Найди фигуры с 3 сторонами', correctColor: null, correctType: null },
            { type: 'sides', criteria: 4, text: 'Найди фигуры с 4 сторонами', correctColor: null, correctType: null },
            { type: 'sides', criteria: 5, text: 'Найди фигуры с 5 сторонами', correctColor: null, correctType: null },
            { type: 'size', criteria: 'большой', text: 'Найди самые БОЛЬШИЕ фигуры', correctColor: null, correctType: null },
            { type: 'size', criteria: 'маленький', text: 'Найди самые МАЛЕНЬКИЕ фигуры', correctColor: null, correctType: null }
        ];
    }

    getLevel2Questions() {
        return [
            { type: 'group-color', criteria: 'red', text: 'Перетащи все КРАСНЫЕ фигуры в зону', correctColor: 'red', correctType: null },
            { type: 'group-color', criteria: 'blue', text: 'Перетащи все СИНИЕ фигуры в зону', correctColor: 'blue', correctType: null },
            { type: 'group-color', criteria: 'green', text: 'Перетащи все ЗЕЛЕНЫЕ фигуры в зону', correctColor: 'green', correctType: null },
            { type: 'group-shape', criteria: 'circle', text: 'Собери все КРУГИ в зону', correctColor: null, correctType: 'circle' },
            { type: 'group-shape', criteria: 'triangle', text: 'Собери все ТРЕУГОЛЬНИКИ в зону', correctColor: null, correctType: 'triangle' },
            { type: 'group-shape', criteria: 'square', text: 'Собери все КВАДРАТЫ в зону', correctColor: null, correctType: 'square' },
            { type: 'group-shape', criteria: 'star', text: 'Собери все ЗВЕЗДЫ в зону', correctColor: null, correctType: 'star' }
        ];
    }

    getLevel3Questions() {
        return [
            { type: 'actual-color', criteria: 'red', text: 'Найди все КРАСНЫЕ круги (по цвету, не по тексту)' },
            { type: 'actual-color', criteria: 'blue', text: 'Найди все СИНИЕ круги (по цвету, не по тексту)' },
            { type: 'actual-color', criteria: 'green', text: 'Найди все ЗЕЛЕНЫЕ круги (по цвету, не по тексту)' },
            { type: 'text-color', criteria: 'red', text: 'Найди круги с текстом "КРАСНЫЙ"' },
            { type: 'text-color', criteria: 'blue', text: 'Найди круги с текстом "СИНИЙ"' },
            { type: 'text-color', criteria: 'green', text: 'Найди круги с текстом "ЗЕЛЕНЫЙ"' },
            { type: 'text-color', criteria: 'yellow', text: 'Найди круги с текстом "ЖЕЛТЫЙ"' },
            { type: 'matching', criteria: true, text: 'Найди круги где ТЕКСТ = ЦВЕТ' },
            { type: 'mismatching', criteria: false, text: 'Найди круги где ТЕКСТ ≠ ЦВЕТ' }
        ];
    }

    getLevelConfig(level) {
        return this.levels[level] || this.levels[1];
    }

    getRandomQuestion(level) {
        const config = this.getLevelConfig(level);
        const questions = config.questions;
        return Utils.randomElement(questions);
    }

    getQuestionsSet(level) {
        const config = this.getLevelConfig(level);
        const questions = Utils.shuffleArray(config.questions);
        return questions.slice(0, config.questionsCount);
    }

    getBonusQuestion(level, usedQuestions) {
        const config = this.getLevelConfig(level);
        const availableQuestions = config.questions.filter(q => 
            !usedQuestions.some(used => used.text === q.text)
        );
        
        if (availableQuestions.length > 0) {
            return Utils.randomElement(availableQuestions);
        }
        return null;
    }

    checkAnswer(question, selectedShapes, allShapes) {
        const correctShapes = this.getCorrectShapes(question, allShapes);
        
        if (selectedShapes.length !== correctShapes.length) {
            return false;
        }

        return selectedShapes.every(shape => correctShapes.includes(shape));
    }

    getCorrectShapes(question, allShapes) {
        switch (question.type) {
            case 'color':
                return allShapes.filter(s => 
                    Utils.hexToColorName(s.color) === question.criteria
                );
            
            case 'shape':
                return allShapes.filter(s => s.getType() === question.criteria);
            
            case 'sides':
                return allShapes.filter(s => s.getSides() === question.criteria);
            
            case 'size':
                const targetSize = question.criteria;
                return allShapes.filter(s => 
                    Utils.radiusToSize(s.size) === targetSize
                );
            
            case 'group-color':
                return allShapes.filter(s => 
                    Utils.hexToColorName(s.color) === question.criteria
                );
            
            case 'group-shape':
                return allShapes.filter(s => s.getType() === question.criteria);
            
            case 'actual-color':
                return allShapes.filter(s => 
                    Utils.hexToColorName(s.color) === question.criteria
                );
            
            case 'text-color':
                const russianNames = {
                    'red': 'КРАСНЫЙ',
                    'blue': 'СИНИЙ',
                    'green': 'ЗЕЛЕНЫЙ',
                    'yellow': 'ЖЕЛТЫЙ',
                    'purple': 'ФИОЛЕТОВЫЙ',
                    'orange': 'ОРАНЖЕВЫЙ'
                };
                return allShapes.filter(s => 
                    s.textLabel === russianNames[question.criteria]
                );
            
            case 'matching':
                return allShapes.filter(s => 
                    s.textLabel === Utils.hexToColorNameRussian(s.color)
                );
            
            case 'mismatching':
                return allShapes.filter(s => 
                    s.textLabel !== Utils.hexToColorNameRussian(s.color)
                );
            
            default:
                return [];
        }
    }

    setCurrentLevel(level) {
        this.currentLevel = level;
    }

    getCurrentLevel() {
        return this.currentLevel;
    }
}
