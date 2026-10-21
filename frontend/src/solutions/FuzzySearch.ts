function normalize(data: string) {
    data = data.toLowerCase();
    data = data.normalize("NFD");
    data = data
        .replace(/\p{M}/gu, "")
        .replace(/-/gu, " ")
        .replace(/\p{P}/gu, "")
        .replace(/\s+/gu, " ")
        .trim();
    return data;
}

function maxErrors(queryLength: number) {
    return Math.floor(queryLength / 4);
}

function fuzzy(elements: string[], query: string) {
    query = normalize(query);

    if (query.length === 0) {
        return [];
    }

    const allowedErrors = maxErrors(query.length);
    const results: {
        element: string;
        match: Match;
    }[] = [];

    for (const element of elements) {
        const name = normalize(element);
        const candidate = tryMatch(name, query, allowedErrors);

        if (candidate !== null) {
            results.push({
                element,
                match: candidate,
            });
        }
    }

    results.sort((a, b) => {
        if (a.match.errors !== b.match.errors) return a.match.errors - b.match.errors
        if (a.match.tier !== b.match.tier) return a.match.tier - b.match.tier
        return normalize(a.element).length - normalize(b.element).length
    });

    return results;
}

function tryMatch(element: string, query: string, errors: number) {
    let best: Match | null = null;

    for (let col = 0; col < element.length - 1; col++) {
        // Try multiple length ranging from -errors to +errors (clamped to element length ofc)
        for (
            let len = Math.max(1, query.length - errors);
            len <= Math.min(query.length + errors, element.length - col);
            len++
        ) {
            const piece = element.substring(col, col + len);
            const distance = lavensteinDistance(piece, query);
            

            if (distance > errors) {
                continue;
            }

            const tier = locationTier(element, col, len);
            const match: Match = {
                errors: distance,
                tier,
            };

            if (isBetter(match, best)) {
                best = match;
            }
            
        }
    }


    return best;
}

export type Match = {
    errors: number;
    tier: 0 | 1 | 2 | 3;
};

function isBetter(match1: Match, match2: Match | null) {
    if (match2 === null) return true;
    if (match1.errors !== match2.errors) return match1.errors < match2.errors;
    return match1.tier < match2.tier;
}

function locationTier(element: string, column: number, length: number) {
    if (column == 0 && length == element.length) return 0; // Exact word match
    if (column == 0) return 1; // At start of element
    if (element[column - 1] === " ") return 2; // Start of a word
    return 3;
}

function lavensteinDistance(source: string, query: string) {
    const table = Array.from({ length: source.length + 1 }).map(() =>
        Array.from({ length: query.length + 1 }).map(() => 0),
    );

    for (let i = 0; i <= source.length; i++) {
        table[i][0] = i;
    }

    for (let j = 0; j <= query.length; j++) {
        table[0][j] = j;
    }

    for (let i = 1; i <= source.length; i++) {
        for (let j = 1; j <= query.length; j++) {
            const cost = source[i - 1] === query[j - 1] ? 0 : 1;
            table[i][j] = Math.min(
                table[i - 1][j] + 1, // deletion
                table[i][j - 1] + 1, // insertion
                table[i - 1][j - 1] + cost, // match or sub
            );
        }
    }

    return table[source.length][query.length];
}


export default fuzzy;