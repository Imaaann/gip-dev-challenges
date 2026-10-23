import ContentBox from "../components/ContentBox";

export default function BackendChallenge({ title }: { title: string }) {
    return (
        <ContentBox>
            <h2>{title}</h2>
            <p>
                The Backend Challenges are All hosted under this
                <br />
                <code>::/api/problem</code>
                I implore you to visit the backend specific documentation.{" "}
                <br />
                There is also a test suite using vitest to clear most cases just
                in case.
                <br />
                <br/>
                <span style={{ color: "#dc143c" }}>
                    I did take some liberty in the questions, such as sales
                    always being of quantity = 1
                </span>
            </p>
            <nav className="navigation">
                <a href="/docs">Swagger Docs</a>
            </nav>
        </ContentBox>
    );
}
