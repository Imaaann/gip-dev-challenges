function generateBitString(size: number) {
    return Array.from({ length: size }).map(() => Math.random() < 0.5 ? "0" : "1").join('');
}

function generateBitStingArray(amount: number) {
    return Array.from({ length: amount }).map(() => generateBitString(amount));
}

// Solution
// Make a string thats different than the 1st at the 1st index.
// Different than the 2nd at the 2nd index.
// so on
function findDifferentBitString(bitStrings: string[]) {
    let solution = '';
    bitStrings.forEach((bitString, index) => { 
        const symbol = bitString[index];
        const opposite = symbol === "0" ? "1" : "0";
        solution = solution.concat(opposite);
    })
    return solution;
}

function checkSolution(bitStrings: string[], different: string) { 
    return bitStrings.filter(bitString => bitString === different).length === 0;
}

export { 
    generateBitStingArray,
    findDifferentBitString,
    checkSolution
}