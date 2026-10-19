function main() {
    const input = document.getElementById("main-input");
    const error = document.getElementById("error");
    assignButtonOperations(input, error);
}


const NUMPAD = [
    ["(", ")"],
    ["c", "/", "*", "-"],
    ["7", "8", "9", "+"],
    ["4", "5", "6", "+"],
    ["1", "2", "3", "="],
    ["0", ".", "="],
]

let cursor = { 
    row: 0,
    column: 0
}

function navigate(e) { 
    if (e.key == "ArrowUp" && e.shiftKey) {
        document.getElementById("main-input").focus(); 
    } else if (e.key == "ArrowUp") {
        document.getElementById("")
    }
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
        return () => {
            try {
                error.classList.add("hidden");
                const result = calculate(input.value);
                input.value = result;
            } catch (err) {
                error.classList.remove("hidden");
                error.textContent = "(╥‸╥) Oh no | " +  err.message;
            }
        };
    }

    return () => {
        input.value = input.value + code;
    };
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
