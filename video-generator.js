// Video generator core engine
class VideoGenerator {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.currentScene = 0;
        this.sceneStartTime = 0;
        this.isPlaying = false;
        this.animationFrame = null;
        this.onProgressUpdate = null;
        this.onSceneChange = null;
        this.onComplete = null;
    }

    start() {
        this.isPlaying = true;
        this.currentScene = 0;
        this.sceneStartTime = Date.now();
        this.animate();
    }

    stop() {
        this.isPlaying = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }

    animate() {
        if (!this.isPlaying) return;

        const now = Date.now();
        const elapsed = now - this.sceneStartTime;
        const scene = scenes[this.currentScene];

        if (!scene) {
            this.complete();
            return;
        }

        const progress = Math.min(elapsed / scene.duration, 1);

        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Render current scene
        scene.render(this.ctx, progress, this.width, this.height);

        // Update progress
        if (this.onProgressUpdate) {
            const totalProgress = (this.currentScene + progress) / scenes.length;
            this.onProgressUpdate(totalProgress, scene.name);
        }

        // Draw Debug Overlay
        this.ctx.save();
        this.ctx.font = 'bold 24px monospace';
        this.ctx.textBaseline = 'top';
        const timerText = `${(elapsed / 1000).toFixed(1)}s / ${(scene.duration / 1000).toFixed(1)}s`;
        const sceneText = `Scene ${this.currentScene + 1}: ${scene.name}`;

        // Background for text
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(10, 10, 400, 70);

        // Text
        this.ctx.fillStyle = '#00FF00'; // Green text
        this.ctx.fillText(sceneText, 20, 20);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText(timerText, 20, 50);
        this.ctx.restore();

        // Check if scene is complete
        if (progress >= 1) {
            // progress = 1; // Clamp to end
            // Don't auto-advance. Wait for external trigger.
            if (this.onProgressUpdate) {
                this.onProgressUpdate(1, scene.name);
            }
        }

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    triggerNextScene() {
        this.currentScene++;
        this.sceneStartTime = Date.now();

        if (this.currentScene < scenes.length) {
            if (this.onSceneChange) {
                this.onSceneChange(this.currentScene);
            }
        } else {
            this.complete();
        }
    }

    complete() {
        this.isPlaying = false;
        if (this.onComplete) {
            this.onComplete();
        }
    }

    getTotalDuration() {
        return scenes.reduce((total, scene) => total + scene.duration, 0);
    }

    getCurrentSceneIndex() {
        return this.currentScene;
    }
}
