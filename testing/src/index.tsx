import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import OneOfObjectForm from "./OneOfObjectForm";
import OneOfObjectArrayForm from "./OneOfObjectArrayForm";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { StyledForm } from "./StyledForm";
import { ExampleForm } from "./ExampleForm";
import App from "./App";
import { CustomInputsForm } from "./CustomInput";

function Router() {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/object-types" component={OneOfObjectForm} />
                <Route path="/object-types-array" component={OneOfObjectArrayForm} />
                <Route path="/styled-form" component={StyledForm} />
                <Route path="/test" component={App} />
                <Route path="/custom-inputs" component={CustomInputsForm} />
                <Route path="/" component={ExampleForm} />
            </Switch>
        </BrowserRouter>
    );
}

ReactDOM.render(<Router />, document.getElementById("root"));
