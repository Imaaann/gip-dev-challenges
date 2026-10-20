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
        const n = Math.floor(Math.random() * 8) + 1;
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
                    This one is weirdly simple? Just find the maximum. <br />
                    set it to 0 if negative. <br />
                    return min + 1 since we are in ints.
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
