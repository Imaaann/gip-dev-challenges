import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter } from "react-router";
import PlaceHolder from "./components/PlaceHolder.tsx";
import { RouterProvider } from "react-router/dom";
import Home from "./screens/Home.tsx";
import BitStrings from "./screens/BitStrings.tsx";
import SmallestInt from "./screens/SmallestInt.tsx";
import AutoCompleteScreen from "./screens/AutoComplete.tsx";
import BackendChallenge from "./screens/BackendChallenge.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: "/bit_strings",
                element: <BitStrings />,
            },
            {
                path: "/autocomplete",
                element: <AutoCompleteScreen/> 
            },
            {
                path: "/smallest_int",
                element: <SmallestInt />,
            },
            {
                path: "/auth_api",
                element: <BackendChallenge title="Authentication API (/api/auth)" />,
            },
            {
                path: "/lost_found",
                element: <BackendChallenge title="Lost & Found API (/api/lostfound)" />,
            },
            {
                path: "/sales",
                element: <BackendChallenge title="Flash Sale Races (/api/sale)" />,
            },
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);
