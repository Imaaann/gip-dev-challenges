import { Link, Outlet } from "react-router";

function App() {
    return (
        <div className="main-container">
            <h1>GIP Dev Challenges | iMan</h1>
            <nav className="navigation content">
                <h2>Navigation</h2>
                <Link to="/" >Home</Link>
                <Link to="/bit_strings" >Task 1 | Problem Solving</Link>
                <a href="/calculator" >Task 1 | Frontend</a>
                <Link to="/lost_found" >Task 1 | Backend</Link>
                <Link to="/autocomplete" >Task 2 | Frontend</Link>
                <Link to="/auth_api" >Task 2 | Backend</Link>
                <Link to="/smallest_int" >Task 2 | Problem Solving</Link>
                <Link to="/sales" >Task 3 | Flash Sale</Link>
            </nav>
            <Outlet />
        </div>
    );
}

export default App;
