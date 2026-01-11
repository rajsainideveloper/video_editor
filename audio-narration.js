// Audio narration system using Web Audio API
class AudioNarration {
    constructor() {
        this.audioContext = null;
        this.mediaStreamDestination = null;
        this.currentUtterance = null;
        this.isPlaying = false;
        this.rateMultiplier = 1.0;
    }

    setSpeechRateMultiplier(multiplier) {
        this.rateMultiplier = multiplier;
    }

    async initialize() {
        // Create audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.mediaStreamDestination = this.audioContext.createMediaStreamDestination();

        // Wait for voices to be loaded
        return new Promise((resolve) => {
            if (speechSynthesis.getVoices().length > 0) {
                resolve();
            } else {
                speechSynthesis.addEventListener('voiceschanged', () => {
                    resolve();
                }, { once: true });
            }
        });
    }

    getAudioStream() {
        return this.mediaStreamDestination.stream;
    }

    async speakText(text, duration) {
        return new Promise((resolve, reject) => {
            // Cancel any ongoing speech
            speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            this.currentUtterance = utterance;

            // Calculate speech rate based on text length and duration
            const wordCount = text.split(/\s+/).length;
            const durationSeconds = duration / 1000;
            const wordsPerSecond = wordCount / durationSeconds;
            // slower max rate and more generous divisor for clearer speech
            // Apply user multiplier (default 1.0)
            const baseRate = Math.max(0.7, Math.min(0.95, wordsPerSecond / 3.0));
            const finalRate = Math.max(0.1, Math.min(2.0, baseRate * this.rateMultiplier));

            utterance.rate = finalRate;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // Select best available voice
            const voices = speechSynthesis.getVoices();
            const preferredVoice = voices.find(v =>
                v.lang.startsWith('en') &&
                (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))
            ) || voices.find(v => v.lang.startsWith('en-US'))
                || voices.find(v => v.lang.startsWith('en'));

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            utterance.onend = () => {
                console.log('Speech completed:', text.substring(0, 50) + '...');
                resolve();
            };

            utterance.onerror = (event) => {
                console.error('Speech error:', event);
                reject(event);
            };

            // Speak the text
            speechSynthesis.speak(utterance);
            this.isPlaying = true;

            // Fallback timeout to ensure we don't hang
            setTimeout(() => {
                if (this.isPlaying) {
                    console.log('Speech timeout, forcing completion');
                    resolve();
                }
            }, duration + 1000);
        });
    }

    // playNarrationSequence moved to Recorder orchestration
    stop() {
        speechSynthesis.cancel();
        this.isPlaying = false;
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
    }
}
