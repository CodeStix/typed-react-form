import React from "react";
import { useForm, Field } from "typed-react-form";

const inputStyle: React.CSSProperties = {
    color: "gray",
    padding: "0.3em"
};

// value and onChange are handled by the Field component
function CustomInput(props: { value: string; onChange: (val: string) => void; myCustomProp?: boolean }) {
    return <input style={inputStyle} value={props.value} onChange={(ev) => props.onChange(ev.target.value)} />;
}

export default function ExampleForm() {
    const form = useForm({ firstName: "", lastName: "" });

    function submit() {
        console.log(form.values);
    }

    return (
        <form onSubmit={form.handleSubmit(submit)}>
            <Field form={form} name="firstName" as={CustomInput} myCustomProp={true} />
            <Field form={form} name="lastName" as={CustomInput} />
            <button type="submit">Go</button>
        </form>
    );
}
