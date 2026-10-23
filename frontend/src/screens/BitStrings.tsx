import { useState } from "react";
import ActionButton from "../components/ActionButton";
import ContentBox from "../components/ContentBox";
import {
    checkSolution,
    findDifferentBitString,
    generateBitStingArray,
} from "../solutions/DifferentBitString";

function BitStrings() {
    const [show, setShow] = useState(false);
    const [logs, setLogs] = useState("");
    const [result, setResult] = useState("");

    const runAlgorithm = () => {
        const n = Math.floor(Math.random() * 64) + 1;
        const strings = generateBitStingArray(n);
        const different = findDifferentBitString(strings);
        const check = checkSolution(strings, different);

        setResult(different);
        const logs = `
            N = ${n}. \n
            BitStrings = ${JSON.stringify(strings).slice(0, 50) + "...]"} \n
            Found Different = ${different}. \n
            Checked = ${check}. \n
          `;
        setLogs(logs);
        
        setShow(true);
    };

    return (
        <>
            <h2>DSA #1 | Different Bit Strings</h2>
            <ContentBox>
                <p>
                    The solution here just reposes on the Diagonalization
                    algorithms. <br /> I got inspired by the proof that there is
                    more numbers in 0..1 than Naturals
                </p>
            </ContentBox>
            <ActionButton onClick={runAlgorithm}>Run Algorithm</ActionButton>
            {show && (
                <ContentBox>
                    <h3> Result: {result}</h3>
                    <h4>Logs: </h4>
                    <p style={{
                        textWrap: "wrap",
                        whiteSpace: "pre-wrap",
                        fontSize: "1rem"
                    }}>{logs}</p>
                </ContentBox>
            )}
        </>
    );
}

export default BitStrings;
