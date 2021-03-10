import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import OneOfObjectForm from "./OneOfObjectForm";
import OneOfObjectArrayForm from "./OneOfObjectArrayForm";
import { BrowserRouter as Router, Route } from "react-router-dom";

ReactDOM.render(
    <Router>
        <Route path="/" exact component={App} />
        <Route path="/object-types" exact component={OneOfObjectForm} />
        <Route path="/object-types-array" exact component={OneOfObjectArrayForm} />
    </Router>,
    document.getElementById("root")
);
