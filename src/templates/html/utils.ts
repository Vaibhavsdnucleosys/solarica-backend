import fs from 'fs';
import path from 'path';

/**
 * Utility to convert local images to Base64 for embedding in PDF-bound HTML
 */
export const getBase64Image = (filePath: string): string => {
    try {
        const absolutePath = path.join(process.cwd(), filePath);
        if (fs.existsSync(absolutePath)) {
            const bitmap = fs.readFileSync(absolutePath);
            const ext = path.extname(absolutePath).slice(1);
            return `data:image/${ext === 'svg' ? 'svg+xml' : ext};base64,${bitmap.toString('base64')}`;
        }
        return '';
    } catch (e) {
        console.error(`Error loading image ${filePath}:`, e);
        return '';
    }
};

