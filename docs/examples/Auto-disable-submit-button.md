---
layout: default
parent: Examples
title: Submit button that disables when unmodified/error
---

## Submit button that disables when unmodified/error

![live updating form values](/typed-react-form/images/submitbutton.gif)

```tsx
function FormExample() {
    const form = useForm(
        {
            name: "John"
        },
        (values) => ({
            // Example validator
            name: values.name.length < 3 ? "Name must be longer" : undefined
        })
    );
    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                console.log("save", form.values);
                form.setValues(form.values);
            }}
        >
            <Field form={form} name="name" />
            {/* Listen for any change on the form */}
            <AnyListener form={form} render={(form) => <button disabled={!form.dirty || form.error}>Save</button>} />
        </form>
    );
}
```
