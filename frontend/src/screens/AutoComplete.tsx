import ContentBox from "../components/ContentBox";
import { countries } from "../data/data";
import AutoComplete from "../solutions/AutoComplete";

function AutoCompleteScreen() { 
    

    
    return <>
        <ContentBox>
            <p>
                So for this one we got 2 main parts.
            </p>
            <ol>
                <li>Making the fuzzy search algorithm</li>
                <li>Making the components actually accessible and usable </li>
            </ol>
            <p>
                For the algorithm, I just made a naive implementation based on lavenstein distance and the position of the match.
                <br /> so the algorithm favors matches that are closer to the begining of the word to have that 'auto complete' feel
            </p>
        </ContentBox>
        <AutoComplete data={countries.map(c => c.name)}/>
    </>
}

export default AutoCompleteScreen;