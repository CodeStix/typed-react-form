import React from "react";
import {
    Form,
    KeyOf,
    ObjectOrArray,
    useAnyListener,
    useForm,
    useListener
} from "fast-react-form";

function Input<T extends ObjectOrArray>(props: {
    form: Form<T>;
    name: KeyOf<T>;
}) {
    const val = useListener(props.form, props.name);

    return (
        <input
            value={val as string}
            onChange={(ev) =>
                props.form.setValue(props.name, ev.target.value as T[KeyOf<T>])
            }
        />
    );
}

function FormValues<T>(props: { form: Form<T> }) {
    const val = useAnyListener(props.form);

    return <code>{JSON.stringify(val.values, null, 2)}</code>;
}

export default function App() {
    const form = useForm({ firstName: "stijn", lastName: "rogiest" });

    return (
        <div style={{ padding: "3em" }}>
            <Input form={form} name="firstName" />
            <Input form={form} name="lastName" />
            <FormValues form={form} />
        </div>
    );
}
