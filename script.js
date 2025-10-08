// A single, robust function to handle all base conversions using BigInt for large numbers.
function convertBase(inputValue, fromBase, toBase) {
    // 1. Clean and normalize input
    let cleanInput = inputValue.trim();

    // 2. Handle 0x prefix for Hexadecimal input
    if (fromBase === 16) {
        // Remove '0x' or '0X' if present
        if (cleanInput.startsWith('0x') || cleanInput.startsWith('0X')) {
            cleanInput = cleanInput.substring(2);
        }
    }
    
    // 3. Handle empty input after cleaning
    if (cleanInput === '') {
        return '';
    }

    let decimalValue;
    try {
        // --- FIX IS HERE ---
        // We use parseInt with the source base to get the decimal value.
        // We must stick to parseInt/toString for reliable base conversion logic, 
        // using BigInt's String constructor only when we know the number is decimal, 
        // or a manual conversion loop for non-decimal bases, but the simpler 
        // base-aware parseInt is sufficient for all your required bases (2, 10, 16).
        
        // Since parseInt has a 53-bit limit, we must use BigInt for 64-bit support.
        // The standard way to achieve base conversion with BigInt in older JS 
        // is to manually convert or use the BigInt constructor for base 16, 
        // but modern browsers often support BigInt(string, radix) for 2, 8, 16.
        
        // A safer, cross-browser approach is to use the standard BigInt base 16 parsing:
        if (fromBase === 16) {
            // Hex parsing must use the '0x' prefix for BigInt constructor
            decimalValue = BigInt('0x' + cleanInput); 
        } else if (fromBase === 2) {
            // Binary parsing must use the '0b' prefix
            decimalValue = BigInt('0b' + cleanInput);
        } else {
            // Decimal parsing is direct
            decimalValue = BigInt(cleanInput);
        }
        
    } catch (e) {
        // This catches errors like invalid characters or input too large for JS engine
        return 'Invalid Input / Out of Range';
    }

    // --- BigInt Conversion Output ---
    
    // Step 2: Convert the BigInt (Base 10) to the target base string.
    // toString(radix) works directly on BigInt for bases 2-36.
    let result = decimalValue.toString(toBase).toUpperCase();

    // 4. Clean up any accidental leading zeros 
    if (result.length > 1 && result.startsWith('0')) {
        result = result.replace(/^0+/, '');
    }
    
    // 5. If converting Hex to Decimal, ensure the leading '0x' isn't accidentally output
    if (toBase === 10) {
        // Decimal should not have a prefix
        return result.replace(/^-?0+/, '');
    }

    return result;
}

// Function to validate input characters
function isValidInput(value, base) {
    if (value === '') return true;
    
    let regex;
    
    if (base === 16) {
        // Hex: allows 0-9, a-f, A-F. Also allows 0x/0X at the beginning.
        // The '+' means it must contain at least one hex digit after the optional prefix.
        regex = /^(0x|0X)?[0-9a-fA-F]+$/;
    } else if (base === 10) {
        // Decimal: allows digits and optional leading minus sign
        regex = /^-?\d+$/;
    } else if (base === 2) {
        // Binary: allows 0 or 1
        regex = /^[01]+$/;
    }
    return regex.test(value);
}


// Function to handle the conversion logic for a specific input field
function handleConversion(sourceId, sourceBase, targetIds, targetBases) {
    const sourceInput = document.getElementById(sourceId);
    
    sourceInput.addEventListener('input', (e) => {
        const value = e.target.value;
        
        // 1. Validate Input
        // Note: We use the `value` directly here, not `trim()`, so `isValidInput` 
        // can correctly check for prefixes like '0x'
        const isValid = isValidInput(value, sourceBase);

        // Apply error styling
        if (!isValid && value.trim() !== '') { // Only error if non-empty and invalid
            sourceInput.classList.add('error');
        } else {
            sourceInput.classList.remove('error');
        }

        // 2. Perform and display conversions
        for (let i = 0; i < targetIds.length; i++) {
            const targetId = targetIds[i];
            const targetBase = targetBases[i];
            const targetInput = document.getElementById(targetId);
            
            // Prevent self-conversion
            if (sourceId === targetId) continue; 

            if (!isValid && value.trim() !== '') {
                targetInput.value = 'Invalid Character';
            } else if (value.trim() === '') {
                targetInput.value = '';
            } else {
                const result = convertBase(value, sourceBase, targetBase);
                targetInput.value = result;
            }
        }
    });
}

// --- Initialize Listeners ---

// 1. Hex Input Logic (converts Hex to Dec and Bin)
handleConversion('hexInput', 16, ['decInput', 'binInput'], [10, 2]);

// 2. Decimal Input Logic (converts Dec to Hex and Bin)
handleConversion('decInput', 10, ['hexInput', 'binInput'], [16, 2]);

// 3. Binary Input Logic (converts Bin to Hex and Dec)
handleConversion('binInput', 2, ['hexInput', 'decInput'], [16, 10]);