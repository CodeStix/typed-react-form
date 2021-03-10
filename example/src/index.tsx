import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import OneOfObjectForm from "./OneOfObjectForm";
import OneOfObjectArrayForm from "./OneOfObjectArrayForm";

function Router() {
    switch (window.location.hash) {
        case "#object-types":
            return <OneOfObjectForm />;
        case "#object-types-array":
            return <OneOfObjectArrayForm />;
        default:
            return <App />;
    }
}

ReactDOM.render(<Router />, document.getElementById("root"));
