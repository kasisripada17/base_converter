
// --- Core Conversion Functions ---

/**
 * Converts HSL values to RGB values.
 * H, S, L are assumed to be percentages or degrees (0-360 for H) and fractions (0-1 for S and L)
 * This function handles the core conversion logic.
 */
function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Converts RGB values (0-255) to HSL values.
 */
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    // Return HSL values scaled to common ranges (0-360, 0-100, 0-100)
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/**
 * Converts an RGB array [R, G, B] to a Hex string.
 */
function rgbToHex(r, g, b) {
    // Helper to convert a single decimal value to a 2-digit hex string
    const toHex = (c) => Math.min(255, Math.max(0, c)).toString(16).toUpperCase().padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}


// --- Parsing and Input Handling ---

const colorPreview = document.getElementById('colorPreview');
const hexInput = document.getElementById('hexInput');
const rgbInput = document.getElementById('rgbInput');
const hslInput = document.getElementById('hslInput');

const allInputs = [hexInput, rgbInput, hslInput];

// Function to update the preview and all fields
function updateColor(hex, rgbStr, hslStr) {
    // 1. Update Preview
    colorPreview.style.backgroundColor = hex;

    // 2. Update all inputs without triggering their own event listeners
    hexInput.value = hex;
    rgbInput.value = rgbStr;
    hslInput.value = hslStr;

    // 3. Clear error styles
    allInputs.forEach(input => input.classList.remove('error'));
}

// --- Source: Hex Input ---
hexInput.addEventListener('input', () => {
    let hex = hexInput.value.trim().toUpperCase();
    hex = hex.startsWith('#') ? hex : '#' + hex;

    // Validation: 7 characters (including #) and valid hex digits
    if (!/^#[0-9A-F]{6}$/i.test(hex)) {
        hexInput.classList.add('error');
        colorPreview.style.backgroundColor = '#f4f4f4'; // Light gray on error
        rgbInput.value = 'Invalid Hex';
        hslInput.value = 'Invalid Hex';
        return;
    }

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const [h, s, l] = rgbToHsl(r, g, b);

    updateColor(
        hex,
        `rgb(${r}, ${g}, ${b})`,
        `hsl(${h}, ${s}%, ${l}%)`
    );
});


// --- Source: RGB Input ---
rgbInput.addEventListener('input', () => {
    const value = rgbInput.value.trim();
    // Regex to match "rgb(R, G, B)" or "R, G, B" or "R G B" format, allowing for whitespace
    const match = value.match(/(\d{1,3})[,\s]*(\d{1,3})[,\s]*(\d{1,3})/);

    if (!match) {
        rgbInput.classList.add('error');
        colorPreview.style.backgroundColor = '#f4f4f4';
        hexInput.value = 'Invalid RGB';
        hslInput.value = 'Invalid RGB';
        return;
    }

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    // Range validation (0-255)
    if (r > 255 || g > 255 || b > 255 || r < 0 || g < 0 || b < 0) {
        rgbInput.classList.add('error');
        colorPreview.style.backgroundColor = '#f4f4f4';
        hexInput.value = 'Out of Range (0-255)';
        hslInput.value = 'Out of Range (0-255)';
        return;
    }

    const hex = rgbToHex(r, g, b);
    const [h, s, l] = rgbToHsl(r, g, b);

    updateColor(
        hex,
        `rgb(${r}, ${g}, ${b})`,
        `hsl(${h}, ${s}%, ${l}%)`
    );
});


// --- Source: HSL Input ---
hslInput.addEventListener('input', () => {
    const value = hslInput.value.trim();
    // Regex to match "hsl(H, S%, L%)" or "H S L" format, allowing for optional % and whitespace
    const match = value.match(/(\d{1,3})[%\s,]*(\d{1,3})[%\s,]*(\d{1,3})/);

    if (!match) {
        hslInput.classList.add('error');
        colorPreview.style.backgroundColor = '#f4f4f4';
        hexInput.value = 'Invalid HSL';
        rgbInput.value = 'Invalid HSL';
        return;
    }

    // H (0-360), S (0-100), L (0-100)
    const h = parseInt(match[1]);
    const s = parseInt(match[2]);
    const l = parseInt(match[3]);

    if (h > 360 || s > 100 || l > 100 || h < 0 || s < 0 || l < 0) {
        hslInput.classList.add('error');
        colorPreview.style.backgroundColor = '#f4f4f4';
        hexInput.value = 'Out of Range';
        rgbInput.value = 'Out of Range';
        return;
    }
    
    // Convert HSL (scaled 0-360/0-100) to RGB (fractional 0-1) for hslToRgb function
    const [r, g, b] = hslToRgb(h / 360, s / 100, l / 100);

    const hex = rgbToHex(r, g, b);

    updateColor(
        hex,
        `rgb(${r}, ${g}, ${b})`,
        `hsl(${h}, ${s}%, ${l}%)`
    );
});


// --- Initial Load: Set a default color ---
document.addEventListener('DOMContentLoaded', () => {
    // Default to a professional blue color
    hexInput.value = '#007BFF';
    hexInput.dispatchEvent(new Event('input')); // Trigger conversion logic
});