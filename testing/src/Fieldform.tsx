import React, { useRef } from "react";
import { useForm, Field, AnyListener, ObjectField } from "typed-react-form";

const inputStyle: React.CSSProperties = {
    color: "gray",
    padding: "0.3em"
};

// value and onChange are handled by the Field component
function CustomInput(props: { value: string; onChange: (val: string) => void; myCustomProp?: boolean }) {
    return <input style={inputStyle} value={props.value} onChange={(ev) => props.onChange(ev.target.value)} />;
}

export function FieldForm() {
    const form = useForm({ firstName: "", lastName: "" });
    const inputRef = useRef<HTMLInputElement>(null);

    function submit() {
        console.log(form.values);
    }

    return (
        <form onSubmit={form.handleSubmit(submit)}>
            <Field form={form} name="firstName" as={CustomInput} myCustomProp={true} />
            <Field form={form} name="firstName" innerRef={inputRef} />
            <button type="submit">Go</button>
            <button
                type="button"
                onClick={() => {
                    form.setValues({ firstName: "test", lastName: "test2" }, false, true);
                }}
            >
                Set values
            </button>
            <AnyListener form={form} render={({ dirty }) => <pre>{String(dirty)}</pre>} />
            <button
                type="button"
                onClick={() => {
                    inputRef.current!.style.color = Math.random() > 0.5 ? "red" : "blue";
                }}
            >
                Test
            </button>
        </form>
    );
}
