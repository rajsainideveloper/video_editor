# PHP Tutorial Video Generator

This project is a browser-based tool designed to automate the creation of educational programming videos. It combines HTML5 Canvas animations with AI-driven audio narration to produce high-quality tutorial content, specifically tailored for PHP topics.

## 🚀 Features

-   **Canvas-Based Animation**: Renders dynamic code examples and visual explanations on an HTML5 canvas.
-   **Automated Audio Narration**: Uses the Web Speech API to synthesize voiceovers for each scene.
-   **Real-time Recording**: Captures the canvas animation and audio into a downloadable video file (MP4).
-   **Scene Management**:
    -   Organize content into distinct scenes.
    -   Adjust individual scene durations.
    -   Bulk update duration for all scenes.
-   **Customizable Pacing**:
    -   **Speech Speed**: Fine-tune the rate of the narration.
    -   **Global Duration Multiplier**: Speed up or slow down the entire video.
-   **Quick Presets**: One-click settings for different teaching styles:
    -   🐢 **Deep Dive**: Slower, more detailed.
    -   🚀 **Turbo**: Fast-paced overview.
    -   And more (Relaxed, Normal, Fast).
-   **Preview Mode**: Watch the animation and hear the narration without recording to disk.

## 🛠️ Setup & Usage

Since this is a client-side web application, no complex backend setup is required.

1.  **Open the Application**:
    Simply open the `index.html` file in a modern web browser (Chrome, Firefox, Edge, Safari).

2.  **Start Recording**:
    -   Click the **▶ Start Recording** button.
    -   The app will play through the scenes, narrating the content and recording the screen.
    -   Once finished, the video file will automatically be generated and prompted for download.

3.  **Preview**:
    -   Click **👁 Preview Animation** to watch the sequence without saving a file.

## ⚙️ Controls

### Playback Controls
-   **Pause/Resume**: Pause the recording or preview at any time.
-   **Stop**: Abort the current session.

### Sync Settings
-   **Start Scene**: Choose which scene to begin recording from (useful for testing specific parts).
-   **Speech Speed**: Adjust how fast the AI voice speaks.
-   **Global Duration Mult**: rapid-fire adjustment to lengthen or shorten the video.

## 📂 File Structure

-   `index.html`: The main entry point and UI layout.
-   `main.js`: Core application logic, event listeners, and UI state management.
-   `video-generator.js`: Orchestrates the animation loop and scene transitions.
-   `recorder.js`: Handles the MediaStream Recording API to capture video and audio.
-   `audio-narration.js`: Manages text-to-speech synthesis.
-   `caption-renderer.js`: Draws synchronized captions on the canvas.
-   `scenes.js`: Defines the content (text, code, narration) for each scene.
-   `style.css`: Application styling.

## 🤝 Contributing

Feel free to modify `scenes.js` to create your own tutorials! The system is designed to be flexible—just update the scene data with your own script and code examples.
