/**
 * TextureUtils.ts
 * Utility for generating high-resolution textures for decals.
 */

interface TextOptions {
    text: string;
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    fontWeight?: string;
    fontStyle?: string;
    stroke?: { width: number; color: string } | null;
    padding?: number;
}

/**
 * Renders text to an offscreen canvas and returns the canvas element.
 * Optimized for use as a Three.js CanvasTexture.
 */
export const createTextCanvas = (options: TextOptions): HTMLCanvasElement => {
    const {
        text,
        fontFamily = 'Arial',
        fontSize = 256, // Base size for high quality
        color = '#000000',
        fontWeight = 'bold',
        fontStyle = 'normal',
        stroke = null,
        padding = 20
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not get canvas context');
    }

    // Set font to measure text
    const fontStr = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.font = fontStr;

    // Measure text
    const lines = text.split('\n');
    let maxWidth = 0;
    lines.forEach(line => {
        const metrics = ctx.measureText(line);
        maxWidth = Math.max(maxWidth, metrics.width);
    });

    const lineHeight = fontSize * 1.2;
    const height = lines.length * lineHeight;

    // Set canvas dimensions with padding
    canvas.width = maxWidth + padding * 2;
    canvas.height = height + padding * 2;

    // Reset context state since resizing clears it
    ctx.font = fontStr;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines
    lines.forEach((line, index) => {
        const y = padding + index * lineHeight;
        const x = canvas.width / 2;

        if (stroke) {
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.width;
            ctx.strokeText(line, x, y);
        }

        ctx.fillStyle = color;
        ctx.fillText(line, x, y);
    });

    return canvas;
};
