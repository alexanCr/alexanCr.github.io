class Animations {
    constructor() {
        this.activeAnimations = [];
    }

    shake(shape, duration = 300) {
        const animation = {
            type: 'shake',
            shape: shape,
            startTime: Date.now(),
            duration: duration,
            originalX: shape.x,
            amplitude: 10
        };
        this.activeAnimations.push(animation);
    }

    pulse(shape, duration = 500) {
        const animation = {
            type: 'pulse',
            shape: shape,
            startTime: Date.now(),
            duration: duration,
            originalSize: shape.size,
            maxScale: 1.3
        };
        this.activeAnimations.push(animation);
    }

    flicker(shape) {
        const animation = {
            type: 'flicker',
            shape: shape,
            startTime: Date.now(),
            duration: Infinity
        };
        this.activeAnimations.push(animation);
    }

    update() {
        const now = Date.now();
        this.activeAnimations = this.activeAnimations.filter(anim => {
            const elapsed = now - anim.startTime;
            const progress = Math.min(elapsed / anim.duration, 1);
            
            switch(anim.type) {
                case 'shake':
                    this.updateShake(anim, progress);
                    break;
                case 'pulse':
                    this.updatePulse(anim, progress);
                    break;
                case 'flicker':
                    this.updateFlicker(anim, elapsed);
                    break;
            }
            
            return progress < 1 || anim.duration === Infinity;
        });
    }

    updateShake(anim, progress) {
        if (progress >= 1) {
            anim.shape.x = anim.originalX;
            return;
        }
        const frequency = 10;
        const decay = 1 - progress;
        const offset = Math.sin(progress * Math.PI * frequency) * anim.amplitude * decay;
        anim.shape.x = anim.originalX + offset;
    }

    updatePulse(anim, progress) {
        if (progress >= 1) {
            anim.shape.size = anim.originalSize;
            return;
        }
        const easeProgress = this.easeInOutSine(progress);
        const scale = 1 + (anim.maxScale - 1) * Math.sin(easeProgress * Math.PI);
        anim.shape.size = anim.originalSize * scale;
    }

    updateFlicker(anim, elapsed) {
        const cycle = 2000;
        const phase = (elapsed % cycle) / cycle;
        anim.shape.opacity = 0.3 + 0.7 * Math.sin(phase * Math.PI * 2) * 0.5 + 0.35;
    }

    easeInOutSine(x) {
        return -(Math.cos(Math.PI * x) - 1) / 2;
    }
}
