// Main application logic
let videoGenerator;
let recorder;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('videoCanvas');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const previewBtn = document.getElementById('previewBtn');
    const progressFill = document.getElementById('progressFill');
    const statusText = document.getElementById('statusText');

    // Initialize video generator
    videoGenerator = new VideoGenerator(canvas);
    recorder = new VideoRecorder(canvas, videoGenerator);

    // Sync Settings Controls
    const speechRateInput = document.getElementById('speechRate');
    const speechRateVal = document.getElementById('speechRateVal');
    const durationMultInput = document.getElementById('durationMult');
    const durationMultVal = document.getElementById('durationMultVal');

    // New Controls
    const sceneSelect = document.getElementById('sceneSelect');
    const pauseBtn = document.getElementById('pauseBtn');
    const resumeBtn = document.getElementById('resumeBtn');
    const presetBtns = document.querySelectorAll('.btn-preset');

    // Populate Scene Select
    scenes.forEach((scene, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${index + 1}. ${scene.name}`;
        sceneSelect.appendChild(option);
    });

    // Scene Manager Logic
    const sceneManager = document.getElementById('sceneManager');
    const bulkDurationInput = document.getElementById('bulkDurationInput');
    const btnSetAllDuration = document.getElementById('btnSetAllDuration');

    function renderSceneManager() {
        sceneManager.innerHTML = '';
        scenes.forEach((scene, index) => {
            const row = document.createElement('div');
            row.className = 'scene-row';

            const nameSpan = document.createElement('div');
            nameSpan.className = 'scene-name';
            nameSpan.textContent = `${index + 1}. ${scene.name}`;

            const durInput = document.createElement('input');
            durInput.type = 'number';
            durInput.className = 'scene-duration-input';
            durInput.step = '0.5';
            durInput.min = '1.0';
            durInput.value = (scene.duration / 1000).toFixed(1);

            durInput.addEventListener('change', (e) => {
                const newSec = parseFloat(e.target.value);
                if (newSec && newSec >= 0.5) {
                    scene.duration = newSec * 1000;
                    console.log(`Updated Scene ${index + 1} to ${scene.duration}ms`);
                }
            });

            row.appendChild(nameSpan);
            row.appendChild(durInput);
            sceneManager.appendChild(row);
        });
    }

    // Bulk Set All Logic
    if (btnSetAllDuration) {
        btnSetAllDuration.addEventListener('click', () => {
            const val = parseFloat(bulkDurationInput.value);
            if (val && val >= 0.5) {
                scenes.forEach(scene => {
                    scene.duration = val * 1000;
                });
                renderSceneManager(); // Refresh inputs
                console.log(`Updated all scenes to ${val}s`);
            } else {
                alert('Please enter a valid duration (e.g. 5.0)');
            }
        });
    }

    // Initialize Manager
    renderSceneManager();

    // Handle Presets
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const speech = btn.dataset.speech;
            const duration = btn.dataset.duration;

            speechRateInput.value = speech;
            durationMultInput.value = duration;

            // Trigger events manually
            speechRateInput.dispatchEvent(new Event('input'));
            durationMultInput.dispatchEvent(new Event('input'));
        });
    });

    speechRateInput.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        speechRateVal.textContent = val + 'x';
        if (recorder && recorder.audioNarration) {
            recorder.audioNarration.setSpeechRateMultiplier(val);
        }
        window.preferredSpeechRate = val;
    });

    durationMultInput.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        durationMultVal.textContent = val + 'x';
        if (recorder) {
            recorder.setDurationMultiplier(val);
        }
    });

    // Pause/Resume Logic
    pauseBtn.addEventListener('click', () => {
        recorder.pause();
        pauseBtn.style.display = 'none';
        resumeBtn.style.display = 'inline-block';
        statusText.textContent = 'Paused ⏸';
    });

    resumeBtn.addEventListener('click', () => {
        recorder.resume();
        resumeBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        statusText.textContent = 'Playing ▶';
    });

    function showPlaybackControls() {
        pauseBtn.style.display = 'inline-block';
        resumeBtn.style.display = 'none';
        // Disable start scene selection while playing
        sceneSelect.disabled = true;
    }

    function hidePlaybackControls() {
        pauseBtn.style.display = 'none';
        resumeBtn.style.display = 'none';
        sceneSelect.disabled = false;
    }

    // Initialize defaults
    window.preferredSpeechRate = 1.0;

    // Progress update handler
    videoGenerator.onProgressUpdate = (progress, sceneName) => {
        const percentage = Math.round(progress * 100);
        progressFill.style.width = percentage + '%';
        progressFill.textContent = percentage + '%';
        if (!recorder.isPaused) {
            statusText.textContent = `Recording: ${sceneName} (${percentage}%)`;
        }
    };

    // Scene change handler
    videoGenerator.onSceneChange = (sceneIndex) => {
        console.log(`Scene ${sceneIndex + 1}/${scenes.length} started`);
    };

    // Completion handler
    videoGenerator.onComplete = () => {
        recorder.stopRecording();
        statusText.textContent = 'Recording complete! Video downloaded.';
        progressFill.style.width = '100%';
        progressFill.textContent = '100%';
        startBtn.disabled = false;
        stopBtn.disabled = true;
        hidePlaybackControls();

        setTimeout(() => {
            progressFill.style.width = '0%';
            progressFill.textContent = '';
            statusText.textContent = 'Ready to record';
        }, 3000);
    };

    // Start recording button
    startBtn.addEventListener('click', async () => {
        // User Instructions for Audio Capture
        const confirmed = confirm(
            "To record the AI narration:\n\n" +
            "1. In the popup, select the 'This Tab' (or current tab) option.\n" +
            "2. IMPORTANT: Check the 'Also share tab audio' box.\n\n" +
            "Click OK to proceed."
        );

        if (!confirmed) return;

        startBtn.disabled = true;
        stopBtn.disabled = false;
        showPlaybackControls();
        statusText.textContent = 'Select "This Tab" & "Share Audio" in popup...';

        const startIndex = parseInt(sceneSelect.value);

        try {
            await recorder.startRecording(startIndex);
            statusText.textContent = 'Recording in progress...';
        } catch (error) {
            console.error('Recording error:', error);
            statusText.textContent = 'Error: ' + error.message;
            startBtn.disabled = false;
            stopBtn.disabled = true;
            hidePlaybackControls();

            // Helpful hint if they forgot audio
            if (error.message.includes("No audio")) {
                alert("Recording Failed: Audio not found.\n\nPlease make sure to check 'Also share tab audio' in the browser popup window.");
            }
        }
    });

    // Stop recording button
    stopBtn.addEventListener('click', () => {
        recorder.stopRecording();
        videoGenerator.stop();
        startBtn.disabled = false;
        stopBtn.disabled = true;
        hidePlaybackControls();
        statusText.textContent = 'Stopped.';
    });

    // Preview button
    previewBtn.addEventListener('click', async () => {
        if (videoGenerator.isPlaying || (recorder && recorder.isPaused)) {
            recorder.stopRecording(); // Stops preview too
            previewBtn.textContent = '👁 Preview Animation';
            statusText.textContent = 'Preview stopped';
            startBtn.disabled = false;
            hidePlaybackControls();
        } else {
            // Apply current settings
            if (window.preferredSpeechRate) {
                recorder.setDurationMultiplier(parseFloat(durationMultInput.value));
            }

            previewBtn.textContent = '⏹ Stop Preview';
            startBtn.disabled = true;
            showPlaybackControls();

            const startIndex = parseInt(sceneSelect.value);

            try {
                // Use preview method which handles audio but no file saving
                await recorder.preview(startIndex);
                statusText.textContent = 'Previewing...';
            } catch (error) {
                console.error('Preview error:', error);
                statusText.textContent = 'Error: ' + error.message;
                previewBtn.textContent = '👁 Preview Animation';
                startBtn.disabled = false;
                hidePlaybackControls();
            }
        }
    });

    // --- Scene Editor Logic ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const codeEditor = document.getElementById('codeEditor');
    const btnApplyCode = document.getElementById('btnApplyCode');
    const codeStatus = document.getElementById('codeStatus');

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active to clicked
            btn.classList.add('active');
            const tabId = btn.dataset.tab;
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });

    // Load Initial Code
    fetch('scenes.js')
        .then(response => response.text())
        .then(text => {
            codeEditor.value = text;
        })
        .catch(err => {
            codeEditor.value = "// Error loading scenes.js";
            console.error(err);
        });

    // Apply Code Function
    btnApplyCode.addEventListener('click', () => {
        const code = codeEditor.value;
        statusText.textContent = "Updating scenes...";
        codeStatus.textContent = "Processing...";
        codeStatus.style.color = "yellow";

        try {
            // We need to evaluate the code to get the 'scenes' array.
            // CAUTION: 'eval' or 'new Function' is unsafe with untrusted input, 
            // but this is a local tool for the user's own use.

            // Strategy: Wrap in a function that returns 'scenes'.
            // If the code defines 'const scenes = [...]', we might fail if we just eval it 
            // because 'const' creates a block-scoped variable.
            // However, we want to replace the GLOBAL 'scenes' variable.

            // Hacky but effective for this context:
            // 1. Strip 'const scenes =' or 'let scenes =' or 'var scenes =' to get just the array literal? 
            //    -> Risky regex.
            // 2. Just Eval it in global scope? 
            //    -> 'const' re-declaration will throw if we do it in global scope again.

            // Cleaner approach: Use a temporary function scope to extract the value.
            // We assume the user provides valid JS that eventually defines 'scenes'.

            // Let's rely on the user pasting the whole file content.
            // The file usually looks like: "const scenes = [...];"
            // We can change "const scenes =" to "return" inside a function constructor?

            let cleanCode = code;
            // Simple replace to make it returnable if it follows the standard pattern
            if (cleanCode.includes('const scenes =')) {
                cleanCode = cleanCode.replace('const scenes =', 'return ');
            } else if (cleanCode.includes('var scenes =')) {
                cleanCode = cleanCode.replace('var scenes =', 'return ');
            } else if (cleanCode.trim().startsWith('[')) {
                cleanCode = 'return ' + cleanCode;
            }

            // Create a function from the code
            const func = new Function(cleanCode);
            const newScenes = func();

            if (Array.isArray(newScenes)) {
                // Success! Update global
                // We assume 'scenes' is globally available (from scenes.js load).
                // If it was 'const' in global scope, we can't overwrite it easily directly 
                // if we try `scenes = ...`. But `window.scenes` might work if it was var.
                // Actually, since it was loaded via <script>, if it's `const` at top level, 
                // we can't reassign it.

                // WORKAROUND: We will modify the contents of the existing array 
                // instead of replacing the reference, to avoid const errors.
                scenes.length = 0; // Clear
                newScenes.forEach(s => scenes.push(s)); // Push new items

                console.log("Scenes updated:", scenes);

                // Refresh UI
                populateSceneSelect();
                renderSceneManager();

                // Reset generator
                if (videoGenerator) {
                    videoGenerator.stop();
                    videoGenerator.currentScene = 0;
                }

                codeStatus.textContent = "✅ Scenes updated successfully!";
                codeStatus.style.color = "#4ade80"; // Green
                statusText.textContent = "Scenes updated. Ready.";
            } else {
                throw new Error("Code did not return an Array of scenes.");
            }

        } catch (e) {
            console.error(e);
            codeStatus.textContent = "❌ Error: " + e.message;
            codeStatus.style.color = "#ef4444";
            statusText.textContent = "Error updating scenes.";
        }
    });

    // Helper to refresh the dropdown
    function populateSceneSelect() {
        sceneSelect.innerHTML = '';
        scenes.forEach((scene, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${index + 1}. ${scene.name}`;
            sceneSelect.appendChild(option);
        });
    }

});
