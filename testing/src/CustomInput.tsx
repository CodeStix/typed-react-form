import React, { InputHTMLAttributes } from "react";
import { defaultDeserializer, defaultSerializer, FormState, SerializeProps, useForm, useListener } from "typed-react-form";

// Most basic example of a type-checked input
function CustomInput1<T extends object>(props: { form: FormState<T>; name: keyof T }) {
    // Listen for changes on form field
    const { value, setValue } = useListener(props.form, props.name);
    // Convert value to string, and set string on change. This only works with text fields
    return <input value={value + ""} onChange={(ev) => setValue(ev.target.value as any)} />;
}

// Basic example of a type-checked input, which you can pass <input> props to.
// Make sure to add Omit, otherwise our form and name props will interfere
function CustomInput2<T extends object>(props: { form: FormState<T>; name: keyof T } & Omit<InputHTMLAttributes<HTMLInputElement>, "form" | "name">) {
    // Rest contains <input> props
    const { form, name, ...rest } = props;
    const { value, setValue } = useListener(form, name);
    // Apply <input> props using {...rest}
    return <input value={value + ""} onChange={(ev) => setValue(ev.target.value as any)} {...rest} />;
}

// Example of a type-checked number input
function CustomInput3<T extends object>(props: { form: FormState<T>; name: keyof T }) {
    const { value, setValue } = useListener(props.form, props.name);
    // Convert value to string, and back to number on change
    return <input value={value + ""} onChange={(ev) => setValue(parseFloat(ev.target.value) as any)} />;
}

// Example of a type-checked input using the builtin serializer (that is also used for FieldError), this
// serializer supports date fields, number fields, primitive array fields. SerializeProps will add the type prop.
// Make sure to add SerializeProps
function CustomInput4<T extends object>(props: { form: FormState<T>; name: keyof T } & SerializeProps) {
    const { value, setValue } = useListener(props.form, props.name);
    // defaultSerializer: converts value to string
    // defaultDeserializer: converts string back to value
    let v = defaultSerializer(value, props);
    return (
        <input
            type={props.type}
            value={typeof v === "string" ? v : undefined}
            checked={typeof v === "boolean" ? v : undefined}
            onChange={(ev) => setValue(defaultDeserializer(ev.target.value ?? ev.target.checked, value, props))}
        />
    );
}

// Example of a type-checked input using the type-checked default serializer,
// where value field of your custom input is type-checked
function CustomInput5<T extends object, Key extends keyof T>(props: { form: FormState<T>; name: Key } & SerializeProps<T[Key]>) {
    const { value, setValue } = useListener(props.form, props.name);
    let v = defaultSerializer(value, props);
    return (
        <input
            type={props.type}
            value={typeof v === "string" ? v : undefined}
            checked={typeof v === "boolean" ? v : undefined}
            onChange={(ev) => setValue(defaultDeserializer(ev.target.value ?? ev.target.checked, value, props))}
        />
    );
}

// Fully fledged type-checked input
function CustomInput6<T extends object, Key extends keyof T>(
    props: { form: FormState<T>; name: Key } & SerializeProps<T[Key]> &
        Omit<InputHTMLAttributes<HTMLInputElement>, "form" | "name" | "value" | "type">
) {
    // Remove SerializeProps, form and name from props so rest contains the <input> props.
    const { form, name, dateAsNumber, setNullOnUncheck, setUndefinedOnUncheck, value: inputValue, type, ...rest } = props;
    const { value, setValue } = useListener(form, name);
    let v = defaultSerializer(value, { dateAsNumber, setNullOnUncheck, setUndefinedOnUncheck, value: inputValue, type });
    return (
        <input
            type={type}
            value={typeof v === "string" ? v : undefined}
            checked={typeof v === "boolean" ? v : undefined}
            onChange={(ev) => setValue(defaultDeserializer(ev.target.value ?? ev.target.checked, value, props))}
            {...rest}
        />
    );
}

export function CustomInputsForm() {
    const form = useForm(
        {
            firstName: "John",
            lastName: "Pineapple",
            gender: "male" as "male" | "female"
        },
        (values) => ({ firstName: values.firstName.length < 3 ? "Firstname must be longer!" : undefined }) // Example validator
    );
    return (
        <form
            style={{ margin: "1em" }}
            onReset={() => form.resetAll()}
            onSubmit={async (ev) => {
                ev.preventDefault();
                if (form.error) return;
                form.setState({ isSubmitting: true });
                console.log("submit", form.values);
            }}
        >
            <CustomInput1 form={form} name="lastName" />
            <CustomInput2 form={form} name="lastName" style={{ background: "gray" }} />
            <CustomInput3 form={form} name="lastName" />
            <CustomInput4 form={form} name="lastName" type="checkbox" />
            <CustomInput5 form={form} name="gender" type="radio" value="female" />
            <CustomInput5 form={form} name="gender" type="radio" value="male" />
            <CustomInput6 form={form} name="gender" type="radio" />
            <button>Submit</button>
            <button type="reset">Reset</button>
        </form>
    );
}
