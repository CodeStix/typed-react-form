import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import OneOfObjectForm from "./OneOfObjectForm";
import OneOfObjectArrayForm from "./OneOfObjectArrayForm";
import { BrowserRouter, Route, Switch } from "react-router-dom";

function Router() {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/object-types" component={OneOfObjectForm} />
                <Route path="/object-types-array" component={OneOfObjectArrayForm} />
                <Route path="/" component={App} />
            </Switch>
        </BrowserRouter>
    );
}

ReactDOM.render(<Router />, document.getElementById("root"));
