// Function to ensure a number is within 8-bit range (0-255)
function clampToByte(value) {
    if (value < 0) return 0;
    if (value > 255) return 255;
    return value;
}

// Helper function to format a number as an 8-bit binary string
function to8BitBinary(num) {
    // If NOT is being used, we use the 8-bit 1's complement for correct calculation
    let binary = (num >>> 0).toString(2);
    // Pad with leading zeros to ensure 8 bits
    while (binary.length < 8) {
        binary = '0' + binary;
    }
    // Truncate to 8 bits in case input > 255 (which should be prevented by clamp)
    return binary.slice(-8);
}

// --- Core Logic Gate Functions for Bitwise Operations ---
// Inputs 'a' and 'b' are now decimal numbers
function getBitwiseOutput(gate, a, b) {
    // Ensure inputs are treated as unsigned 8-bit integers
    a = clampToByte(a);
    b = clampToByte(b);

    let result;

    if (gate === 'AND') {
        result = a & b; // Bitwise AND
    } else if (gate === 'OR') {
        result = a | b; // Bitwise OR
    } else if (gate === 'XOR') {
        result = a ^ b; // Bitwise XOR
    } else if (gate === 'NOT') {
        // Bitwise NOT (One's Complement) is handled by XORing with a mask of 255 (11111111)
        // This is a common way to simulate one's complement for unsigned numbers
        result = a ^ 255;
    } else if (gate === 'NAND') {
        // NAND is the inverse of AND
        result = (a & b) ^ 255;
    } else if (gate === 'NOR') {
        // NOR is the inverse of OR
        result = (a | b) ^ 255;
    } else if (gate === 'XNOR') {
        // XNOR is the inverse of XOR
        result = (a ^ b) ^ 255;
    } else {
        return 0; // Default
    }

    // Since we are clamping inputs, the result will always be 0-255
    return clampToByte(result);
}

function updateCalculator() {
    const gate = document.getElementById('gateSelector').value;
    const inputAElement = document.getElementById('inputA');
    const inputBElement = document.getElementById('inputB');
    const outputYDecimalElement = document.getElementById('outputYDecimal');
    const outputYBinaryElement = document.getElementById('outputYBinary');
    const inputBGroup = document.getElementById('inputBGroup');

    // 1. Get and Sanitize Decimal Inputs
    // Clamp values to the 0-255 range for 8-bit calculation
    let inputA = clampToByte(parseInt(inputAElement.value, 10) || 0);
    let inputB = clampToByte(parseInt(inputBElement.value, 10) || 0);
    
    // Set the inputs back to the clamped values to provide visual feedback
    inputAElement.value = inputA;
    inputBElement.value = inputB;
    
    // 2. Handle Unary (NOT) Gate visibility
    const isUnary = gate === 'NOT';
    inputBGroup.style.display = isUnary ? 'none' : 'block';
    
    // 3. Calculate Output
    const outputYDecimal = getBitwiseOutput(gate, inputA, isUnary ? 0 : inputB);
    const outputYBinary = to8BitBinary(outputYDecimal);

    // 4. Update Display
    outputYDecimalElement.textContent = outputYDecimal;
    outputYBinaryElement.textContent = outputYBinary;
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    const gateSelector = document.getElementById('gateSelector');
    const inputA = document.getElementById('inputA');
    const inputB = document.getElementById('inputB');
    
    // Add event listeners for changes
    gateSelector.addEventListener('change', updateCalculator);
    inputA.addEventListener('input', updateCalculator);
    inputB.addEventListener('input', updateCalculator);

    // Initial run to set the default state
    updateCalculator();
});