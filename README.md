# Typed React form

A React form state manager, focussed on flawless typescript integration and minimal rerenders. Supports nested objects/arrays.

[![NPM](https://img.shields.io/npm/v/typed-react-form.svg)](https://www.npmjs.com/package/typed-react-form)

![vscode typescript](https://github.com/CodeStix/typed-react-form/raw/master/example/public/thumb.png)

## Install

```bash
npm install --save typed-react-form
yarn add typed-react-form
```

## Usage

This libary contains components and hooks to wrap your UI components with, which you can then reuse all over your application. After you did this correctly, all your form elements will be type checked!

You should check the [example code](https://github.com/CodeStix/typed-react-form/tree/master/example) for more information, which is hosted [here](https://codestix.github.io/typed-react-form/).

```tsx
const form = useForm(
    {
        firstName: "John",
        lastName: "Tester",
        info: { email: "johntester@example.com" }
    },
    { isSubmitting: false }
);
return (
    <form>
        <Input form={form} name="firstName" />
        <Input form={form} name="lastName" />
        <form>
            <Input form={form} name="firstName" />
            <Input form={form} name="lastName" />
            <ChildForm parent={form} name="info">
                {(form) => (
                    <>
                        <Input form={form} name="email" />
                    </>
                )}
            </ChildForm>
        </form>
    </form>
);
```

### Array/object fields

To implement array and object fields, you should use `useArrayForm` and `useChildForm` (see below). Each object/array layer is seen as a seperate form.

## Documentation

#### `useForm`

Hook which creates a new form state manager, and returns it, which can then be used with any of the components and hooks below.

#### `<Listener form={} name="" />`

Component (wrapper around useListener) to listen for changes on a form's field without rerendering the whole form.

#### `<AnyListener form={} />`

Component (wrapper around useAnyListener) to listen any changes in a form without rerendering.

#### `<ChildForm parent={} name="" />`

Component (wrapper around useChildForm) to create a form out of one of its parent's object fields.
Name should be the name of a field in the parent form which is an object.
When the parent form is an array form, you should pass the index to the name field.

#### `<ArrayForm parent={} name="">`

Component (wrapper around useArrayForm) to create a form out of one of its parent's array fields.
Name should be the name of a field in the parent form which is an array.

#### `useListener(form, name)`

Hook to listen for changes on a form's field, you should not use this in large components as it will cause a rerender. Use multiple Listener components instead.

#### `useAnyListener(form)`

Hook to listen for any change on a form without rerendering the whole form. Do not use this in large components, because this will cause a rerender each time a form changes. Use multiple AnyListener's instead.

## Wrapping your inputs

Example of a simple stateful input.

```tsx
function SimpleInput<T extends ObjectOrArray>(props: {
    form: Form<T, { isSubmitting: boolean }>;
    name: KeyOf<T>;
}) {
    const { value, setValue } = useListener(props.form, props.name);
    return (
        <input
            value={value as string}
            onChange={(ev) => setValue(ev.target.value as T[KeyOf<T>])}
        />
    );
}
```

Example of a stateful input, which is disabled when submitting, shows error when needed, shows its default value as placeholder, and turns gray when modified (dirty).

```tsx
function Input<T extends ObjectOrArray>({
    form,
    name,
    ...rest
}: {
    form: Form<T, { isSubmitting: boolean }>;
    name: KeyOf<T>;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "form">) {
    const { value, dirty, defaultValue, error, state } = useListener(
        form,
        name
    );

    return (
        <>
            <input
                disabled={state.isSubmitting}
                placeholder={defaultValue}
                style={{
                    background: dirty ? "#eee" : "#fff",
                    padding: "0.3em",
                    fontSize: "inherit",
                    outline: error ? "4px solid #f306" : "none"
                }}
                value={value as string}
                onChange={(ev) =>
                    form.setValue(name, ev.target.value as T[KeyOf<T>])
                }
                {...rest}
            />
            {error && (
                <span
                    style={{
                        padding: "0.3em",
                        fontWeight: "bold",
                        color: "red"
                    }}
                >
                    {error}
                </span>
            )}
        </>
    );
}
```


## License

MIT © [CodeStix](https://github.com/CodeStix)
