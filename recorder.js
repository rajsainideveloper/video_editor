// Video recorder with audio narration
class VideoRecorder {
    constructor(canvas, videoGenerator) {
        this.canvas = canvas;
        this.videoGenerator = videoGenerator;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.isRecording = false;
        this.audioNarration = null;
        this.durationMultiplier = 1.0;
        this.isPaused = false;
        this.pauseResolver = null;
    }

    setDurationMultiplier(multiplier) {
        this.durationMultiplier = multiplier;
    }

    pause() {
        this.isPaused = true;
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.pause();
        }
        if (this.audioNarration) {
            speechSynthesis.pause();
        }
    }

    resume() {
        this.isPaused = false;
        if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
            this.mediaRecorder.resume();
        }
        if (this.audioNarration) {
            speechSynthesis.resume();
        }
        // Unlock the pauser
        if (this.pauseResolver) {
            this.pauseResolver();
            this.pauseResolver = null;
        }
    }

    async startRecording(startSceneIndex = 0) {
        this.recordedChunks = [];

        // Initialize audio narration
        this.audioNarration = new AudioNarration();
        if (window.preferredSpeechRate) {
            this.audioNarration.setSpeechRateMultiplier(window.preferredSpeechRate);
        }
        await this.audioNarration.initialize();

        // Get canvas stream (with captions rendered on it)
        const canvasStream = this.canvas.captureStream(30); // 30 FPS

        // Get audio stream from narration system
        const audioStream = this.audioNarration.getAudioStream();

        // Combine video and audio streams
        const combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...audioStream.getAudioTracks()
        ]);

        // Create media recorder with both video and audio
        const options = {
            mimeType: 'video/webm;codecs=vp9,opus',
            videoBitsPerSecond: 5000000, // 5 Mbps for high quality
            audioBitsPerSecond: 128000   // 128 kbps for audio
        };

        try {
            this.mediaRecorder = new MediaRecorder(combinedStream, options);
        } catch (e) {
            console.warn('Preferred codec not supported, using default');
            // Fallback to default codec
            this.mediaRecorder = new MediaRecorder(combinedStream);
        }

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.recordedChunks.push(event.data);
            }
        };

        this.mediaRecorder.onstop = () => {
            this.saveRecording();
        };

        this.mediaRecorder.start(100); // Collect data every 100ms
        this.isRecording = true;

        // Start video generation
        this.videoGenerator.start();

        // Orchestrate scenes
        try {
            for (let i = 0; i < scenes.length; i++) {
                const scene = scenes[i];
                console.log(`Starting scene ${i + 1}: ${scene.name}`);

                // Create promises for both audio and minimum duration
                // Apply dynamic duration multiplier
                const effectiveDuration = scene.duration * this.durationMultiplier;

                const audioPromise = this.audioNarration.speakText(scene.narration, effectiveDuration);
                const minDurationPromise = new Promise(resolve => setTimeout(resolve, effectiveDuration));

                // Wait for BOTH to complete. 
                // This ensures we never advance before the text is spoken, 
                // AND we never advance before the animation completes its minimum cycle.
                await Promise.all([audioPromise, minDurationPromise]);

                // Once both are done, trigger next scene
                console.log(`Scene ${i + 1} complete. Advancing...`);
                this.videoGenerator.triggerNextScene();
            }
        } catch (e) {
            console.error('Error during recording orchestration:', e);
            this.stopRecording();
        }
    }

    stopRecording() {
        // Stop actual recording if active
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
        }

        // Stop generation and audio (applies to Preview too)
        if (this.videoGenerator) {
            this.videoGenerator.stop();
        }
        if (this.audioNarration) {
            this.audioNarration.stop();
        }
    }

    saveRecording() {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);

        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `php-tutorial-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100);

        console.log('Video saved successfully!');
    }
}
