import { useState } from "react";
import ActionButton from "../components/ActionButton";
import ContentBox from "../components/ContentBox";
import {
    findSmallestPostivieInt,
    generateIntArray,
} from "../solutions/SmallestInt";

function SmallestInt() {
    const [show, setShow] = useState(false);
    const [logs, setLogs] = useState("");
    const [result, setResult] = useState("");

    const runAlgorithm = () => {
        const n = Math.floor(Math.random() * 20) + 10;
        const numbers = generateIntArray(n);
        const smallest = findSmallestPostivieInt(numbers);

        setResult(smallest.toString());
        setLogs(`
            n = ${n}\n
            numbers = ${numbers}.
          `);
        setShow(true);
    };

    return (
        <>
            <h2>DSA #1 | Smallest Positive Int</h2>
            <ContentBox>
                <p>
                    Okay so we first sort the array to make it easier to go
                    through <br />
                    Then we keep a counter that advances everytime we see the
                    next number in the naturals <br />
                    If we skip a number in the naturals, the accumulator will
                    stop and we can say that it is the smallest int <br />
                    <br />
                    Note: 0 is considered positive here.
                </p>
            </ContentBox>
            <ActionButton onClick={runAlgorithm}>Run Algorithm</ActionButton>
            {show && (
                <ContentBox>
                    <h3>Result: {result}</h3>
                    <h4>Logs: </h4>
                    <p
                        style={{
                            textWrap: "wrap",
                            whiteSpace: "pre-wrap",
                            fontSize: "1rem",
                        }}
                    >
                        {logs}
                    </p>
                </ContentBox>
            )}
        </>
    );
}

export default SmallestInt;
