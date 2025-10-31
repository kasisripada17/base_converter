// --- Core Conversion Functions ---

// Function to convert a value from any base (2, 10, 16) to decimal.
function toDec(value, base) {
    // Treat empty string as 0 for conversion, but return empty string for display.
    if (value.trim() === '') return ''; 

    // Remove any leading/trailing whitespace
    const cleanValue = value.trim();

    const dec = parseInt(cleanValue, base);
    // Check if the resulting decimal value is valid for an octet (0-255)
    if (isNaN(dec) || dec < 0 || dec > 255) return 'INVALID';
    
    return dec;
}

// Function to convert decimal to binary (8 bits)
function decToBin(dec) {
    return dec.toString(2).padStart(8, '0');
}

// Function to convert decimal to hex (2 digits)
function decToHex(dec) {
    return dec.toString(16).toUpperCase().padStart(2, '0');
}

// Global array to store references to ALL 12 input fields
const ipInputs = []; 

function convertIp(sourceInput) {
    // 1. Determine the base and octet index of the input that changed
    const parentDiv = sourceInput.closest('.ip-input-group');
    if (!parentDiv) return;

    const sourceBase = parseInt(parentDiv.getAttribute('data-base'), 10);
    const octetIndex = parseInt(sourceInput.getAttribute('data-octet'), 10) - 1; // 0-3 index

    // 2. Clear error state on the source input
    sourceInput.classList.remove('error');

    // 3. Get the decimal value from the source input
    let decimalValue = toDec(sourceInput.value, sourceBase);

    // 4. Handle Error/Empty State
    if (decimalValue === 'INVALID') {
        sourceInput.classList.add('error');
        // If the source is invalid, set all *other* fields for that octet to an error message
        for (const input of ipInputs) {
            const currentOctetIndex = parseInt(input.getAttribute('data-octet'), 10) - 1;
            
            if (currentOctetIndex === octetIndex && input !== sourceInput) {
                 input.value = 'Invalid Octet';
            }
        }
        return; // Stop processing this octet
    }
    
    // 5. Perform the conversions and update ALL fields for this octet
    
    const binValue = decimalValue === '' ? '' : decToBin(decimalValue);
    const hexValue = decimalValue === '' ? '' : decToHex(decimalValue);
    const decValue = decimalValue === '' ? '' : decimalValue.toString();

    for (const input of ipInputs) {
        const currentOctetIndex = parseInt(input.getAttribute('data-octet'), 10) - 1;
        const currentBase = parseInt(input.closest('.ip-input-group').getAttribute('data-base'), 10);

        if (currentOctetIndex === octetIndex) {
            // Only update fields that are NOT the source input
            if (input === sourceInput) {
                // Keep the input as is, but remove error class
                input.classList.remove('error');
                continue;
            }

            // Update based on the target base
            if (currentBase === 10) {
                input.value = decValue;
            } else if (currentBase === 2) {
                input.value = binValue;
            } else if (currentBase === 16) {
                input.value = hexValue;
            }
            input.classList.remove('error');
        }
    }
}


// --- Filtering, Overwrite, and Auto-Advancement Functions ---

function getValidPattern(base) {
    switch (base) {
        case 10: return /[0-9]/; // Matches a single decimal digit
        case 2: return /[01]/; // Matches 0 or 1
        case 16: return /[0-9A-Fa-f]/; // Matches a single hex digit (case insensitive)
        default: return /./; 
    }
}

function getMaxLength(base) {
    if (base === 10) return 3;
    if (base === 2) return 8;
    if (base === 16) return 2;
    return 0;
}

function focusNextInput(input, base) {
    const currentOctetIndex = parseInt(input.getAttribute('data-octet'), 10);
    if (currentOctetIndex < 4) {
        const nextInput = ipInputs.find(
            i => parseInt(i.getAttribute('data-octet'), 10) === currentOctetIndex + 1 && 
                 parseInt(i.closest('.ip-input-group').getAttribute('data-base'), 10) === base
        );
        if (nextInput) {
            nextInput.focus();
        }
    }
}

function handleKeydown(e) {
    const input = e.target;
    const base = parseInt(input.closest('.ip-input-group').getAttribute('data-base'), 10);
    const maxLength = getMaxLength(base);
    
    const key = e.key;
    const isControlKey = e.ctrlKey || e.metaKey || e.altKey;
    
    // Check if the key is a character being typed (length 1)
    const isCharacter = key.length === 1 && !isControlKey;

    // 1. Check for Dot '.'
    if (key === '.') {
        e.preventDefault(); // Stop the dot from being entered (Requirement 2)
        focusNextInput(input, base);
        return;
    }
    
    // 2. Check for Max Length Overwrite/Advance (Requirement 3)
    if (input.value.length >= maxLength && isCharacter) {
        
        // Check if the key being typed is valid for the current base
        const validPattern = getValidPattern(base);
        if (validPattern.test(key)) {
            e.preventDefault(); // Prevent the character from being added to the current full field
            
            // Overwrite the current cell with the new character
            // Hex characters must be uppercase for consistency
            input.value = (base === 16) ? key.toUpperCase() : key; 
            
            // Advance to the next cell
            focusNextInput(input, base);
            
            // Allow the 'input' event to fire next to trigger conversion
            return;
        }
    }

    // 3. Prevent Invalid Characters (Requirement 1)
    if (isCharacter) {
        const validPattern = getValidPattern(base);
        if (!validPattern.test(key)) {
            e.preventDefault(); // Block invalid character before it's entered
            return;
        }
    }
    
    // Pass control to the 'input' event for conversion
}

function handleInput(e) {
    const input = e.target;
    
    // Standard cleanup for hex characters (e.g., if pasted lowercase)
    const base = parseInt(input.closest('.ip-input-group').getAttribute('data-base'), 10);
    if (base === 16) {
        input.value = input.value.toUpperCase();
    }
    
    convertIp(input);
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Find ALL input fields in the ip-input-group divs
    document.querySelectorAll('.ip-input-group input[type="text"]').forEach(input => {
        ipInputs.push(input);
        
        // Attach the main event listener for conversion
        input.addEventListener('input', handleInput);
        
        // Attach the keydown listener for filtering and movement
        input.addEventListener('keydown', handleKeydown);
    });

    // Initial Load: Set a default IP and trigger conversion for a clean start
    document.getElementById('decInput1').value = '192';
    document.getElementById('decInput2').value = '168';
    document.getElementById('decInput3').value = '1';
    document.getElementById('decInput4').value = '1';

    // Trigger conversion logic on the first decimal input
    convertIp(document.getElementById('decInput1'));
});