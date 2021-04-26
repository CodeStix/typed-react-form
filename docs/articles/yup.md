# yup

To validate your form using [yup](https://www.npmjs.com/package/yup), do the following:

First, install [typed-react-form-yup](https://www.npmjs.com/package/typed-react-form-yup)

```
npm install typed-react-form-yup
```

Then use the `yupValidator(yupSchema, options?)` helper function to create a validator function for your yup schema, which you can then pass to the `useForm` hook.

## Parameters

#### `yupSchema` **(required)**

The yup validation schema that will validate the form values.

#### `options` **(optional)**

Yup validation options.

## Usage example

```tsx
import { useForm, FormError, FormInput, AnyListener } from "typed-react-form";
import { yupValidator } from "typed-react-form-yup";
import * as yup from "yup";

interface LoginRequest {
    email: string;
    password: string;
}

const LoginRequestSchema = yup.object({
    email: yup.string().required("Please enter an email").email("Please enter a valid email address."),
    password: yup.string().required("Please enter a password").min(5, "Password must be longer"),
});

export function YupFormExample() {
    const form = useForm<LoginRequest>({ email: "", password: "" }, yupValidator(LoginRequestSchema), true);

    function submit() {
        console.log("submit", form.values);
    }

    return (
        <form onSubmit={form.handleSubmit(submit)}>
            <FormInput form={form} name="email" type="email" />
            <FormError form={form} name="email" />
            <FormInput form={form} name="password" type="password" />
            <FormError form={form} name="password" />
            <button type="submit">Submit</button>
        </form>
    );
}
```
