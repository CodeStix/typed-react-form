import React, { useState } from "react";
import { Field, useForm } from "typed-react-form";

export function TestForm() {
    const [counter, setCounter] = useState(0);
    const form = useForm({ firstName: "Stijn", lastName: "Rogiest" });

    return (
        <form>
            <label>FirstName</label>
            <Field form={form} name="firstName" />
            <label>Lastname</label>
            <Field form={form} name="lastName" />
            <pre>Counter = {counter}</pre>
            <button type="button" onClick={() => setCounter(counter + 1)}>
                Increase
            </button>
        </form>
    );
}
