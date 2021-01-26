# Fast React form

A React form state manager, focussed on flawless typescript integration and minimal rerenders.

[![NPM](https://img.shields.io/npm/v/fast-react-form.svg)](https://www.npmjs.com/package/fast-react-form)

## Install

```bash
npm install --save fast-react-form
yarn add fast-react-form
```

## Usage

This libary contains components and hooks to wrap your UI components with, which you can then reuse all over your application.

You should check the example for more information!

### Wrapping your inputs

Example of an simple stateful input.

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
