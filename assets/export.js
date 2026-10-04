document.addEventListener('DOMContentLoaded', () => {

    const preview = document.getElementById('preview');
    const exportButton = document.getElementById('export-button');
    const sizeSelect = document.getElementById('size-select');
    const bgImg = document.getElementById('preview-bg');
    const chImg = document.getElementById('preview-ch');
    const headline = document.getElementById('headline');
    const mainText = document.getElementById('main-text');

    function getSettings() {
        const styles = getComputedStyle(preview);
        return {
            headlineTop: parseFloat(styles.getPropertyValue('--headline-top')),
            headlineCenterTop: parseFloat(styles.getPropertyValue('--headline-center-top')),
            headlineSide: parseFloat(styles.getPropertyValue('--headline-side')),
            headlineSize: parseFloat(styles.getPropertyValue('--headline-size')),
            mainLeft: parseFloat(styles.getPropertyValue('--main-left')),
            mainTop: parseFloat(styles.getPropertyValue('--main-top')),
            mainWidth: parseFloat(styles.getPropertyValue('--main-width')),
            mainSize: parseFloat(styles.getPropertyValue('--main-size'))
        };
    }

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = src;
        });
    }

    function drawBackground(ctx, image, width, height) {
        const imageRatio = image.naturalWidth / image.naturalHeight;
        const canvasRatio = width / height;

        let drawWidth;
        let drawHeight;
        let offsetX;
        let offsetY;

        if (imageRatio > canvasRatio) {
            drawHeight = height;
            drawWidth = height * imageRatio;
            offsetX = (width - drawWidth) / 2;
            offsetY = 0;
        } else {
            drawWidth = width;
            drawHeight = width / imageRatio;
            offsetX = 0;
            offsetY = (height - drawHeight) / 2;
        }

        ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    }

    function drawCharacter(ctx, image, width, height) {
        const characterWidth = image.naturalWidth;
        const characterHeight = image.naturalHeight;
        const scaleByHeight = height / characterHeight;
        const scaleByWidth = width / characterWidth;
        const scale = Math.min(scaleByHeight, scaleByWidth, 1);

        const drawWidth = characterWidth * scale;
        const drawHeight = characterHeight * scale;
        const x = (width - drawWidth) / 2;
        const y = height - drawHeight;

        ctx.drawImage(image, x, y, drawWidth, drawHeight);
    }

    function wrapText(ctx, text, maxWidth) {
        const paragraphs = text.split('\n');
        const lines = [];

        for (const paragraph of paragraphs) {
            if (paragraph.length === 0) {
                lines.push('');
                continue;
            }

            let currentLine = '';

            for (const character of paragraph) {
                const testLine = currentLine + character;
                const width = ctx.measureText(testLine).width;

                if (width > maxWidth && currentLine.length > 0) {
                    lines.push(currentLine);
                    currentLine = character;
                } else {
                    currentLine = testLine;
                }
            }

            if (currentLine.length > 0) {
                lines.push(currentLine);
            }
        }

        return lines;
    }

    function drawTextWithLetterSpacing(ctx, text, x, y, letterSpacing) {
        let currentX = x;

        for (const character of text) {
            ctx.fillText(character, currentX, y);
            currentX += ctx.measureText(character).width + letterSpacing;
        }
    }

    function drawHeadline(ctx, text, settings, scale, width) {
        ctx.font = `${settings.headlineSize * scale}px Font, monospace`;
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'top';

        const letterSpacing = 2 * scale;
        let textWidth = 0;

        for (const character of text) {
            textWidth += ctx.measureText(character).width;
        }

        if (text.length > 1) {
            textWidth += letterSpacing * (text.length - 1);
        }

        const align = headline.dataset.align || 'center';

        let x;

        if (align === 'left') {
            x = settings.headlineSide * scale;
        } else if (align === 'right') {
            x = width - settings.headlineSide * scale - textWidth;
        } else {
            x = (width - textWidth) / 2;
        }

        const top = align === 'center'
            ? settings.headlineCenterTop
            : settings.headlineTop;

        const y = top * scale;

        drawTextWithLetterSpacing(ctx, text, x, y, letterSpacing);
    }

    function drawMainText(ctx, text, settings, scale) {
        const fontSize = settings.mainSize * scale;
        const maxWidth = settings.mainWidth * scale;

        ctx.font = `${fontSize}px Font, monospace`;
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'top';

        const lines = wrapText(ctx, text, maxWidth);
        const lineHeight = fontSize;
        const x = settings.mainLeft * scale;
        const y = settings.mainTop * scale;

        lines.forEach((line, index) => {
            ctx.fillText(line, x, y + index * lineHeight);
        });
    }

    async function exportPNG() {
        exportButton.disabled = true;
        exportButton.textContent = 'Exporting...';

        await document.fonts.ready;

        const [width, height] = sizeSelect.value.split('x').map(Number);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        const background = await loadImage(bgImg.src);
        const character = await loadImage(chImg.src);

        const settings = getSettings();
        const scale = width / 960;

        drawBackground(ctx, background, width, height);
        drawCharacter(ctx, character, width, height);
        drawHeadline(ctx, headline.textContent, settings, scale, width);
        drawMainText(ctx, mainText.textContent, settings, scale);

        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = `tm-msg-${width}x${height}.png`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(url);

            exportButton.disabled = false;
            exportButton.textContent = 'Download';
        }, 'image/png');
    }

    exportButton.addEventListener('click', exportPNG);
});