class Shape {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.rotation = 0;
        this.selected = false;
        this.velocity = { x: 0, y: 0 };
        this.opacity = 1;
        this.textLabel = '';
        this.hovered = false;
    }

    draw(ctx) {
        throw new Error('draw() must be implemented');
    }

    getSides() {
        throw new Error('getSides() must be implemented');
    }

    getType() {
        throw new Error('getType() must be implemented');
    }

    isPointInside(mouseX, mouseY) {
        const distance = Math.sqrt((mouseX - this.x) ** 2 + (mouseY - this.y) ** 2);
        return distance <= this.size;
    }

    toggleSelect() {
        this.selected = !this.selected;
    }

    drawSelectionBorder(ctx) {
        ctx.save();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    drawHoverEffect(ctx) {
        ctx.save();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.globalAlpha = this.opacity * 0.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}
