function main() {
    const input = document.getElementById("main-input");
    const error = document.getElementById("error");
    const numpad = document.getElementById("buttons-container");
    assignButtonOperations(input, error);
    document.addEventListener("keydown", navigate);
    document.addEventListener("keydown", (e) => {
        if (!numpad.contains(e.target) && e.key === "Enter") {
            e.preventDefault();
            displayCalculate(input, error);
        }
    });
}

const NUMPAD = [
    ["(", ")"],
    ["C", "/", "*", "-"],
    ["7", "8", "9", "+"],
    ["4", "5", "6", "+"],
    ["1", "2", "3", "="],
    ["0", ".", "="],
];

let cursor = {
    row: 0,
    column: 0,
};

// Javascript and keeping the sign in modulo
// and my hatred towards too many if statements
const wrap = (n, len) => ((n % len) + len) % len;

function navigate(e) {
    const isInput = e.target.id === "main-input";

    if (isInput) {
        if (e.key === "ArrowDown" && e.shiftKey) {
            e.preventDefault();
            cursor.row = 0;
            cursor.column = 0;
            document.getElementById(NUMPAD[0][0]).focus();
        }
        return;
    }

    if (e.key === "ArrowUp" && e.shiftKey) {
        e.preventDefault();
        document.getElementById("main-input").focus();
        return;
    } else if (e.key === "ArrowUp") {
        cursor.row = wrap(cursor.row - 1, NUMPAD.length);
    } else if (e.key === "ArrowDown") {
        cursor.row = wrap(cursor.row + 1, NUMPAD.length);
    } else if (e.key === "ArrowLeft") {
        cursor.column = wrap(cursor.column - 1, NUMPAD[cursor.row].length);
    } else if (e.key === "ArrowRight") {
        cursor.column = wrap(cursor.column + 1, NUMPAD[cursor.row].length);
    }

    // Clamp the column based on the new row
    // Wide buttons yay!
    cursor.column = Math.min(cursor.column, NUMPAD[cursor.row].length - 1);

    const code = NUMPAD[cursor.row][cursor.column];

    if (!code) {
        throw new Error("Keyboard Navigation error, out of bounds");
    }

    const button = document.getElementById(code);
    button.focus();
}

// Evaluate Equation

const OPERATORS = ["-", "+", "*", "/", "(", ")"];

function tokenize(expression) {
    return expression.match(/\d+\.?\d*|[-+*/()]/g);
}

function handleUnaryNegation(tokens) {
    tokens.forEach((token, index) => {
        if (token.toLowerCase() !== "-") return;

        if (index === 0) {
            tokens[index] = "NEG";
        }

        if (tokens[index - 1] === "(") {
            tokens[index] = "NEG";
        }

        if (Object.keys(PRECEDENCE).includes(tokens[index - 1])) {
            tokens[index] = "NEG";
        }
    });
}

const PRECEDENCE = {
    "+": 11,
    "-": 10,
    "*": 21,
    "/": 20,
    NEG: 30,
};

function turnIntoPostfix(infixTokens) {
    const postFixTokens = [];
    const stack = [];

    for (const token of infixTokens) {
        if (!isNaN(token)) {
            postFixTokens.push(parseFloat(token));
        } else if (token === "NEG") {
            stack.push(token);
        } else if (token in PRECEDENCE) {
            while (
                stack.length &&
                stack.at(-1) in PRECEDENCE &&
                PRECEDENCE[stack.at(-1)] >= PRECEDENCE[token]
            ) {
                const highPrecedenceOp = stack.pop();
                postFixTokens.push(highPrecedenceOp);
            }

            stack.push(token);
        } else if (token === "(") {
            stack.push(token);
        } else if (token === ")") {
            while (stack.length && stack.at(-1) !== "(") {
                postFixTokens.push(stack.pop());
            }

            // pop the final "("
            stack.pop();
        }
    }

    while (stack.length) postFixTokens.push(stack.pop());
    return postFixTokens;
}

function evaluatePostFix(postFixTokens) {
    const stack = [];

    for (const token of postFixTokens) {
        if (typeof token === "number") {
            stack.push(token);
        } else if (token.toLowerCase() === "neg") {
            stack.push(-stack.pop());
        } else {
            const b = stack.pop();
            const a = stack.pop();
            let result = 0;
            switch (token) {
                case "*":
                    result = a * b;
                    break;
                case "/":
                    if (b == 0) {
                        throw new Error("Division by Zero is not allowed");
                    }
                    result = a / b;
                    break;
                case "+":
                    result = a + b;
                    break;
                case "-":
                    result = a - b;
                    break;
            }
            stack.push(result);
        }
    }

    return stack[0];
}

function calculate(expression) {
    const lexicalError = validateInputLexical(expression);

    if (lexicalError) {
        throw new Error(lexicalError);
    }

    const tokens = tokenize(expression);
    handleUnaryNegation(tokens);

    const syntacticError = validateInputSyntactic(tokens);
    if (syntacticError) {
        throw new Error(syntacticError);
    }

    const postFix = turnIntoPostfix(tokens);
    const result = evaluatePostFix(postFix);
    return result;
}

// Checking Input

function validateInputLexical(expression) {
    const clean = expression.replace(/\s/g, "");

    if (clean == "") return "empty expression";
    if (!/^[0-9.+\-*/()]*$/.test(clean)) return "invalid character";

    const tokens = tokenize(clean);
    if (!tokens || tokens.join("") !== clean) return "invalid number format";

    return null;
}

function validateInputSyntactic(tokens) {
    // State machine with 2 states, "num" & "op"
    // State Table:
    // | Current | token  | Next |
    // | ------- | ------ | ---- |
    // | num     | number | op   |
    // | num     | (      | num  |
    // | num     | neg    | num  |
    // | op      | any op | num  |
    // | op      | )      | op   |
    //
    // State machine starts at "num"
    // To be valid needs to end at state "op"
    let expecting = "number";

    const stateTable = {
        number: {
            n: "operator",
            "(": "number",
            NEG: "number",
        },
        operator: {
            "+": "number",
            "-": "number",
            "*": "number",
            "/": "number",
            ")": "operator",
        },
    };

    for (const token of tokens) {
        const found = !isNaN(token) ? "n" : token;
        const nextState = stateTable[expecting][found];

        if (!nextState) {
            return "invalid expression";
        }

        expecting = nextState;
    }

    if (expecting === "number") {
        return "expression must end with a number or )";
    }

    return null;
}

// All this just to not go back and edit the HTML btw .-.
// Actual Comment: Setting up the buttons do to stuff
function createButtonClickOperation(code, input, error) {
    if (code.toLowerCase() === "c") {
        return () => {
            error.classList.add("hidden");
            input.value = "";
        };
    }

    if (code.toLowerCase() === "=") {
        return () => displayCalculate(input, error);
    }

    return () => {
        input.value = input.value + code;
    };
}

function displayCalculate(input, error) {
    try {
        error.classList.add("hidden");
        const result = calculate(input.value);
        input.value = result;
    } catch (err) {
        error.classList.remove("hidden");
        error.textContent = "(╥‸╥) Oh no | " + err.message;
    }
}

function assignButtonOperations(input, error) {
    const allButtons = document.getElementById("buttons-container");

    if (!allButtons) {
        throw new Error(
            "DOM Error: Content not loaded correctly, missing buttons",
        );
    }

    for (const button of allButtons.children) {
        const buttonOnClick = createButtonClickOperation(
            button.textContent,
            input,
            error,
        );
        button.id = button.textContent;
        button.addEventListener("click", buttonOnClick);
    }
}

document.addEventListener("DOMContentLoaded", main);
