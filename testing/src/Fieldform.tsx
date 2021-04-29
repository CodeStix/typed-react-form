import React from "react";
import { useForm, Field, FormField } from "typed-react-form";

function CustomInput(props: { value: any; onChange: React.ChangeEventHandler; style?: React.CSSProperties; className?: string; field: FormField }) {
    return (
        <input
            value={props.value}
            onChange={props.onChange}
            style={{ ...props.style, padding: "0.3em", color: props.field.error ? "yellow" : "unset" }}
            className={props.className}
        />
    );
}

export function FieldForm() {
    const form = useForm({ nice: "" }, (values) => ({ nice: values.nice.length < 5 ? "Must be longer" : undefined }));

    function submit() {
        console.log(form.values);
        form.setDefaultValues(form.values);
    }

    return (
        <form onSubmit={form.handleSubmit(submit)}>
            <Field
                form={form}
                name="nice"
                as={CustomInput}
                style={{ color: "gray", fontSize: "2em" }}
                className="blink"
                dirtyStyle={{ fontWeight: "bold" }}
                errorStyle={{ color: "red" }}
            />
            <button type="submit">Go</button>
        </form>
    );
}
