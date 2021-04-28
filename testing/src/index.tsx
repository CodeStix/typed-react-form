import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import OneOfObjectForm from "./OneOfObjectForm";
import OneOfObjectArrayForm from "./OneOfObjectArrayForm";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { ExampleForm } from "./ExampleForm";
import { CustomInputsForm } from "./CustomInput";
import { FieldForm } from "./Fieldform";

function Router() {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/object-types" component={OneOfObjectForm} />
                <Route path="/object-types-array" component={OneOfObjectArrayForm} />
                <Route path="/custom-inputs" component={CustomInputsForm} />
                <Route path="/field" component={FieldForm} />
                <Route path="/" component={ExampleForm} />
            </Switch>
        </BrowserRouter>
    );
}

ReactDOM.render(<Router />, document.getElementById("root"));
