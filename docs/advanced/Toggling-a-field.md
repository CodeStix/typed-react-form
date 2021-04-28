---
layout: default
parent: Advanced
title: Toggling a field
---

# Toggling a field

`typed-react-form` allows you to use multiple inputs on the same field, with this feature, you can create a primary input which contains the actual field value, and a secondary field, a checkbox, which sets the field to null/undefined when unchecked.

## Examples

✔️ **Toggle string field using checkbox**

```tsx
import { useForm, Field } from "typed-react-form";

function ToggleForm() {
    const form = useForm({
        name: "codestix"
    });
    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                console.log("submit", form.values);
            }}
        >
            {/* Use the setNullOnUncheck prop. The value prop contains the value that is set when the box gets checked again, you can omit it to use the default value */}
            <Field form={form} name="name" type="checkbox" setNullOnUncheck value="" />
            {/* Use the hideWhenNull prop to hide the input when its field is null */}
            <Field form={form} name="name" type="text" hideWhenNull />
            <button>Submit</button>
        </form>
    );
}
```

✔️ **Toggle object field using checkbox**

```tsx
function ToggleForm() {
    const form = useForm({
        name: "codestix",
        location: { long: 123, lat: 456 } // Object field
    });
    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                console.log("submit", form.values);
            }}
        >
            <Field form={form} name="name" type="text" />

            {/* Use the setNullOnUncheck prop. The value prop contains the value that is set when the box gets checked again, you can omit it to use the default value */}
            <Field form={form} name="location" type="checkbox" setNullOnUncheck />
            {/* ObjectField hides its contents when null/undefined */}
            <ObjectField
                form={form}
                name="location"
                render={(form) => (
                    <>
                        <p>Location lat/long</p>
                        <Field form={form} name="lat" type="number" />
                        <Field form={form} name="long" type="number" />
                    </>
                )}
            />
            <button>Submit</button>
        </form>
    );
}
```
