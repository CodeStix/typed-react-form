---
layout: default
parent: Reference
title: useAnyListener hook
nav_order: 25
---

# `useAnyListener`

Because this library does not rerender the whole form component when a field changes, there must be a way to get notified about state changes. This is where listeners come in.

The useAnyListener hook listens for any change on a form. Behaves a lot like [`useListener`](/typed-react-form/reference/useListener) but does not take a `name` parameter.

This hook must be called, unconditionally, at the start of your component, just like the normal React hooks.

**To listen to just one field** instead of every field, use the `useListener` hook instead.

**Use the [`AnyListener` component](/typed-react-form/reference/AnyListener) if you want to use these hooks without creating a new component each time.**

**✔️ Right usage**

```tsx
// Create seperate component
function FormStringify<T>(props: { form: FormState<T> }) {
    const { values } = useAnyListener(props.form);
    // Rerenders each time a field on 'form' changes, does not rerender parent component.
    return <pre>{JSON.stringify(values, null, 2)}</pre>;
}

function BreadForm() {
    const form = useForm < Bread > { color: "brown", size: 58 };
    return (
        <form>
            <Field form={form} type="text" name="color" />
            <Field form={form} type="number" name="size" />
            <Listener form={form} name="size" render={({ value }) => <span>{value > 50 ? "long" : "short"}</span>} />
            <FormStringify form={form} />
        </form>
    );
}
```

**❌ Wrong usage (causes form rerender)**

```tsx
function BreadForm() {
    const form = useForm < Bread > { color: "brown", size: 58 };
    const { values } = useAnyListener(form); // Causes a rerender each time something changes, WRONG!!
    return (
        <form>
            <Field form={form} type="text" name="color" />
            <Field form={form} type="number" name="size" />
            <Listener form={form} name="size" render={({ value }) => <span>{value > 50 ? "long" : "short"}</span>} />
            <pre>{JSON.stringify(values, null, 2)}</pre>;
        </form>
    );
}
```

**✔️ Right usage using `AnyListener` instead of `useAnyListener`**

```tsx
function BreadForm() {
    const form = useForm < Bread > { color: "brown", size: 58 };
    return (
        <form>
            <Field form={form} type="text" name="color" />
            <Field form={form} type="number" name="size" />
            <Listener form={form} name="size" render={({ value }) => <span>{value > 50 ? "long" : "short"}</span>} />
            {/* Rerenders each time any value on the form changes, shows a live JSON representation of the form. Does not rerender whole form. */}
            <AnyListener form={form} render={({ values }) => <pre>{JSON.stringify(values, null, 2)}</pre>} />
        </form>
    );
}
```

## Parameters

`useAnyListener(form)`

-   `form` **(required)**: the form to listen for.

## Return value

Returns the form that got passed as parameter, you can destructure it.

```tsx
// Example usage
const { values, defaultValues } = useAnyListener(form);
// Same as form.values, form.defaultValues
```
