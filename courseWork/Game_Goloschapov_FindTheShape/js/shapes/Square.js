class Square extends Shape {
    constructor(x, y, size, color) {
        super(x, y, size, color);
    }

    getSides() {
        return 4;
    }

    getType() {
        return 'square';
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);

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
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const cos = Math.cos(-this.rotation);
        const sin = Math.sin(-this.rotation);
        const rotatedX = dx * cos - dy * sin;
        const rotatedY = dx * sin + dy * cos;
        return Math.abs(rotatedX) <= this.size && Math.abs(rotatedY) <= this.size;
    }
}
