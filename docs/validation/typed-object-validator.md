---
layout: default
parent: Validation
title: typed-object-validator
---

# typed-object-validator

To validate your form using [typed-object-validator](https://github.com/codestix/typed-object-validator), install it:

```
npm install typed-object-validator
```

Then pass the validate function of your schema to the `useForm` hook.

## Usage example

```tsx
import tv, { SchemaType } from "typed-object-validator";

const RegisterRequestSchema = tv.object({
    email: tv.email("Please enter a valid email address.").doCase("lower").min(1, "Please enter an email"),
    password: tv.string().min(1, "Please enter a password")
});
type RegisterRequest = SchemaType<typeof RegisterRequestSchema>;

export function TypedValidationExample() {
    // Make sure to use a lambda function around `Schema.validate()`
    // typed-object-validator already returns errors in the right object structure
    const form = useForm<RegisterRequest>({ email: "", password: "" }, (values) => RegisterRequestSchema.validate(values), true);

    function submit() {
        // Transform if you want (will lowercase email in this case)
        console.log("submit", form.values, RegisterRequestSchema.transform(form.values));
    }

    return (
        <form onSubmit={form.handleSubmit(submit)}>
            <Field form={form} name="email" type="email" />
            <FieldError form={form} name="email" />
            <Field form={form} name="password" type="password" />
            <FieldError form={form} name="password" />
            <button type="submit">Submit</button>
        </form>
    );
}
```
