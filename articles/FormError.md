A very simple field error component. 

```jsx
const form = useForm(
    {
        name: "John Tester"
    },
    (values) => ({ name: values.name.length < 5 ? "Name must be longer" : undefined }) // Example validator
);

<FormInput form={form} name="name" />

// Will render a `p` element on error.
<FormError form={form} name="name" />
```

## Custom error component

Because this component doesn't have a lot of functionality (only props are `form` and `name`), it is recommended to create a FormError component yourself.

Below is an example of a custom form error component.

```jsx

// Use generics to create type-safe code
function CustomFormError<T>(props: { form: FormState<T>; name: keyof T }) {

    // Listen for changes on a form field, behaves like useState
    const { error } = useListener(props.form, props.name);

    // Render nothing when no error
    if (!error) 
        return null;

    // Render a styled span on error.
    return <span style={{ color: "red", fontWeight: "bold" }}>
        {error}
    </span>;
}

```

You can also create custom input components, look [here](https://github.com/CodeStix/typed-react-form/wiki/Custom-inputs).

