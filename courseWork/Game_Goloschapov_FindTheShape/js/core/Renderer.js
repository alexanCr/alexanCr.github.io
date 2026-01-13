class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawBackground() {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(5, 5, this.width - 10, this.height - 10);

        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(15, 15, this.width - 30, this.height - 30);

        this.drawCornerDecorations();
    }

    drawCornerDecorations() {
        const cornerSize = 30;
        const offset = 10;
        
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.moveTo(offset, offset + cornerSize);
        this.ctx.lineTo(offset, offset);
        this.ctx.lineTo(offset + cornerSize, offset);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(this.width - offset - cornerSize, offset);
        this.ctx.lineTo(this.width - offset, offset);
        this.ctx.lineTo(this.width - offset, offset + cornerSize);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(offset, this.height - offset - cornerSize);
        this.ctx.lineTo(offset, this.height - offset);
        this.ctx.lineTo(offset + cornerSize, this.height - offset);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(this.width - offset - cornerSize, this.height - offset);
        this.ctx.lineTo(this.width - offset, this.height - offset);
        this.ctx.lineTo(this.width - offset, this.height - offset - cornerSize);
        this.ctx.stroke();
    }

    drawDropZone(x, y, width, height, label, isActive = false) {
        this.ctx.save();
        
        this.ctx.strokeStyle = isActive ? '#32CD32' : '#FFD700';
        this.ctx.lineWidth = isActive ? 3 : 2;
        this.ctx.setLineDash(isActive ? [] : [10, 5]);
        this.ctx.strokeRect(x, y, width, height);
        
        if (label) {
            this.ctx.fillStyle = isActive ? '#32CD32' : '#FFD700';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(label, x + width / 2, y + height / 2);
        }
        
        this.ctx.restore();
    }
}
