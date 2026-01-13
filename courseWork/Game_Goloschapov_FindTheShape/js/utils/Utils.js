class Utils {
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    static shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    static randomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    static calculatePolygonPoints(centerX, centerY, radius, sides, rotation = 0) {
        const points = [];
        const angleStep = (Math.PI * 2) / sides;
        for (let i = 0; i < sides; i++) {
            const angle = angleStep * i + rotation - Math.PI / 2;
            points.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            });
        }
        return points;
    }

    static calculateStarPoints(centerX, centerY, outerRadius, innerRadius, rotation = 0) {
        const points = [];
        const spikes = 5;
        const step = Math.PI / spikes;
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = i * step + rotation - Math.PI / 2;
            points.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            });
        }
        return points;
    }

    static colorNameToHex(colorName) {
        const colors = {
            'red': '#FF0000', 'blue': '#0000FF', 'green': '#00FF00',
            'yellow': '#FFFF00', 'purple': '#FF00FF', 'orange': '#FF8800'
        };
        return colors[colorName.toLowerCase()] || colorName;
    }

    static hexToColorNameRussian(hex) {
        const colors = {
            '#FF0000': 'КРАСНЫЙ', '#0000FF': 'СИНИЙ', '#00FF00': 'ЗЕЛЕНЫЙ',
            '#FFFF00': 'ЖЕЛТЫЙ', '#FF00FF': 'ФИОЛЕТОВЫЙ', '#FF8800': 'ОРАНЖЕВЫЙ'
        };
        return colors[hex.toUpperCase()] || hex;
    }

    static hexToColorName(hex) {
        const colors = {
            '#FF0000': 'red', '#0000FF': 'blue', '#00FF00': 'green',
            '#FFFF00': 'yellow', '#FF00FF': 'purple', '#FF8800': 'orange'
        };
        return colors[hex.toUpperCase()] || hex;
    }

    static validateUsername(name) {
        return name && name.trim().length >= 2 && name.trim().length <= 20;
    }

    static radiusToSize(radius) {
        if (radius <= 35) return 'маленький';
        if (radius <= 60) return 'средний';
        return 'большой';
    }

    static getShapeClass(shapeName) {
        const shapeMap = {
            'circle': Circle, 'square': Square, 'triangle': Triangle,
            'pentagon': Pentagon, 'hexagon': Hexagon, 'star': Star
        };
        return shapeMap[shapeName] || Circle;
    }

    static randomChoice(array) {
        return this.randomElement(array);
    }

    static pointInPolygon(x, y, points) {
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            const xi = points[i].x, yi = points[i].y;
            const xj = points[j].x, yj = points[j].y;
            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }
}
