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
                element: <PlaceHolder text="Frontend #1" />,
            },
            {
                path: "/smallest_int",
                element: <SmallestInt />,
            },
            {
                path: "/auth_api",
                element: <PlaceHolder text="Backend #2" />,
            },
            {
                path: "/lost_found",
                element: <PlaceHolder text="Backend #1" />,
            },
            {
                path: "/sales",
                element: <PlaceHolder text="Backend #3" />,
            },
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);
