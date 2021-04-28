import React from "react";
import { useForm, Field, AnyListener, FieldError } from "typed-react-form";

function Input(props: { value?: string; onChange?: (value: string) => void; style: React.CSSProperties }) {
    return <input style={{ padding: "0.3em", ...props.style }} value={props.value} onChange={(ev) => props.onChange?.(ev.target.value)} />;
}

function validate(_: any) {
    return {
        email: "yikes"
    };
}

function Error(props: { children: React.ReactNode }) {
    return (
        <p>
            not epic:
            <strong>{props.children}</strong>
        </p>
    );
}

export function FieldForm() {
    const form = useForm({ email: "", firstName: "", gender: "male" as "male" | "female", enableEmail: true }, validate);

    function submit() {
        console.log("this is epic");
    }

    return (
        <form onSubmit={form.handleSubmit(submit)}>
            <Field form={form} name="firstName" as="input" />
            <Field form={form} name="enableEmail" type="checkbox" />
            <Field form={form} name="email" style={{ margin: "2em" }} />
            <Field form={form} name="email" as={Input} style={{ margin: "2em" }} />
            <FieldError form={form} name="email" as={Error} />
            <Field form={form} name="gender" as="select">
                <option value="male">male</option>
                <option value="female">female</option>
            </Field>
            <pre>
                <AnyListener form={form} render={() => JSON.stringify(form.values, null, 2)} />
            </pre>
            <button type="submit">Submit</button>
        </form>
    );
}
