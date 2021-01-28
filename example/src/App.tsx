import React from "react";
import { Form, useForm, useListener, useAnyListener } from "typed-react-form";
import { VisualRender } from "./VisualRender";

function Input<T extends { [key: string]: any }>({
    form,
    name
}: {
    form: Form<T>;
    name: keyof T;
}) {
    const { value, setValue } = useListener(form, name);

    return (
        <VisualRender>
            <input
                value={value as string}
                onChange={(e) => setValue(e.target.value as any)}
            />
        </VisualRender>
    );
}

function FormInfo(props: { form: Form<any> }) {
    const { values } = useAnyListener(props.form);

    return (
        <VisualRender>
            <div style={{ padding: "1em", background: "#eee" }}>
                <code>{JSON.stringify(values, null, 2)}</code>
            </div>
        </VisualRender>
    );
}

export default function App() {
    const form = useForm({ firstName: "stijn", lastName: "rogiest" });

    return (
        <form style={{ margin: "2em" }}>
            <Input form={form} name="firstName" />
            <Input form={form} name="lastName" />
            <FormInfo form={form} />
        </form>
    );
}
