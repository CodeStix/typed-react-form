import React from "react";
import { useForm, Field, AnyListener, FieldError } from "typed-react-form";

function Input(props: { value?: string; onChange?: (value: string) => void; style: React.CSSProperties }) {
    return <input value={props.value} onChange={(ev) => props.onChange?.(ev.target.value)} style={props.style} />;
}

export function FieldForm() {
    const form = useForm({ email: "", firstName: "", gender: "male" as "male" | "female" });

    return (
        <form>
            <Field form={form} name="email" component="textarea" />
            <Field form={form} name="email" component="input" />
            <Field form={form} name="email" component={Input} style={{ margin: "1em" }} />
            <FieldError form={form} name="email" />
            <Field form={form} name="gender" component="select">
                <option value="male">male</option>
                <option value="female">female</option>
            </Field>
            <pre>
                <AnyListener form={form} render={() => JSON.stringify(form.values, null, 2)} />
            </pre>
        </form>
    );
}
