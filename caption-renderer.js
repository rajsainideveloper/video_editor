// Caption renderer utility
class CaptionRenderer {
    static renderCaption(ctx, text, width, height, progress) {
        // Caption area at bottom of screen
        const captionHeight = 200;
        const captionY = height - captionHeight - 40;
        const padding = 60;
        const maxWidth = width - (padding * 2);

        // Semi-transparent background for captions
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(padding - 20, captionY - 20, width - (padding * 2) + 40, captionHeight);

        // Caption text
        ctx.fillStyle = 'white';
        ctx.font = '42px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        // Word wrap the caption text
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });
        if (currentLine) {
            lines.push(currentLine);
        }

        // Render each line with fade-in effect
        const fadeProgress = Math.min(progress * 3, 1); // Fade in during first 1/3 of scene
        ctx.globalAlpha = fadeProgress;

        lines.forEach((line, index) => {
            ctx.fillText(line, padding, captionY + (index * 50));
        });

        ctx.globalAlpha = 1;
    }

    static renderCenteredCaption(ctx, text, width, height, progress) {
        // For intro/outro scenes - centered caption
        const padding = 100;
        const maxWidth = width - (padding * 2);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Word wrap
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });
        if (currentLine) {
            lines.push(currentLine);
        }

        // Render centered
        const fadeProgress = Math.min(progress * 2, 1);
        ctx.globalAlpha = fadeProgress;

        const startY = height - 250 - ((lines.length - 1) * 30);
        lines.forEach((line, index) => {
            ctx.fillText(line, width / 2, startY + (index * 60));
        });

        ctx.globalAlpha = 1;
    }
}
