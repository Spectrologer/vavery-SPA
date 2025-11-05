// Theme Module - Color scheme management and accessibility
const ThemeManager = (function() {
    let pointColor = '#FFFFFF';

    // --- Accessibility Color Contrast Functions ---
    function getLuminance(r, g, b) {
        const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    function getContrastRatio(hex1, hex2) {
        const r1 = parseInt(hex1.slice(1, 3), 16), g1 = parseInt(hex1.slice(3, 5), 16), b1 = parseInt(hex1.slice(5, 7), 16);
        const r2 = parseInt(hex2.slice(1, 3), 16), g2 = parseInt(hex2.slice(3, 5), 16), b2 = parseInt(hex2.slice(5, 7), 16);
        const lum1 = getLuminance(r1, g1, b1), lum2 = getLuminance(r2, g2, b2);
        const brightest = Math.max(lum1, lum2), darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    }

    function hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    function getRandomAccessibleColors() {
        const white = "#FFFFFF";
        const WCAG_MIN_CONTRAST = 4.5;
        let themeColor, starColor, contrastRatio;
        do {
            const hue = Math.random() * 360;
            const saturation = 70 + Math.random() * 30;
            const themeLightness = 20 + Math.random() * 30;
            themeColor = hslToHex(hue, saturation, themeLightness);
            const starLightness = 75 + Math.random() * 10;
            starColor = hslToHex(hue, saturation, starLightness);
            contrastRatio = getContrastRatio(themeColor, white);
        } while (contrastRatio < WCAG_MIN_CONTRAST);
        return { themeColor, starColor };
    }

    function randomizeTheme() {
        const colorizeButton = document.getElementById('colorize');
        colorizeButton.classList.add('spinning');
        const newColors = getRandomAccessibleColors();
        pointColor = newColors.starColor;
        document.documentElement.style.setProperty('--theme-color', newColors.themeColor);

        // Update canvas animation colors
        if (typeof CanvasAnimation !== 'undefined') {
            CanvasAnimation.setPointColor(pointColor);
        }

        setTimeout(() => colorizeButton.classList.remove('spinning'), 500);
    }

    function init() {
        const colorizeButton = document.getElementById('colorize');
        if (colorizeButton) {
            colorizeButton.addEventListener('click', randomizeTheme);
        }
    }

    return {
        init,
        randomizeTheme,
        getPointColor: () => pointColor,
        setPointColor: (color) => { pointColor = color; }
    };
})();
