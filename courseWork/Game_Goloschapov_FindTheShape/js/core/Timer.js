class Timer {
    constructor() {
        this.duration = 0;
        this.remaining = 0;
        this.remainingMs = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.intervalId = null;
        this.msIntervalId = null;
        this.callbacks = {
            onTick: null,
            onMsTick: null,
            onWarning: null,
            onExpire: null
        };
        this.warningThreshold = 10;
        this.warningTriggered = false;
    }

    start(duration) {
        this.duration = duration;
        this.remaining = duration;
        this.remainingMs = 0;
        this.isRunning = true;
        this.isPaused = false;
        this.warningTriggered = false;

        if (this.callbacks.onMsTick) {
            this.callbacks.onMsTick(this.remaining, this.remainingMs);
        }

        this.intervalId = setInterval(() => {
            if (!this.isPaused && this.isRunning) {
                this.tick();
            }
        }, 1000);

        this.msIntervalId = setInterval(() => {
            if (!this.isPaused && this.isRunning) {
                this.tickMs();
            }
        }, 10);
    }

    tickMs() {
        this.remainingMs += 10;
        
        if (this.callbacks.onMsTick) {
            this.callbacks.onMsTick(this.remaining, this.remainingMs);
        }

        if (this.remainingMs >= 1000) {
            this.remainingMs = 0;
            
            if (this.remaining === 0) {
                this.stop();
                if (this.callbacks.onExpire) {
                    this.callbacks.onExpire();
                }
            }
        }
    }

    tick() {
        this.remaining--;

        if (this.callbacks.onTick) {
            this.callbacks.onTick(this.remaining);
        }

        if (this.remaining <= this.warningThreshold && !this.warningTriggered) {
            this.warningTriggered = true;
            if (this.callbacks.onWarning) {
                this.callbacks.onWarning(this.remaining);
            }
        }
    }

    stop() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        if (this.msIntervalId) {
            clearInterval(this.msIntervalId);
            this.msIntervalId = null;
        }
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    addTime(seconds) {
        this.remaining += seconds;
        if (this.callbacks.onTick) {
            this.callbacks.onTick(this.remaining);
        }
    }
}
