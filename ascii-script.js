// Helper function to clean and prepare code inputs (Hex, Dec, Bin)
function cleanCodeInput(value) {
    // Replace newlines with spaces and trim extra whitespace
    return value.replace(/\s+/g, ' ').trim();
}

// TEXT INPUT HANDLER (Source: Text)
function convertTextToCodes(text) {
    let hexCodes = [];
    let decCodes = [];
    let binCodes = [];

    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);

        // Limit to standard 8-bit ASCII for display clarity
        if (charCode <= 255) { 
            // Hex: Pad to two digits (e.g., 10 -> 0A)
            hexCodes.push(charCode.toString(16).toUpperCase().padStart(2, '0'));
            // Decimal
            decCodes.push(charCode.toString(10));
            // Binary: Pad to eight digits
            binCodes.push(charCode.toString(2).padStart(8, '0'));
        } else {
            // Handle non-ASCII characters (e.g., emojis, foreign scripts) by marking them
            hexCodes.push('[?]');
            decCodes.push('[?]');
            binCodes.push('[?]');
        }
    }

    return {
        hex: hexCodes.join(' '),
        dec: decCodes.join(' '),
        bin: binCodes.join(' ')
    };
}

// CODE INPUT HANDLER (Source: Hex, Dec, or Bin)
function convertCodesToText(codes, fromBase) {
    // 1. Clean input: space-separate and remove leading/trailing whitespace
    const cleanedCodes = cleanCodeInput(codes);
    if (!cleanedCodes) return "";

    const codeArray = cleanedCodes.split(' ');
    let text = '';
    let isValid = true;

    for (const code of codeArray) {
        if (!code) continue; // Skip empty strings from multiple spaces

        let decValue;
        try {
            // Use parseInt(string, radix) for conversion to decimal
            decValue = parseInt(code, fromBase);
            
            // Check for NaN result (invalid character for the base)
            if (isNaN(decValue)) {
                isValid = false;
                break;
            }
            // Check for negative numbers or values outside 8-bit range
            if (decValue < 0 || decValue > 255) {
                 isValid = false;
                 break;
            }

        } catch (e) {
            isValid = false;
            break;
        }
        
        // Convert decimal value back to its character representation
        text += String.fromCharCode(decValue);
    }

    if (!isValid) {
        return 'Invalid Code Sequence';
    }

    return text;
}


// --- Main Initialization and Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const hexInput = document.getElementById('hexInput');
    const decInput = document.getElementById('decInput');
    const binInput = document.getElementById('binInput');

    const allInputs = [textInput, hexInput, decInput, binInput];
    
    // Function to disable other inputs and perform conversion
    function updateAll(sourceInput, converterFunction, base = null) {
        const value = sourceInput.value;

        // Reset all other inputs
        allInputs.forEach(input => {
            if (input !== sourceInput) {
                input.value = '';
                input.disabled = true;
            }
        });
        
        // If source is empty, re-enable everything and stop
        if (value.trim() === '') {
             allInputs.forEach(input => input.disabled = false);
             return;
        }

        let result;
        if (sourceInput === textInput) {
            // Text to codes
            result = converterFunction(value);
            hexInput.value = result.hex;
            decInput.value = result.dec;
            binInput.value = result.bin;
        } else {
            // Codes to text
            result = converterFunction(value, base);
            textInput.value = result;
        }
    }

    // --- Attach Event Listeners ---

    // 1. Text Input (Activates on keyup for instant conversion)
    textInput.addEventListener('keyup', () => {
        updateAll(textInput, convertTextToCodes);
    });

    // 2. Hex Input
    hexInput.addEventListener('keyup', () => {
        updateAll(hexInput, convertCodesToText, 16);
    });

    // 3. Decimal Input
    decInput.addEventListener('keyup', () => {
        updateAll(decInput, convertCodesToText, 10);
    });

    // 4. Binary Input
    binInput.addEventListener('keyup', () => {
        updateAll(binInput, convertCodesToText, 2);
    });
});