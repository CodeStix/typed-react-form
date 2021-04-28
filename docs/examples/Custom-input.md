---
layout: default
parent: Examples
title: Custom input component
---

## Custom input

If the default [`<Field/>`](/typed-react-form/reference/Field) component does not provide enough functionality for you, you can create a custom field component.

![custom input](/typed-react-form/images/custominput.gif)

The following code resembles a custom input component that shows an error when needed, paints gray background when modified, gets disabled when submitting and shows its defaultValue as a placeholder. You can tweak this custom input further by implementing transformations for different input types, allowing `HTMLInputAttributes` etc.

The builtin inputs are also just abstractions around the useListener hook.

```tsx
function CustomInput<T>(props: { form: FormState<T>; name: keyof T; children?: React.ReactNode }) {
    const { value, error, dirty, setValue, state, defaultValue } = useListener(props.form, props.name);

    // You should probably implement some value transformations instead of using 'as any' (for number and date fields ...)
    return (
        <label style={{ display: "block" }}>
            {props.children}
            <input
                style={{ border: error ? "1px solid red" : undefined, background: dirty ? "#eee" : undefined }}
                disabled={state.isSubmitting}
                placeholder={defaultValue as any}
                value={value as any}
                onChange={(ev) => setValue(ev.target.value as any)}
            />
            {error && <p style={{ color: "red" }}>{error}</p>}
        </label>
    );
}

function ExampleForm() {
    const form = useForm(
        {
            firstName: "John",
            lastName: "Pineapple"
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
            <CustomInput form={form} name="firstName" />
            <CustomInput form={form} name="lastName" />
            <button>Submit</button>
            <button type="reset">Reset</button>
        </form>
    );
}
```
