# 1.2.14 (07/04/2021)

-   Moved `yupValidator` to seperate package [`typed-react-form-yup`](https://www.npmjs.com/package/typed-react-form-yup)
-   Child/array forms name prop only allows object fields now.
-   Pass FormEvent through `form.handleSubmit`
-   Allow string as argument to setErrors, which sets the error on the parent.
-   Allow validators to return undefined.

# 1.2.13 (07/04/2021)

-   The `name` prop on FormTextArea and FormSelect did not get passed to their input element.

# 1.2.12 (05/04/2021)

-   Excluding \*.modern.js files from build.

# 1.2.11 (03/04/2021)

-   Fix: return true when validate is called on a form which doesn't have a validator set.

# 1.2.10 (03/04/2021)

-   Do not reset values on `useForm` state change, because this can cause confusion.
-   `form.handleSubmit` helper function.
-   Fix: `form.setState` causing double `form.setState` call.

# 1.2.9 (12/03/2021)

-   Fixed #2: operator _short-circuiting_ caused only one error to be set when using `form.setErrors`. (#2)

# 1.2.8 (12/03/2021)

-   Object constraint on form type parameter, string constraint on error type parameter. (`FormState<T extends object, State, Error extends string>`)
-   React 17 support (#1)
-   `form.setErrors` should now be working correctly.
-   Custom error types are now correctly inferred from `useForm`:

    ```
    type Language = "error-email" | "error-password"

    const form = useForm({email: "test@gmail.com", password: ""}, yupValidator(schema, {}, (message) => message as Language));

    form.setError("email", ...); // Must be "error-email" | "error-password"
    ```
