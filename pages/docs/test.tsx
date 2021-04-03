import React from "react";
import { AnyListener, FormInput, useForm } from "typed-react-form";

function MyForm() {
    const form = useForm({ email: "" });
    // Use the standard html form element, which exposes the onSubmit event.
    return (
        <form
            onSubmit={form.handleSubmit(() => {
                // The form.handleSubmit validates the form before calling your callback
                console.log("submit", form.values);
            })}
        >
            {/* Make sure to add type="submit" */}
            <button type="submit">Submit!</button>
        </form>
    );
}

function MyForm2() {
    const form = useForm({ email: "", password: "" });
    return (
        <form
            onSubmit={form.handleSubmit(async (ev) => {
                // Implement your submit logic here...
                console.log("submitting", form.values);
                // Fake fetch, by waiting for 500ms
                await new Promise((res) => setTimeout(res, 500));
                // Optional: set new default values
                form.setDefaultValues(form.values);
            })}
        >
            {/* Make sure to pass the form prop! */}
            <FormInput form={form} name="email" type="text" />
            <FormInput form={form} name="password" type="password" />
            <button type="submit">Submit!</button>
        </form>
    );
}

export default function Testing() {
    return (
        <>
            <MyForm />
            <hr />
            <MyForm2 />
        </>
    );
}
