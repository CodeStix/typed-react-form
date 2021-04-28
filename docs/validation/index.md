---
layout: default
title: Validation
nav_order: 2
has_children: true
---

# Validation

A validator is a function that takes form values, and returns errors for these values in the same object structure:

![example block schema](/typed-react-form/images/validator.png)

You can use a validator by passing it to the [`useForm`](/typed-react-form/reference/useForm) hook.

Its it recommended to use a validation library, as this makes the process of validating data mush easier. This library has drop-in functionallity for:

-   [yup](/typed-react-form/validation/yup): a widely used validation library
-   [typed-object-validator](/typed-react-form/validation/typed-object-validator): a typed-checked validation library

You can ofcourse use every validation library there is, but the errors must be converted to be compatible with this library.

## Example

```tsx
import { useForm, Field, FieldError, AnyListener, ErrorMap } from "typed-react-form";

interface LoginRequest {
    email: string;
    password: string;
}

// May be async if needed
function loginValidator(values: LoginRequest): ErrorMap<LoginRequest, string> {
    // Example validator logic, the returned error object should follow the same structure as the values object.
    return {
        email: values.email.length < 10 ? "Email must be longer" : undefined,
        password: values.password.length < 5 ? "Password must be longer" : undefined
    };
}

function FormExample() {
    const form = useForm<LoginRequest>(
        { email: "", password: "" },
        loginValidator, // Pass loginValidator to useForm
        true, // Validate on change (false by default)
        false // Validate on mount (false by default)
    );
    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                console.log("submit", form.values);
            }}
        >
            <Field form={form} name="email" type="email" />
            {/* Render the error between <p></p> tags, you can also specify your custom component */}
            <FieldError as="p" form={form} name="email" />
            <Field form={form} name="password" type="password" />
            <FieldError as="p" form={form} name="password" />
            {/* Listen for any change on the form, and disable the submit button when there is an error */}
            <AnyListener form={form} render={(form) => <button disabled={form.error}>Submit</button>} />
        </form>
    );
}
```
