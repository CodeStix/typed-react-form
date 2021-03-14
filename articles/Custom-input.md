## Example: Custom input

If the default input types (FormInput, FormSelect ...) do not provide enough functionality for you, you should create a custom input component.

![custom input](https://raw.githubusercontent.com/wiki/CodeStix/typed-react-form/images/custominput.gif)

Custom input that shows an error when needed, paints gray background when modified, gets disabled when submitting and shows its defaultValue as a placeholder. You can tweak this custom input further by implementing transformations for different input types, allowing `HTMLInputAttributes` etc.

```jsx
function CustomInput<T>(props: { form: FormState<T>; name: keyof T; children?: React.ReactNode }) {
    const { value, error, dirty, setValue, state, defaultValue } = useListener(props.form, props.name);

    // You should probably implement some value transformations instead of using 'as any' (for number and date fields ...)
    return (
        <label style={{ display: "block" }}>
            {props.children}
            <input
                style={{ border: error ? "1px solid red" : undefined, background: dirty ? "#eee" : undefined }}
                disabled={state.isSubmitting}
                placeholder={defaultValue as any}
                value={value as any}
                onChange={(ev) => setValue(ev.target.value as any)}
            />
            {error && <p style={{ color: "red" }}>{error}</p>}
        </label>
    );
}

function ExampleForm() {
    const form = useForm(
        {
            firstName: "John",
            lastName: "Pineapple"
        },
        (values) => ({ firstName: values.firstName.length < 3 ? "Firstname must be longer!" : undefined }) // Example validator
    );
    return (
        <form
            style={{ margin: "1em" }}
            onReset={() => form.resetAll()}
            onSubmit={async (ev) => {
                ev.preventDefault();
                if (form.error) return;
                form.setState({ isSubmitting: true });
                console.log("submit", form.values);
            }}
        >
            <CustomInput form={form} name="firstName" />
            <CustomInput form={form} name="lastName" />
            <button>Submit</button>
            <button type="reset">Reset</button>
        </form>
    );
}
```

## Example: Submit button that disables when unmodified/error

![live updating form values](https://raw.githubusercontent.com/wiki/CodeStix/typed-react-form/images/submitbutton.gif)

```jsx
function FormExample() {
    const form = useForm(
        {
            name: "John",
        },
        (values) => ({ name: values.name.length < 3 ? "Name must be longer" : undefined }) // Example validator
    );
    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                console.log("save", form.values);
                form.setDefaultValues(form.values);
            }}>
            <FormInput form={form} name="name" />
            {/* Listen for any change on the form */}
            <AnyListener form={form} render={(form) => <button disabled={!form.dirty || form.error}>Save</button>} />
        </form>
    );
}
```
