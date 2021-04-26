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
    password: tv.string().min(1, "Please enter a password"),
});
type RegisterRequest = SchemaType<typeof RegisterRequestSchema>;

export function TypedValidationExample() {
    const form = useForm<RegisterRequest>(
        { email: "", password: "" },
        (values) => RegisterRequestSchema.validate(values),
        true
    );

    function submit() {
        // Transform if you want (will lowercase email in this case)
        console.log("submit", form.values, RegisterRequestSchema.transform(form.values));
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
