function generateIntArray(amount: number) {
    return Array.from({ length: amount }).map(
        () => Math.floor(Math.random() * 1024) - 512,
    );
}

function findSmallestPostivieInt(numbers: number[]) {
    const maxFound = numbers.reduce((acc, n) => {
        return n <= acc ? acc : n;
    });

    return Math.max(0, maxFound + 1);
}

export { findSmallestPostivieInt, generateIntArray };
