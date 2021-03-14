# `useListener`

Because this library does not rerender the whole form component when a field changes, there must be a way to get notified about state changes. This is where listeners come in.

The useListener hook listens for changes on a specific form's field. Behaves like useState. Because this hooks causes a rerender, you **shouldn't** use
this hook in the same component as the form it is using (causes the whole form to rerender). You **should** always create a new component which contains the hook and use that. Or use the [`Listener`](/docs/Listener) component, which wraps the `useListener` hook for you.

**To listen for all form fields at once**, use the [`useAnyListener`](/docs/useAnyListener) hook instead.

**✔️ Right usage**

```jsx
interface Bread {
    color: string;
    size: number;
}

// Always create a new component when using listener hooks
function BreadSizeVisualizer(props: { form: FormState<Bread> }) {
    // Listen for changes on the size field, behaves exactly like useState
    const { value } = useListener(props.form, "size");
    // State change only rerenders this component, not parent
    return <span>{value > 50 ? "long" : "short"}</span>;
}

function BreadForm() {
    const form = useForm < Bread > { color: "brown", size: 58 };
    return (
        <form>
            <FormInput form={form} type="text" name="color" />
            <FormInput form={form} type="number" name="size" />
            <BreadSizeVisualizer form={form} />
        </form>
    );
}
```

**❌ Wrong usage (causes form rerender)**

```jsx
function BreadForm() {
    const form = useForm < Bread > { color: "brown", size: 58 };
    // Causes whole form to rerender! Is not ok!
    const { value } = useListener(form, "size");
    return (
        <form>
            <FormInput form={form} type="text" name="color" />
            <FormInput form={form} type="number" name="size" />
            <span>{value > 50 ? "long" : "short"}</span>
        </form>
    );
}
```

**✔️ Right usage using `Listener` instead of `useListener`**

```jsx
function BreadForm() {
    const form = useForm < Bread > { color: "brown", size: 58 };
    return (
        <form>
            <FormInput form={form} type="text" name="color" />
            <FormInput form={form} type="number" name="size" />
            {/* Use the Listener component, which wraps the useListener hook in a component. Does NOT cause a form rerender! */}
            <Listener form={form} name="size" render={({ value }) => <span>{value > 50 ? "long" : "short"}</span>} />
        </form>
    );
}
```

## Parameters

`useListener(form, name)`

-   `form` **(required)**: the form which contains the field to listen to.
-   `name` **(required)**: the name of the field to listen for.

## Return value

Returns a object containing the following fields, which you can destruct:

```jsx
{
    value, // Current value of the listened field
        defaultValue, // Default value of the listened field
        setValue, // Function to update the value
        dirty, // True if the field is modified (if not default value anymore)
        error, // The error on this field
        state, // The state of the form (contains isSubmitting)
        form; // The form this field belongs to
}

// Example usage
const { value, setValue, error } = useListener(form, "fieldname");
```
