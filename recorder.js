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

        // 1. Initialize audio narration (this plays sound to speakers)
        this.audioNarration = new AudioNarration();
        if (window.preferredSpeechRate) {
            this.audioNarration.setSpeechRateMultiplier(window.preferredSpeechRate);
        }
        await this.audioNarration.initialize();

        try {
            // 2. Request System Audio via Screen Share
            // We explain this to the user first - usually in UI, but here we can trust the flow or add an alert
            // Ideally the UI button handler showed a modal.

            // NOTE: We only want AUDIO from this stream.
            // We use standard video: true because some browsers require it for getDisplayMedia,
            // but we will ignore the video track.
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: 'tab' },
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    sampleRate: 44100
                },
                systemAudio: 'include', // Hint to browser
                selfBrowserSurface: 'include' // Hint to browser to allow current tab
            });

            // Check if user shared audio
            const audioTracks = displayStream.getAudioTracks();
            if (audioTracks.length === 0) {
                // User didn't share audio. Stop everything and throw error.
                displayStream.getTracks().forEach(t => t.stop());
                throw new Error("No audio shared. Please check 'Share tab audio' in the browser popup.");
            }

            const systemAudioTrack = audioTracks[0];

            // 3. Get Canvas Video Stream (High Quality)
            const canvasStream = this.canvas.captureStream(30); // 30 FPS
            const videoTrack = canvasStream.getVideoTracks()[0];

            // 4. Combine: Canvas Video + System Audio
            const combinedStream = new MediaStream([
                videoTrack,
                systemAudioTrack
            ]);

            // 5. Create MediaRecorder
            const options = {
                mimeType: 'video/webm;codecs=vp9,opus',
                videoBitsPerSecond: 5000000,
                audioBitsPerSecond: 128000
            };

            try {
                this.mediaRecorder = new MediaRecorder(combinedStream, options);
            } catch (e) {
                console.warn('VP9/Opus not supported, trying default');
                this.mediaRecorder = new MediaRecorder(combinedStream);
            }

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                // Stop the tracks we created
                displayStream.getTracks().forEach(track => track.stop()); // Stop screen share
                this.saveRecording();
            };

            this.mediaRecorder.start(100);
            this.isRecording = true;

            // 6. Start Content Generation
            this.videoGenerator.start();

            // Wait a tick
            await new Promise(resolve => requestAnimationFrame(resolve));

            // Orchestrate scenes
            try {
                for (let i = 0; i < scenes.length; i++) {
                    const scene = scenes[i];
                    console.log(`Starting scene ${i + 1}: ${scene.name}`);

                    const effectiveDuration = scene.duration * this.durationMultiplier;

                    const audioPromise = this.audioNarration.speakText(scene.narration, effectiveDuration);
                    const minDurationPromise = new Promise(resolve => setTimeout(resolve, effectiveDuration));

                    await Promise.all([audioPromise, minDurationPromise]);

                    console.log(`Scene ${i + 1} complete.`);
                    this.videoGenerator.triggerNextScene();
                }
            } catch (e) {
                console.error('Error during orchestration:', e);
                this.stopRecording();
            }

        } catch (err) {
            console.error("Recording setup failed:", err);
            // Re-throw so UI can handle (e.g. "Cancelled by user")
            throw err;
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
