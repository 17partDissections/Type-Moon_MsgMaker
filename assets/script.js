document.addEventListener('DOMContentLoaded', () => {

    const preview = document.getElementById('preview');
    const bgSelect = document.getElementById('bg-select');
    const chSelect = document.getElementById('ch-select');
    const sizeSelect = document.getElementById('size-select');
    const headlineInput = document.getElementById('headline-input');
    const mainTextInput = document.getElementById('main-text-input');
    const bgImg = document.getElementById('preview-bg');
    const chImg = document.getElementById('preview-ch');
    const headline = document.getElementById('headline');
    const mainText = document.getElementById('main-text');

    const sizes = {
        '320x240': { width: 320, height: 240 },
        '640x480': { width: 640, height: 480 },
        '960x720': { width: 960, height: 720 }
    };

    function getTextSettings() {
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

    function getScale() {
        return preview.clientWidth / 960;
    }

    function updatePreviewSize() {
        const size = sizes[sizeSelect.value];

        if (!size) return;

        preview.style.width = `${size.width}px`;
        preview.style.height = `${size.height}px`;

        updateTextLayout();
        updateCharacterSize();
        updateHeadlinePosition();
    }

    function updateTextLayout() {
        const settings = getTextSettings();
        const scale = getScale();

        const selectedCharacter = chSelect.options[chSelect.selectedIndex];
        const align = selectedCharacter.dataset.headlineAlign || 'center';


        if (align === 'center') {
            headline.style.top = `${settings.headlineCenterTop * scale}px`;
        } else {
            headline.style.top = `${settings.headlineTop * scale}px`;
        }

        headline.style.fontSize = `${settings.headlineSize * scale}px`;

        mainText.style.left = `${settings.mainLeft * scale}px`;
        mainText.style.top = `${settings.mainTop * scale}px`;
        mainText.style.width = `${settings.mainWidth * scale}px`;
        mainText.style.fontSize = `${settings.mainSize * scale}px`;
    }

    function updateCharacterSize() {
        if (!chImg.naturalWidth || !chImg.naturalHeight) return;

        const previewWidth = preview.clientWidth;
        const previewHeight = preview.clientHeight;
        const characterWidth = chImg.naturalWidth;
        const characterHeight = chImg.naturalHeight;

        const scaleByHeight = previewHeight / characterHeight;
        const scaleByWidth = previewWidth / characterWidth;
        const scale = Math.min(scaleByHeight, scaleByWidth, 1);

        chImg.style.width = `${characterWidth * scale}px`;
        chImg.style.height = `${characterHeight * scale}px`;
    }

    function updateCharacter() {
        chImg.onload = () => {
            updateCharacterSize();
        };

        chImg.src = chSelect.value;

        if (chImg.complete) {
            updateCharacterSize();
        }

        updateHeadlinePosition();
        updateTextLayout();
    }

    function updateBackground() {
        bgImg.src = bgSelect.value;
    }

    function updateHeadlinePosition() {
        const selectedCharacter = chSelect.options[chSelect.selectedIndex];
        const align = selectedCharacter.dataset.headlineAlign || 'center';
        const settings = getTextSettings();
        const scale = getScale();

        headline.dataset.align = align;

        if (align === 'left') {
            headline.style.left = `${settings.headlineSide * scale}px`;
            headline.style.right = 'auto';
            headline.style.transform = 'none';
        } else if (align === 'center') {
            headline.style.left = '50%';
            headline.style.right = 'auto';
            headline.style.transform = 'translateX(-50%)';
        } else if (align === 'right') {
            headline.style.left = 'auto';
            headline.style.right = `${settings.headlineSide * scale}px`;
            headline.style.transform = 'none';
        }

        updateTextLayout();
    }

    function updateHeadline() {
        headline.textContent = headlineInput.value;
    }

    function updateMainText() {
        mainText.textContent = mainTextInput.value;
    }

    async function loadRandomMessage() {
            const response = await fetch('assets/messages.json');

            const messages = await response.json();

            const validMessages = messages.filter(
                message => typeof message === 'string' && message.trim().length > 0
            );

            if (validMessages.length === 0) {
                throw new Error('No valid messages found');
            }

            const randomIndex = Math.floor(Math.random() * validMessages.length);
            const randomMessage = validMessages[randomIndex];

            mainTextInput.value = randomMessage;
            updateMainText();
    }

    bgSelect.addEventListener('change', updateBackground);
    chSelect.addEventListener('change', updateCharacter);
    sizeSelect.addEventListener('change', updatePreviewSize);
    headlineInput.addEventListener('input', updateHeadline);
    mainTextInput.addEventListener('input', updateMainText);

    window.addEventListener('resize', () => {
        updateCharacterSize();
        updateTextLayout();
        updateHeadlinePosition();
    });

    updatePreviewSize();
    updateBackground();
    updateCharacter();
    updateHeadline();
    updateMainText();
    loadRandomMessage();
});