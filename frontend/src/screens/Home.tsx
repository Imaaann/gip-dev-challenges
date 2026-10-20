import ContentBox from "../components/ContentBox";

function Home() {
    return (
        <>
            <h2>Home :D</h2>
            <ContentBox>
                <p>
                    I have hosted all my Solutions in one Web service. since
                    hosting multiple services would be a little too out of scope
                    for this. <br />
                    The navigation above serves as a way to look at all the
                    submissions, the frontend design is quite rushed as I didn't
                    really bother with. <br />
                    <br />
                    <br/>
                    NOTE: Task 1, frontend is served through normal HTMl, CSS,
                    JS you can check the network tab its pure vanilla.
                </p>
            </ContentBox>
            <ContentBox>
                <p>
                    I hope that these submissions will be satisfactory and up to
                    your standards dear technical judge .-.
                </p>
            </ContentBox>
            <ContentBox>
                <p>
                    As for navigating the code base, the relevant non glue code is all going to be in the [<code>/solutions</code>] directory 
              </p>
            </ContentBox>
        </>
    );
}

export default Home