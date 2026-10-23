function generateIntArray(amount: number) {
    return Array.from({ length: amount }).map(
        () => Math.floor(Math.random() * 24) - 6,
    );
}

function findSmallestPostivieInt(numbers: number[]) {
    return numbers.sort((a, b) => a - b).reduce((acc, n) => {
        if (n === acc) {
            return acc + 1;
        }
        
        
        return acc;
    }, 0)
}

export { findSmallestPostivieInt, generateIntArray };
