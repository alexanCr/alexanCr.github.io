class Hexagon extends Shape {
    constructor(x, y, size, color) {
        super(x, y, size, color);
    }

    getSides() {
        return 6;
    }

    getType() {
        return 'hexagon';
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;

        const points = Utils.calculatePolygonPoints(this.x, this.y, this.size, 6, this.rotation);
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        if (this.numberLabel) {
            ctx.fillStyle = '#FFD700';
            ctx.font = `bold ${this.size / 1.5}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.strokeText(this.numberLabel, this.x, this.y - this.size);
            ctx.fillText(this.numberLabel, this.x, this.y - this.size);
        }

        if (this.selected) {
            this.drawSelectionBorder(ctx);
        }

        if (this.hovered) {
            this.drawHoverEffect(ctx);
        }
    }

    isPointInside(mouseX, mouseY) {
        const points = Utils.calculatePolygonPoints(this.x, this.y, this.size, 6, this.rotation);
        return Utils.pointInPolygon(mouseX, mouseY, points);
    }
}
