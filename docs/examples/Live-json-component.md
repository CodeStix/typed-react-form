---
layout: default
parent: Examples
title: Realtime JSON component
---

## Form JSON component

![realtime updating form values](/typed-react-form/images/jsoncomponent.gif)

```tsx
// Take a form containing any values
function FormJson(props: { form: FormState<any> }) {
    // Listen for all changes on the form
    const { values } = useAnyListener(props.form);
    // Show the json representation of the values in the form
    return <pre>{JSON.stringify(values, null, 2)}</pre>;
}

// Usage
function ExampleForm() {
    const form = useForm({ name: "John", age: 19 });
    return (
        <form
            style={{ margin: "1em" }}
            onSubmit={async (ev) => {
                ev.preventDefault();
                console.log("submit", form.values);
            }}
        >
            <Field form={form} name="name" />
            <Field type="number" form={form} name="age" />
            {/* Use your component, pass the form */}
            <FormJson form={form} />
            {/* Using AnyListener, provides the same functionality */}
            <AnyListener form={form} render={({ values }) => <pre>{JSON.stringify(values, null, 2)}</pre>} />
            <button>Submit</button>
        </form>
    );
}
```
