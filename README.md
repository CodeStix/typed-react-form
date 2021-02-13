# Typed React form

A React form state manager, focussed on flawless typescript integration and minimal rerenders. Supports nested objects/arrays.

[![NPM](https://img.shields.io/npm/v/typed-react-form.svg)](https://www.npmjs.com/package/typed-react-form)

![vscode typescript](https://github.com/CodeStix/typed-react-form/raw/master/example/public/thumb.png)

## Install

```bash
npm install --save typed-react-form
yarn add typed-react-form
```

## Simple usage

Check out the documentation [here](https://github.com/). The form below is fully typed.

```tsx
import { AnyListener, FormInput, useForm, ChildForm } from "typed-react-form";

const form = useForm(
    {
        firstName: "John",
        lastName: "Tester",
        info: { email: "johntester@example.com", favoriteFood: "pasta" }
    },
    { isSubmitting: false }
);

return (
    <form
        onSubmit={async (ev) => {
            ev.preventDefault();
            // Fetch...
            form.setDefaultValues(form.values);
        }}
    >
        <FormInput form={form} name="firstName" />
        <FormInput form={form} name="lastName" />
        <ChildForm
            parent={form}
            name="info"
            render={(form) => (
                <>
                    <FormInput form={form} name="email" />
                    <FormInput form={form} name="favoriteFood" />
                </>
            )}
        />
        <button>Submit</button>
        <AnyListener form={form} render={({ values }) => <pre>{JSON.stringify(values, null, 2)}</pre>} />
    </form>
);
```

### Todo

- Fix styled-components integration (without using the `FixStyled` helper type)
- Validators support
- Typed `<option>` elements

## License

MIT © [CodeStix](https://github.com/CodeStix)
