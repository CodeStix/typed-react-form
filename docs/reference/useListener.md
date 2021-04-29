---
layout: default
parent: Reference
title: useListener hook
nav_order: 20
---

# `useListener`

This library is build upon the fact that only the things that change should rerender, for example: when the _name_ field changes, only the inputs that use the _name_ field will rerender.

The built-in form input ([`<Field/>`](/typed-react-form/reference/Field)) implements this by listening for changes only on its specified field. You can also use multiple inputs on the same field (they will the synchronized).

The useListener hook listens for changes on a specific form field. It behaves like useState. Because this hooks causes a rerender, you **shouldn't** use
this hook in the same component as the form it is using (causes the whole form to rerender). You **should** always create a new component which contains the hook and use that. Or use the [`Listener`](/typed-react-form/reference/Listener) component, which wraps the `useListener` hook for you.

This hook must be called, unconditionally, at the start of your component, just like the normal React hooks.

**To listen for all form fields at once**, use the [`useAnyListener`](/typed-react-form/reference/useAnyListener) hook instead.

**✔️ Right usage**

```tsx
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
    const form = useForm<Bread>({ color: "brown", size: 58 });
    return (
        <form>
            <Field form={form} type="text" name="color" />
            <Field form={form} type="number" name="size" />
            <BreadSizeVisualizer form={form} />
        </form>
    );
}
```

**❌ Wrong usage (causes form rerender)**

```tsx
function BreadForm() {
    const form = useForm<Bread>({ color: "brown", size: 58 });
    // Causes whole form to rerender! Is not ok!
    const { value } = useListener(form, "size");
    return (
        <form>
            <Field form={form} type="text" name="color" />
            <Field form={form} type="number" name="size" />
            <span>{value > 50 ? "long" : "short"}</span>
        </form>
    );
}
```

**✔️ Right usage using `Listener` instead of `useListener`**

```tsx
function BreadForm() {
    const form = useForm<Bread>({ color: "brown", size: 58 });
    return (
        <form>
            <Field form={form} type="text" name="color" />
            <Field form={form} type="number" name="size" />
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

Returns a `FormField` instance containing the following fields, which you can destruct:

```tsx
return {
    value, // Current value of the listened field
    defaultValue, // Default value of the listened field
    setValue, // Function to update the value
    dirty, // True if the field is modified (if not default value anymore)
    error, // The error on this field
    state, // The state of the form (contains isSubmitting)
    form // The form this field belongs to (FormState instance)
};

// Example usage
const { value, setValue, error } = useListener(form, "fieldname");
```
