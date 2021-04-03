# yup

**typed-react-form** has built-in support for [yup](https://github.com/jquense/yup). This is a validation library which makes it mush easier to validate data.

Use the `yupValidator(yupSchema, options?)` helper function to create a validator function for your yup schema.

## Parameters

#### `yupSchema` **(required)**

The yup validation schema that will validate the form values.

---

#### `options` **(optional)**

Yup validation options.

## Usage example

```tsx
import { useForm, yupValidator, FormError, FormInput, AnyListener } from "typed-react-form";
import * as yup from "yup";

interface LoginRequest {
    email: string;
    password: string;
}

const LoginRequestSchema = yup.object({
    email: yup.string().required("Please enter an email").email("Please enter a valid email address."),
    password: yup.string().required("Please enter a password").min(5, "Password must be longer"),
});

function FormExample() {
    const form = useForm<LoginRequest>({ email: "", password: "" }, yupValidator(LoginRequestSchema)); // Use the yup validator
    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                console.log("submit", form.values);
            }}>
            <FormInput form={form} name="email" type="email" />
            <FormError form={form} name="email" />
            <FormInput form={form} name="password" type="password" />
            <FormError form={form} name="password" />
            {/* Listen for any change on the form, and disable the submit button when there is an error */}
            <AnyListener form={form} render={(form) => <button disabled={form.error}>Submit</button>} />
        </form>
    );
}
```
