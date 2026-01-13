class Circle extends Shape {
    constructor(x, y, size, color) {
        super(x, y, size, color);
    }

    getSides() {
        return 0;
    }

    getType() {
        return 'circle';
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        if (this.textLabel) {
            ctx.fillStyle = '#000000';
            ctx.font = `bold ${this.size / 2.5}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;
            ctx.strokeText(this.textLabel, this.x, this.y);
            ctx.fillText(this.textLabel, this.x, this.y);
        }

        if (this.numberLabel) {
            ctx.fillStyle = '#FFD700';
            ctx.font = `bold ${this.size / 2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            const yOffset = this.textLabel ? this.size * 0.8 : this.size / 2;
            ctx.strokeText(this.numberLabel, this.x, this.y - yOffset);
            ctx.fillText(this.numberLabel, this.x, this.y - yOffset);
        }

        if (this.selected) {
            this.drawSelectionBorder(ctx);
        }

        if (this.hovered) {
            this.drawHoverEffect(ctx);
        }

        ctx.restore();
    }

    isPointInside(mouseX, mouseY) {
        const distance = Math.sqrt((mouseX - this.x) ** 2 + (mouseY - this.y) ** 2);
        return distance <= this.size;
    }
}
