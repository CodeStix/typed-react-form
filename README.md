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

## Documentation

The library contains **jsdoc** documentation for every hook and component. 

You should check the [example code](https://github.com/CodeStix/typed-react-form/tree/master/example) for more information, which is hosted [here](https://codestix.github.io/typed-react-form/).

## Wrapping your inputs

Example of a simple stateful input.

```tsx
function SimpleInput<T>(props: { form: FormState<T, { isSubmitting: boolean }>; name: keyof T }) {
    const { value, setValue } = useListener(props.form, props.name);
    return <input value={value as any} onChange={(ev) => setValue(ev.target.value as any)} />;
}
```

Example of a stateful input, which is disabled when submitting, shows error when needed, shows its default value as placeholder, and turns gray when modified (dirty). Also extends the original input props.

```tsx
type InputProps<T> = Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "form"> & {
    form: FormState<T, { isSubmitting: boolean }>;
    name: keyof T;
};

function Input<T>({ form, name, ...rest }: InputProps<T>) {
    const { value, dirty, defaultValue, error, state } = useListener(form, name);
    return (
        <>
            <input
                disabled={state.isSubmitting}
                placeholder={defaultValue as any}
                style={{
                    background: dirty ? "#eee" : "#fff",
                    padding: "0.3em",
                    fontSize: "inherit",
                    outline: error ? "4px solid #f306" : "none"
                }}
                value={value as any}
                onChange={(ev) => form.setValue(name, ev.target.value as any)}
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

### Array/object fields

To implement array and object fields, you should use `useArrayListener` and `useChildForm`. Each object/array layer is seen as a seperate form.

## License

MIT © [CodeStix](https://github.com/CodeStix)
